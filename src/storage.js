import { getTrips, saveTrip, updateTrip } from './apiClient.js';

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

