import { getTrips, saveTrip, updateTrip } from './apiClient.js';

const STORAGE_KEY = 'smart-packing-checklist';

/**
 * Save the current trip and checklist state to localStorage (local cache).
 * @param {{ tripParams: object, checklist: Array }} state
 */
export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/**
 * Load saved state from localStorage (local cache).
 * @returns {{ tripParams: object, checklist: Array } | null}
 */
export function loadState() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : null;
}

/**
 * Clear saved state from localStorage.
 */
export function clearState() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Load all trips from the server.
 * @returns {Promise<Array>}
 */
export async function loadTripsFromServer() {
  return getTrips();
}

/**
 * Save a trip to the server.
 * @param {{ name: string, destinationType: string, duration: number, checklist: Array }} tripData
 * @returns {Promise<object>} The saved trip with server-assigned ID
 */
export async function saveTripToServer(tripData) {
  return saveTrip(tripData);
}

/**
 * Update a trip on the server.
 * @param {string} tripId
 * @param {object} updates
 * @returns {Promise<object>}
 */
export async function updateTripOnServer(tripId, updates) {
  return updateTrip(tripId, updates);
}
