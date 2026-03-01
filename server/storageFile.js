import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const FILE = path.join(DATA_DIR, 'trips.json');
let writeLock = Promise.resolve();

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readFile() {
  await ensureDir();
  try {
    const raw = await fs.readFile(FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') return { trips: [] };
    throw err;
  }
}

function writeFile(data) {
  writeLock = writeLock.then(async () => {
    await ensureDir();
    const tmp = FILE + '.tmp';
    await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf8');
    await fs.rename(tmp, FILE);
  });
  return writeLock;
}

/**
 * Retrieve all saved trips from storage
 * @returns {Promise<Trip[]>} Array of all trips
 */
export async function getAllTrips() {
  const data = await readFile();
  return data.trips || [];
}

/**
 * Create a new trip with checklist items
 * @param {TripParams} tripParams - Trip parameters including destinationType, duration, and optional checklist
 * @returns {Promise<Trip>} The created trip object with generated ID and timestamp
 * @example
 * const trip = await createTrip({
 *   destinationType: 'beach',
 *   duration: 5,
 *   checklist: [
 *     { label: 'Sunscreen', completed: false },
 *     { label: 'Passport', completed: false }
 *   ]
 * });
 */
export async function createTrip(tripParams) {
  const data = await readFile();
  const newTrip = {
    id: uuidv4(),
    ...tripParams,
    createdAt: new Date().toISOString()
  };
  data.trips = data.trips || [];
  data.trips.push(newTrip);
  await writeFile(data);
  return newTrip;
}

/**
 * Retrieve a single trip by ID
 * @param {string} tripId - UUID of the trip to retrieve
 * @returns {Promise<Trip|null>} The trip object, or null if not found
 */
export async function getTripById(tripId) {
  const data = await readFile();
  return (data.trips || []).find(t => t.id === tripId) || null;
}

/**
 * Update an existing trip by ID
 * @param {string} tripId - UUID of the trip to update
 * @param {Partial<Trip>} updates - Partial trip object with fields to update
 * @returns {Promise<Trip>} The updated trip object
 * @throws {Error} If trip with given ID is not found
 * @example
 * const updated = await updateTrip(tripId, {
 *   duration: 7,
 *   checklist: [
 *     { label: 'Updated item', completed: true }
 *   ]
 * });
 */
export async function updateTrip(tripId, updates) {
  const data = await readFile();
  const trip = (data.trips || []).find(t => t.id === tripId);
  if (!trip) {
    const err = new Error(`Trip ${tripId} not found`);
    err.code = 'TRIP_NOT_FOUND';
    throw err;
  }
  Object.assign(trip, updates);
  await writeFile(data);
  return trip;
}


