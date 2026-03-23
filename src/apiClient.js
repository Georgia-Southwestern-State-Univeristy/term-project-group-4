const BASE = '/api';

/**
 * Extract error message from response body or return generic fallback
 */
async function getErrorMessage(res) {
  try {
    const body = await res.json();
    return body.error || body.message || `Error ${res.status}`;
  } catch {
    return `Error ${res.status}`;
  }
}

export async function getTrips() {
  const res = await fetch(`${BASE}/trips`);
  if (!res.ok) throw new Error(await getErrorMessage(res));
  return res.json();
}

export async function saveTrip(tripData) {
  const res = await fetch(`${BASE}/saveTrip`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tripData),
  });
  if (!res.ok) throw new Error(await getErrorMessage(res));
  return res.json();
}

export async function updateTrip(tripId, updates) {
  const res = await fetch(`${BASE}/trips/${tripId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error(await getErrorMessage(res));
  return res.json();
}

export async function deleteTrip(tripId) {
  const res = await fetch(`${BASE}/trips/${encodeURIComponent(tripId)}`, {
    method: 'DELETE',
  });

  if (!res.ok) throw new Error(await getErrorMessage(res));
}
