import { initTripForm } from './tripForm.js';
import { loadTripsFromServer, deleteTripFromServer } from './storage.js';
import { showToast } from './toast.js';

function renderSavedTrips(trips, loadTrip, deleteTrip) {
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

    const actions = document.createElement('div');

    const loadBtn = document.createElement('button');
    loadBtn.textContent = 'Load';
    loadBtn.addEventListener('click', () => loadTrip(trip));

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'delete-btn';
    deleteBtn.addEventListener('click', () => {
      const confirmed = window.confirm(`Delete trip "${trip.name}"? This cannot be undone.`);
      if (confirmed) {
        deleteTrip(trip.id);
      }
    });


    actions.appendChild(loadBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(info);
    li.appendChild(actions);

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
      renderSavedTrips(allTrips, loadTrip, handleDeleteTrip);
      searchInput.value = '';
    } catch (err) {
      showToast('Failed to load trips (network error)', 'error');
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
    renderSavedTrips(filtered, loadTrip, handleDeleteTrip);
  });

  async function handleDeleteTrip(tripId) {
    try {
      await deleteTripFromServer(tripId);
      await refreshTripList();
    } catch (err) {
      console.error('Failed to delete trip:', err);
    }
  }
}

init();