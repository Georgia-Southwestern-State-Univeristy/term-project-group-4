const BASE = '/api';

export async function getTrips() {
  const res = await fetch(`${BASE}/trips`);
  if (!res.ok) throw new Error(`Failed to fetch trips: ${res.status}`);
  return res.json();
}

export async function saveTrip(tripData) {
  const res = await fetch(`${BASE}/saveTrip`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tripData),
  });
  if (!res.ok) throw new Error(`Failed to save trip: ${res.status}`);
  return res.json();
}

export async function updateTrip(tripId, updates) {
  const res = await fetch(`${BASE}/trips/${tripId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error(`Failed to update trip: ${res.status}`);
  return res.json();
}
