import { initTripForm } from './tripForm.js';
import { loadTripsFromServer } from './storage.js';

function renderSavedTrips(trips, loadTrip) {
  const list = document.getElementById('saved-trips-list');
  const noTripsMsg = document.getElementById('no-trips-message');

  list.innerHTML = '';

  if (trips.length === 0) {
    noTripsMsg.hidden = false;
    return;
  }

  noTripsMsg.hidden = true;

  for (const trip of trips) {
    const li = document.createElement('li');

    const info = document.createElement('span');
    info.textContent = `${trip.name} — ${trip.destinationType}, ${trip.duration} day${trip.duration === 1 ? '' : 's'}`;

    const btn = document.createElement('button');
    btn.textContent = 'Load';
    btn.addEventListener('click', () => loadTrip(trip));

    li.appendChild(info);
    li.appendChild(btn);
    list.appendChild(li);
  }
}

async function init() {
  const searchInput = document.getElementById('trip-search');
  let allTrips = [];

  async function refreshTripList() {
    try {
      const trips = await loadTripsFromServer();
      allTrips = trips.reverse();
      renderSavedTrips(allTrips, loadTrip);
      searchInput.value = '';
    } catch (err) {
      console.error('Failed to load trips from server:', err);
    }
  }

  const { loadTrip } = initTripForm({ onTripSaved: refreshTripList });

  await refreshTripList();

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase().trim();
    const filtered = allTrips.filter((trip) =>
      trip.name.toLowerCase().includes(query),
    );
    renderSavedTrips(filtered, loadTrip);
  });
}

init();
