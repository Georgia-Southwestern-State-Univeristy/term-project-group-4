import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import request from 'supertest';

// Set test env before importing app
process.env.NODE_ENV = 'test';
import { migrateLatest, destroyDb, db } from '../server/storage.js';
const { app } = await import('../server.js');

// Run migrations once, then clean tables before each test
beforeAll(async () => {
  await migrateLatest();
});

beforeEach(async () => {
  await db('checklist_items').del();
  await db('trips').del();
});

afterAll(async () => {
  await destroyDb();
});

describe('POST /api/saveTrip', () => {
  it('creates a trip and returns it with an id', async () => {
    const tripData = {
      name: 'Test Beach Trip',
      destinationType: 'beach',
      duration: 5,
      checklist: [
        { id: 'item-0', name: 'Sunscreen', category: 'Beach', packed: false },
      ],
    };

    const res = await request(app).post('/api/saveTrip').send(tripData);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Test Beach Trip');
    expect(res.body.destinationType).toBe('beach');
    expect(res.body.duration).toBe(5);
    expect(res.body.checklist).toHaveLength(1);
    expect(res.body).toHaveProperty('createdAt');
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app).post('/api/saveTrip').send({ name: 'Incomplete' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Missing required fields/);
  });

  it('returns 400 when duration is not a positive integer', async () => {
    const res = await request(app).post('/api/saveTrip').send({
      name: 'Bad Duration Trip',
      destinationType: 'beach',
      duration: -3,
      checklist: [],
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/positive integer/);
  });

  it('returns 400 when duration is zero', async () => {
    const res = await request(app).post('/api/saveTrip').send({
      name: 'Zero Duration Trip',
      destinationType: 'beach',
      duration: 0,
      checklist: [],
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/positive integer/);
  });

  it('returns 400 when checklist item missing packed field', async () => {
    const res = await request(app).post('/api/saveTrip').send({
      name: 'Invalid Checklist Trip',
      destinationType: 'beach',
      duration: 5,
      checklist: [
        { id: 'item-0', name: 'Sunscreen', category: 'Beach', completed: true },
      ],
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid checklist payload');
    expect(res.body.message).toMatch(/packed.*boolean/);
  });

  it('returns 400 when checklist item missing id field', async () => {
    const res = await request(app).post('/api/saveTrip').send({
      name: 'Invalid Checklist Trip',
      destinationType: 'beach',
      duration: 5,
      checklist: [
        { name: 'Sunscreen', category: 'Beach', packed: false },
      ],
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid checklist payload');
    expect(res.body.message).toMatch(/id.*string/);
  });

  it('returns 400 when name is whitespace-only', async () => {
    const res = await request(app).post('/api/saveTrip').send({
      name: '   ',
      destinationType: 'beach',
      duration: 3,
      checklist: [],
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Missing required fields/);
  });

  it('returns 400 when destinationType is whitespace-only', async () => {
    const res = await request(app).post('/api/saveTrip').send({
      name: 'Valid Name',
      destinationType: '   ',
      duration: 3,
      checklist: [],
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Missing required fields/);
  });

  it('returns 400 when checklist item missing category field', async () => {
    const res = await request(app).post('/api/saveTrip').send({
      name: 'Invalid Checklist Trip',
      destinationType: 'beach',
      duration: 5,
      checklist: [
        { id: 'item-0', name: 'Sunscreen', packed: false },
      ],
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid checklist payload');
    expect(res.body.message).toMatch(/category.*string/);
  });

  it('trims leading/trailing whitespace and saves valid values', async () => {
    const res = await request(app).post('/api/saveTrip').send({
      name: '  Weekend Escape  ',
      destinationType: '  beach  ',
      duration: 2,
      checklist: [],
    });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Weekend Escape');
    expect(res.body.destinationType).toBe('beach');
  });
});

describe('GET /api/trips', () => {
  it('returns saved trips after creation', async () => {
    // Create a trip first
    await request(app).post('/api/saveTrip').send({
      name: 'City Trip',
      destinationType: 'city',
      duration: 3,
      checklist: [],
    });

    const res = await request(app).get('/api/trips');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('City Trip');
  });
});

describe('GET /api/trips/:tripId', () => {
  it('returns a single trip by ID', async () => {
    const create = await request(app).post('/api/saveTrip').send({
      name: 'Beach Getaway',
      destinationType: 'beach',
      duration: 4,
      checklist: [
        { id: 'item-0', name: 'Sunscreen', category: 'Beach', packed: false },
      ],
    });

    const res = await request(app).get(`/api/trips/${create.body.id}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(create.body.id);
    expect(res.body.name).toBe('Beach Getaway');
    expect(res.body.checklist).toHaveLength(1);
  });

  it('returns 404 for a non-existent trip id', async () => {
    const res = await request(app).get('/api/trips/does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Trip not found');
  });

  it('returns updated data after a PUT modification', async () => {
    // Create a trip
    const create = await request(app).post('/api/saveTrip').send({
      name: 'Mountain Hike',
      destinationType: 'outdoors',
      duration: 3,
      checklist: [
        { id: 'item-0', name: 'Hiking boots', category: 'Gear', packed: false },
      ],
    });
    expect(create.status).toBe(201);
    const tripId = create.body.id;

    // Update the trip — mark item packed and change duration
    const update = await request(app)
      .put(`/api/trips/${tripId}`)
      .send({
        duration: 5,
        checklist: [
          { id: 'item-0', name: 'Hiking boots', category: 'Gear', packed: true },
        ],
      });
    expect(update.status).toBe(200);

    // Retrieve and verify the update is persisted
    const res = await request(app).get(`/api/trips/${tripId}`);

    expect(res.status).toBe(200);
    expect(res.body.duration).toBe(5);
    expect(res.body.checklist[0].packed).toBe(true);
  });
});

describe('GET /api/trips/:tripId (boundary)', () => {
  it('getTripById returns null when trip does not exist', async () => {
    const { getTripById } = await import('../server/storage.js');

    const result = await getTripById('any-id-that-does-not-exist');

    expect(result).toBeNull();
  });
});

describe('PUT /api/trips/:tripId', () => {
  it('updates checklist on an existing trip', async () => {
    // Create a trip
    const create = await request(app).post('/api/saveTrip').send({
      name: 'Outdoors Trip',
      destinationType: 'outdoors',
      duration: 4,
      checklist: [
        { id: 'item-0', name: 'Hiking boots', category: 'Outdoors', packed: false },
      ],
    });
    const tripId = create.body.id;

    // Update checklist — mark item as packed
    const updatedChecklist = [
      { id: 'item-0', name: 'Hiking boots', category: 'Outdoors', packed: true },
    ];
    const res = await request(app)
      .put(`/api/trips/${tripId}`)
      .send({ checklist: updatedChecklist });

    expect(res.status).toBe(200);
    expect(res.body.checklist[0].packed).toBe(true);
  });

  it('returns 404 for a non-existent trip id', async () => {
    const res = await request(app)
      .put('/api/trips/does-not-exist')
      .send({ duration: 5 });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Trip not found');
  });

  it('returns 400 when duration is not a positive integer', async () => {
    const create = await request(app).post('/api/saveTrip').send({
      name: 'Validation Trip',
      destinationType: 'city',
      duration: 3,
      checklist: [],
    });

    const res = await request(app)
      .put(`/api/trips/${create.body.id}`)
      .send({ duration: -1 });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/positive integer/);
  });

  it('returns 400 when name update is whitespace-only', async () => {
    const create = await request(app).post('/api/saveTrip').send({
      name: 'Whitespace Test',
      destinationType: 'city',
      duration: 3,
      checklist: [],
    });

    const res = await request(app)
      .put(`/api/trips/${create.body.id}`)
      .send({ name: '   ' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/name must not be blank/);
  });

  it('returns 400 when destinationType update is whitespace-only', async () => {
    const create = await request(app).post('/api/saveTrip').send({
      name: 'Whitespace Test',
      destinationType: 'city',
      duration: 3,
      checklist: [],
    });

    const res = await request(app)
      .put(`/api/trips/${create.body.id}`)
      .send({ destinationType: '   ' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/destinationType must not be blank/);
  });

  it('trims leading/trailing whitespace on name and destinationType updates', async () => {
    const create = await request(app).post('/api/saveTrip').send({
      name: 'Base Trip',
      destinationType: 'city',
      duration: 3,
      checklist: [],
    });

    const update = await request(app)
      .put(`/api/trips/${create.body.id}`)
      .send({
        name: '  Updated Trip  ',
        destinationType: '  outdoors  ',
      });

    expect(update.status).toBe(200);
    expect(update.body.name).toBe('Updated Trip');
    expect(update.body.destinationType).toBe('outdoors');
  });
});

describe('DELETE /api/trips/:tripId', () => {
  it('deletes an existing trip and returns 204', async () => {
    const create = await request(app).post('/api/saveTrip').send({
      name: 'Doomed Trip',
      destinationType: 'beach',
      duration: 2,
      checklist: [
        { id: 'item-0', name: 'Sunscreen', category: 'Beach', packed: false },
      ],
    });
    const tripId = create.body.id;

    const res = await request(app).delete(`/api/trips/${tripId}`);
    expect(res.status).toBe(204);

    // Verify it's gone
    const get = await request(app).get(`/api/trips/${tripId}`);
    expect(get.status).toBe(404);
  });

  it('returns 404 for a non-existent trip id', async () => {
    const res = await request(app).delete('/api/trips/does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Trip not found');
  });

  it('deleted trips no longer appear in GET /api/trips', async () => {
    const create1 = await request(app).post('/api/saveTrip').send({
      name: 'Trip One',
      destinationType: 'city',
      duration: 2,
      checklist: [],
    });

    await request(app).post('/api/saveTrip').send({
      name: 'Trip Two',
      destinationType: 'beach',
      duration: 4,
      checklist: [],
    });

    await request(app).delete(`/api/trips/${create1.body.id}`);

    const list = await request(app).get('/api/trips');

    expect(list.status).toBe(200);
    expect(list.body).toHaveLength(1);
    expect(list.body[0].name).toBe('Trip Two');
  });

  it('cascade-deletes checklist items', async () => {
    const create = await request(app).post('/api/saveTrip').send({
      name: 'Cascade Test',
      destinationType: 'city',
      duration: 1,
      checklist: [
        { id: 'item-0', name: 'Item A', category: 'Test', packed: false },
        { id: 'item-1', name: 'Item B', category: 'Test', packed: false },
      ],
    });

    await request(app).delete(`/api/trips/${create.body.id}`);

    // Verify checklist items are also removed
    const remaining = await db('checklist_items')
      .where('trip_id', create.body.id);
    expect(remaining).toHaveLength(0);
  });
});