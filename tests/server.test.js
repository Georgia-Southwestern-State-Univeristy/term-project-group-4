import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { promises as fs } from 'fs';
import path from 'path';

// Set test env before importing app
process.env.NODE_ENV = 'test';
const { app } = await import('../server.js');

const DATA_DIR = path.resolve(process.cwd(), 'data');
const FILE = path.join(DATA_DIR, 'trips.json');

// Clean up test data before each test
beforeEach(async () => {
  try {
    await fs.unlink(FILE);
  } catch {
    // file may not exist, that's fine
  }
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
  it('getTripById returns null when data file is absent', async () => {
    const { getTripById } = await import('../server/storageFile.js');

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
});
