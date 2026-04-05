import { initTripForm } from './tripForm.js';
import { loadTripsFromServer, deleteTripFromServer } from './storage.js';
import { showToast } from './toast.js';

let currentUser = null;

function getAuthErrorMessage(errorCode) {
  switch (errorCode) {
    case 'google_login_failed':
      return 'Google login failed. Please try again.';
    default:
      return 'Login failed. Please try again.';
  }
}

function handleAuthErrorFromQuery() {
  const url = new URL(window.location.href);
  const authError = url.searchParams.get('authError');

  if (!authError) {
    return;
  }

  const message = getAuthErrorMessage(authError);
  showToast(message, 'error');

  // Clean up the URL so refresh/back navigation does not keep replaying the error.
  url.searchParams.delete('authError');
  window.history.replaceState({}, document.title, url.pathname + url.search + url.hash);
}

async function checkAuthStatus() {
  try {
    const response = await fetch('/auth/user');
    if (response.ok) {
      currentUser = await response.json();
      updateAuthUI();
      return true;
    } else {
      currentUser = null;
      updateAuthUI();
      return false;
    }
  } catch (error) {
    console.error('Failed to check auth status:', error);
    currentUser = null;
    updateAuthUI();
    return false;
  }
}

function updateAuthUI() {
  const userInfo = document.getElementById('user-info');
  const loginSection = document.getElementById('login-section');
  const userName = document.getElementById('user-name');
  const logoutBtn = document.getElementById('logout-btn');
  const appSections = document.querySelectorAll('#app > section');

  if (currentUser) {
    userName.textContent = currentUser.name;
    userInfo.hidden = false;
    loginSection.hidden = true;

    appSections.forEach(section => {
      section.style.display = '';
    });

    // ✅ ONLY use onclick (no addEventListener)
    logoutBtn.onclick = async () => {
      try {
        const response = await fetch('/auth/logout');
        if (!response.ok) {
          throw new Error('Logout failed');
        }

        await checkAuthStatus();
        showToast('Logged out successfully', 'success');
      } catch (error) {
        console.error('Failed to log out:', error);
        showToast('Failed to log out', 'error');
      }
    };

  } else {
    userInfo.hidden = true;
    loginSection.hidden = false;

    appSections.forEach(section => {
      section.style.display = 'none';
    });
  }
}

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
  handleAuthErrorFromQuery();
  
  const isAuthenticated = await checkAuthStatus();

  if (!isAuthenticated) {
    // Hide the main app content if not authenticated
    document.querySelectorAll('#app > section').forEach(section => {
      section.style.display = 'none';
    });
    return;
  }

  const searchInput = document.getElementById('trip-search');
  let allTrips = [];

  async function refreshTripList() {
    try {
      const trips = await loadTripsFromServer();
      allTrips = trips.reverse();
      renderSavedTrips(allTrips, loadTrip, handleDeleteTrip);
      searchInput.value = '';
    } catch (err) {
      showToast(`Failed to load trips: ${err.message}`, 'error');
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
      showToast('Trip deleted successfully.', 'success');
    } catch (err) {
      showToast(`Failed to delete trip: ${err.message}`, 'error');
      console.error('Failed to delete trip:', err);
    }
  }
}

init();