import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import request from 'supertest';

// Set test env before importing app
process.env.NODE_ENV = 'test';
import { migrateLatest, destroyDb, db, findOrCreateUser } from '../server/storage.js';
const { app } = await import('../server.js');

let userAId;
let userBId;

// Run migrations once, then clean tables before each test
beforeAll(async () => {
  await migrateLatest();

  const userA = await findOrCreateUser({
    id: 'test-google-id-a',
    emails: [{ value: 'usera@example.com' }],
    displayName: 'User A',
    photos: [],
  });

  const userB = await findOrCreateUser({
    id: 'test-google-id-b',
    emails: [{ value: 'userb@example.com' }],
    displayName: 'User B',
    photos: [],
  });

  userAId = userA.id;
  userBId = userB.id;
});

beforeEach(async () => {
  await db('checklist_items').del();
  await db('trips').del();
});

afterAll(async () => {
  await destroyDb();
});

// Helper function to add test user authentication header
function authRequest(method, path, userId = userAId) {
  return request(app)[method](path).set('x-test-user-id', userId);
}

describe('Authentication enforcement', () => {
  it('returns health without requiring auth', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.environment).toBe('test');
    expect(typeof res.body.requestId).toBe('string');
    expect(res.body.requestId.length).toBeGreaterThan(0);
    expect(typeof res.body.uptimeSeconds).toBe('number');
    expect(res.body.config.valid).toBe(true);
    expect(res.body.database.path).toBe(':memory:');
    expect(res.body.database.writable).toBe(true);
    expect(res.headers['x-request-id']).toBe(res.body.requestId);
  });

  it('returns 401 when GET /api/trips is called without auth', async () => {
    const res = await request(app).get('/api/trips');
    expect(res.status).toBe(401);
  });

  it('returns 401 when POST /api/saveTrip is called without auth', async () => {
    const res = await request(app).post('/api/saveTrip').send({
      name: 'Unauthorized Trip',
      destinationType: 'beach',
      duration: 3,
      checklist: [],
    });
    expect(res.status).toBe(401);
    expect(typeof res.headers['x-request-id']).toBe('string');
  });
});

describe('Observability behavior', () => {
  it('reuses caller-provided x-request-id for correlation', async () => {
    const requestId = 'obs-test-request-id-123';

    const res = await request(app)
      .get('/health')
      .set('x-request-id', requestId);

    expect(res.status).toBe(200);
    expect(res.headers['x-request-id']).toBe(requestId);
    expect(res.body.requestId).toBe(requestId);
  });

  it('sanitizes invalid x-request-id values before echoing response headers', async () => {
    const invalidRequestId = 'x'.repeat(200);

    const res = await request(app)
      .get('/health')
      .set('x-request-id', invalidRequestId);

    expect(res.status).toBe(200);
    expect(res.headers['x-request-id']).not.toBe(invalidRequestId);
    expect(res.headers['x-request-id']).toBe(res.body.requestId);
    expect(res.headers['x-request-id'].length).toBeLessThanOrEqual(128);
    expect(res.headers['x-request-id']).toMatch(/^[A-Za-z0-9._-]+$/);
  });

  it('returns requestId in not-found responses', async () => {
    const res = await request(app).get('/route-that-does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Not found');
    expect(typeof res.body.requestId).toBe('string');
    expect(res.body.requestId.length).toBeGreaterThan(0);
    expect(res.headers['x-request-id']).toBe(res.body.requestId);
  });
});


describe('Test-mode auth consistency', () => {
  it('returns the authenticated test user from GET /auth/user when x-test-user-id is present', async () => {
    const res = await request(app)
      .get('/auth/user')
      .set('x-test-user-id', userAId);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(userAId);
    expect(res.body.google_id).toBe(userAId);
    expect(res.body.name).toBe('Playwright Test User');
  });

  it('returns 401 from GET /auth/user when test auth header is missing', async () => {
    const res = await request(app).get('/auth/user');

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Not authenticated');
  });

  it('allows GET /auth/logout in test mode without Passport session state', async () => {
    const res = await request(app)
      .get('/auth/logout')
      .set('x-test-user-id', userAId);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, testMode: true });
  });
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

    const res = await authRequest('post', '/api/saveTrip').send(tripData);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Test Beach Trip');
    expect(res.body.destinationType).toBe('beach');
    expect(res.body.duration).toBe(5);
    expect(res.body.checklist).toHaveLength(1);
    expect(res.body).toHaveProperty('createdAt');
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await authRequest('post', '/api/saveTrip').send({ name: 'Incomplete' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Missing required fields/);
  });

  it('returns 400 when duration is not a positive integer', async () => {
    const res = await authRequest('post', '/api/saveTrip').send({
      name: 'Bad Duration Trip',
      destinationType: 'beach',
      duration: -3,
      checklist: [],
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/positive integer/);
  });

  it('returns 400 when duration is zero', async () => {
    const res = await authRequest('post', '/api/saveTrip').send({
      name: 'Zero Duration Trip',
      destinationType: 'beach',
      duration: 0,
      checklist: [],
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/positive integer/);
  });

  it('returns 400 when checklist item missing packed field', async () => {
    const res = await authRequest('post', '/api/saveTrip').send({
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
    const res = await authRequest('post', '/api/saveTrip').send({
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
    const res = await authRequest('post', '/api/saveTrip').send({
      name: '   ',
      destinationType: 'beach',
      duration: 3,
      checklist: [],
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Missing required fields/);
  });

  it('returns 400 when destinationType is whitespace-only', async () => {
    const res = await authRequest('post', '/api/saveTrip').send({
      name: 'Valid Name',
      destinationType: '   ',
      duration: 3,
      checklist: [],
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Missing required fields/);
  });

  it('returns 400 when checklist item missing category field', async () => {
    const res = await authRequest('post', '/api/saveTrip').send({
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

  it('returns 400 when name exceeds 100 characters', async () => {
    const res = await authRequest('post', '/api/saveTrip').send({
      name: 'a'.repeat(101),
      destinationType: 'beach',
      duration: 3,
      checklist: [],
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('name must be 100 characters or fewer');
  });

  it('returns 400 when destinationType exceeds 50 characters', async () => {
    const res = await authRequest('post', '/api/saveTrip').send({
      name: 'Valid Name',
      destinationType: 'b'.repeat(51),
      duration: 3,
      checklist: [],
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('destinationType must be 50 characters or fewer');
  });
});

describe('GET /api/trips', () => {
  it('returns only the authenticated user’s trips', async () => {
    await authRequest('post', '/api/saveTrip', userAId).send({
      name: 'User A Trip',
      destinationType: 'city',
      duration: 3,
      checklist: [],
    });

    await authRequest('post', '/api/saveTrip', userBId).send({
      name: 'User B Trip',
      destinationType: 'beach',
      duration: 4,
      checklist: [],
    });

    const resA = await authRequest('get', '/api/trips', userAId);
    const resB = await authRequest('get', '/api/trips', userBId);

    expect(resA.status).toBe(200);
    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].name).toBe('User A Trip');

    expect(resB.status).toBe(200);
    expect(resB.body).toHaveLength(1);
    expect(resB.body[0].name).toBe('User B Trip');
  });
});

describe('GET /api/trips/:tripId', () => {
  it('returns a single trip by ID to its owner', async () => {
    const create = await authRequest('post', '/api/saveTrip', userAId).send({
      name: 'Beach Getaway',
      destinationType: 'beach',
      duration: 4,
      checklist: [
        { id: 'item-0', name: 'Sunscreen', category: 'Beach', packed: false },
      ],
    });

    const res = await authRequest('get', `/api/trips/${create.body.id}`, userAId);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(create.body.id);
    expect(res.body.name).toBe('Beach Getaway');
    expect(res.body.checklist).toHaveLength(1);
  });

  it('returns 404 when another user tries to access a trip by ID', async () => {
    const create = await authRequest('post', '/api/saveTrip', userAId).send({
      name: 'Private Trip',
      destinationType: 'city',
      duration: 2,
      checklist: [],
    });

    const res = await authRequest('get', `/api/trips/${create.body.id}`, userBId);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Trip not found');
  });

  it('returns 404 for a non-existent trip id', async () => {
    const res = await authRequest('get', '/api/trips/does-not-exist', userAId);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Trip not found');
  });

  it('returns updated data after a PUT modification', async () => {
    const create = await authRequest('post', '/api/saveTrip', userAId).send({
      name: 'Mountain Hike',
      destinationType: 'outdoors',
      duration: 3,
      checklist: [
        { id: 'item-0', name: 'Hiking boots', category: 'Gear', packed: false },
      ],
    });
    expect(create.status).toBe(201);
    const tripId = create.body.id;

    const update = await authRequest('put', `/api/trips/${tripId}`, userAId).send({
      duration: 5,
      checklist: [
        { id: 'item-0', name: 'Hiking boots', category: 'Gear', packed: true },
      ],
    });
    expect(update.status).toBe(200);

    const res = await authRequest('get', `/api/trips/${tripId}`, userAId);

    expect(res.status).toBe(200);
    expect(res.body.duration).toBe(5);
    expect(res.body.checklist[0].packed).toBe(true);
  });
});

describe('GET /api/trips/:tripId (boundary)', () => {
  it('getTripById returns null when trip does not exist for that user', async () => {
    const { getTripById } = await import('../server/storage.js');

    const result = await getTripById('any-id-that-does-not-exist', userAId);

    expect(result).toBeNull();
  });
});

describe('PUT /api/trips/:tripId', () => {
  it('updates checklist on an existing trip', async () => {
    const create = await authRequest('post', '/api/saveTrip', userAId).send({
      name: 'Outdoors Trip',
      destinationType: 'outdoors',
      duration: 4,
      checklist: [
        { id: 'item-0', name: 'Hiking boots', category: 'Outdoors', packed: false },
      ],
    });
    const tripId = create.body.id;

    const updatedChecklist = [
      { id: 'item-0', name: 'Hiking boots', category: 'Outdoors', packed: true },
    ];
    const res = await authRequest('put', `/api/trips/${tripId}`, userAId)
      .send({ checklist: updatedChecklist });

    expect(res.status).toBe(200);
    expect(res.body.checklist[0].packed).toBe(true);
  });

  it('returns 404 when another user tries to update a trip', async () => {
    const create = await authRequest('post', '/api/saveTrip', userAId).send({
      name: 'User A Trip',
      destinationType: 'city',
      duration: 3,
      checklist: [],
    });

    const res = await authRequest('put', `/api/trips/${create.body.id}`, userBId)
      .send({ duration: 5 });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Trip not found');
  });

  it('returns 404 for a non-existent trip id', async () => {
    const res = await authRequest('put', '/api/trips/does-not-exist', userAId)
      .send({ duration: 5 });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Trip not found');
  });

  it('returns 400 when duration is not a positive integer', async () => {
    const create = await authRequest('post', '/api/saveTrip', userAId).send({
      name: 'Validation Trip',
      destinationType: 'city',
      duration: 3,
      checklist: [],
    });

    const res = await authRequest('put', `/api/trips/${create.body.id}`, userAId)
      .send({ duration: -1 });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/positive integer/);
  });

  it('returns 400 when name update is whitespace-only', async () => {
    const create = await authRequest('post', '/api/saveTrip', userAId).send({
      name: 'Whitespace Test',
      destinationType: 'city',
      duration: 3,
      checklist: [],
    });

    const res = await authRequest('put', `/api/trips/${create.body.id}`, userAId)
      .send({ name: '   ' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/name must not be blank/);
  });

  it('returns 400 when destinationType update is whitespace-only', async () => {
    const create = await authRequest('post', '/api/saveTrip', userAId).send({
      name: 'Whitespace Test',
      destinationType: 'city',
      duration: 3,
      checklist: [],
    });

    const res = await authRequest('put', `/api/trips/${create.body.id}`, userAId)
      .send({ destinationType: '   ' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/destinationType must not be blank/);
  });

  it('returns 400 when name update exceeds 100 characters', async () => {
    const create = await authRequest('post', '/api/saveTrip', userAId).send({
      name: 'Length Test',
      destinationType: 'city',
      duration: 3,
      checklist: [],
    });

    const res = await authRequest('put', `/api/trips/${create.body.id}`, userAId)
      .send({ name: 'a'.repeat(101) });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('name must be 100 characters or fewer');
  });

  it('returns 400 when destinationType update exceeds 50 characters', async () => {
    const create = await authRequest('post', '/api/saveTrip', userAId).send({
      name: 'Length Test',
      destinationType: 'city',
      duration: 3,
      checklist: [],
    });

    const res = await authRequest('put', `/api/trips/${create.body.id}`, userAId)
      .send({ destinationType: 'b'.repeat(51) });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('destinationType must be 50 characters or fewer');
  });
});

describe('DELETE /api/trips/:tripId', () => {
  it('deletes an existing trip and returns 204', async () => {
    const create = await authRequest('post', '/api/saveTrip', userAId).send({
      name: 'Doomed Trip',
      destinationType: 'beach',
      duration: 2,
      checklist: [
        { id: 'item-0', name: 'Sunscreen', category: 'Beach', packed: false },
      ],
    });
    const tripId = create.body.id;

    const res = await authRequest('delete', `/api/trips/${tripId}`, userAId);
    expect(res.status).toBe(204);

    const get = await authRequest('get', `/api/trips/${tripId}`, userAId);
    expect(get.status).toBe(404);
  });

  it('returns 404 when another user tries to delete a trip', async () => {
    const create = await authRequest('post', '/api/saveTrip', userAId).send({
      name: 'User A Trip',
      destinationType: 'city',
      duration: 3,
      checklist: [],
    });

    const res = await authRequest('delete', `/api/trips/${create.body.id}`, userBId);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Trip not found');
  });

  it('returns 404 for a non-existent trip id', async () => {
    const res = await authRequest('delete', '/api/trips/does-not-exist', userAId);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Trip not found');
  });

  it('deleted trips no longer appear in GET /api/trips', async () => {
    const create1 = await authRequest('post', '/api/saveTrip', userAId).send({
      name: 'Trip One',
      destinationType: 'city',
      duration: 2,
      checklist: [],
    });

    await authRequest('post', '/api/saveTrip', userAId).send({
      name: 'Trip Two',
      destinationType: 'beach',
      duration: 4,
      checklist: [],
    });

    await authRequest('delete', `/api/trips/${create1.body.id}`, userAId);

    const list = await authRequest('get', '/api/trips', userAId);

    expect(list.status).toBe(200);
    expect(list.body).toHaveLength(1);
    expect(list.body[0].name).toBe('Trip Two');
  });

  it('cascade-deletes checklist items', async () => {
    const create = await authRequest('post', '/api/saveTrip', userAId).send({
      name: 'Cascade Test',
      destinationType: 'city',
      duration: 1,
      checklist: [
        { id: 'item-0', name: 'Item A', category: 'Test', packed: false },
        { id: 'item-1', name: 'Item B', category: 'Test', packed: false },
      ],
    });

    await authRequest('delete', `/api/trips/${create.body.id}`, userAId);

    const remaining = await db('checklist_items')
      .where('trip_id', create.body.id);
    expect(remaining).toHaveLength(0);
  });
});