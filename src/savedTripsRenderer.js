/**
 * Renders the saved-trips list with Load and Delete actions per trip.
 *
 * The renderer reads `id`, `name`, `destinationType`, and `duration` directly,
 * but passes the entire trip object through to `loadTrip()`. Callers should
 * supply full trip objects (including `checklist` and any other fields the
 * load callback needs) — only the four fields above are used here.
 *
 * @param {Array<object>} trips — full trip objects; this renderer reads `id`, `name`, `destinationType`, and `duration`
 * @param {(trip: object) => void} loadTrip — receives the entire trip object
 * @param {(tripId: string) => void} deleteTrip
 */
export function renderSavedTrips(trips, loadTrip, deleteTrip) {
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
    // trip.name and trip.destinationType are user-supplied. Always render via
    // textContent — never innerHTML — to prevent XSS.
    info.textContent = `${trip.name} — ${trip.destinationType}, ${trip.duration} day${trip.duration === 1 ? '' : 's'}`;

    const actions = document.createElement('div');

    const loadBtn = document.createElement('button');
    loadBtn.textContent = 'Load';
    loadBtn.type = 'button';
    loadBtn.addEventListener('click', () => {
      loadTrip(trip);
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.type = 'button';
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
