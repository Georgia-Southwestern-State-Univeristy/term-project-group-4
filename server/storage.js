import knex from 'knex';
import knexConfig from '../knexfile.js';
import { v4 as uuidv4 } from 'uuid';

const env = process.env.NODE_ENV || 'development';
export const db = knex(knexConfig[env]);

/**
 * Run migrations (called once at startup or in tests).
 */
export async function migrateLatest() {
  await db.migrate.latest();
}

/**
 * Destroy the database connection (for clean test teardown).
 */
export async function destroyDb() {
  await db.destroy();
}

// ── helpers ──────────────────────────────────────────────────────────

function rowToTrip(tripRow, itemRows) {
  return {
    id: tripRow.id,
    name: tripRow.name,
    destinationType: tripRow.destination_type,
    duration: tripRow.duration,
    createdAt: tripRow.created_at,
    checklist: itemRows.map((r) => ({
      id: r.id,
      name: r.name,
      category: r.category,
      packed: Boolean(r.packed),
    })),
  };
}

// ── public API (ownership-aware) ─────────────────────────────────────

export async function getAllTrips(userId) {
  const trips = await db('trips')
    .where('user_id', userId)
    .orderBy('created_at', 'desc');

  if (trips.length === 0) return [];

  const items = await db('checklist_items')
    .whereIn('trip_id', trips.map((t) => t.id))
    .orderBy('sort_order');

  const itemsByTrip = Object.groupBy
    ? Object.groupBy(items, (i) => i.trip_id)
    : items.reduce((acc, i) => {
        (acc[i.trip_id] ||= []).push(i);
        return acc;
      }, {});

  return trips.map((t) => rowToTrip(t, itemsByTrip[t.id] || []));
}

export async function getTripById(tripId, userId) {
  const tripRow = await db('trips')
    .where({ id: tripId, user_id: userId })
    .first();

  if (!tripRow) return null;

  const itemRows = await db('checklist_items')
    .where('trip_id', tripId)
    .orderBy('sort_order');

  return rowToTrip(tripRow, itemRows);
}

export async function createTrip(tripParams) {
  const id = uuidv4();
  const createdAt = new Date().toISOString();

  await db.transaction(async (trx) => {
    await trx('trips').insert({
      id,
      user_id: tripParams.userId,
      name: tripParams.name,
      destination_type: tripParams.destinationType,
      duration: tripParams.duration,
      created_at: createdAt,
    });

    if (tripParams.checklist?.length) {
      await trx('checklist_items').insert(
        tripParams.checklist.map((item, i) => ({
          id: item.id,
          trip_id: id,
          name: item.name,
          category: item.category,
          packed: item.packed ?? false,
          sort_order: i,
        })),
      );
    }
  });

  return getTripById(id, tripParams.userId);
}

export async function updateTrip(tripId, userId, updates) {
  const existing = await db('trips')
    .where({ id: tripId, user_id: userId })
    .first();

  if (!existing) {
    const err = new Error(`Trip ${tripId} not found`);
    err.code = 'TRIP_NOT_FOUND';
    throw err;
  }

  await db.transaction(async (trx) => {
    const cols = {};
    if (updates.name !== undefined) cols.name = updates.name;
    if (updates.destinationType !== undefined) cols.destination_type = updates.destinationType;
    if (updates.duration !== undefined) cols.duration = updates.duration;

    if (Object.keys(cols).length) {
      await trx('trips')
        .where({ id: tripId, user_id: userId })
        .update(cols);
    }

    if (updates.checklist !== undefined) {
      await trx('checklist_items').where('trip_id', tripId).del();
      if (updates.checklist.length) {
        await trx('checklist_items').insert(
          updates.checklist.map((item, i) => ({
            id: item.id,
            trip_id: tripId,
            name: item.name,
            category: item.category,
            packed: item.packed ?? false,
            sort_order: i,
          })),
        );
      }
    }
  });

  return getTripById(tripId, userId);
}

export async function deleteTrip(tripId, userId) {
  const count = await db('trips')
    .where({ id: tripId, user_id: userId })
    .del();

  if (count === 0) {
    const err = new Error(`Trip ${tripId} not found`);
    err.code = 'TRIP_NOT_FOUND';
    throw err;
  }
}