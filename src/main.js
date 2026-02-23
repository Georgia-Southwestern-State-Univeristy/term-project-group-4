import { initTripForm } from './tripForm.js';
import { loadTripsFromServer } from './storage.js';
import { renderChecklist } from './checklistRenderer.js';

async function init() {
  let savedTripId = null;
  let restoredChecklist = null;

  try {
    const trips = await loadTripsFromServer();
    if (trips.length > 0) {
      // Load the most recently created trip
      const latest = trips[trips.length - 1];
      const form = document.getElementById('trip-form');

      if (latest.name) form.elements['name'].value = latest.name;
      if (latest.destinationType) form.elements['destinationType'].value = latest.destinationType;
      if (latest.duration) form.elements['duration'].value = latest.duration;

      if (latest.checklist && latest.checklist.length > 0) {
        document.getElementById('checklist-section').hidden = false;
        document.getElementById('save-trip-btn').disabled = false;
        renderChecklist(latest.checklist);
        restoredChecklist = latest.checklist;
      }

      savedTripId = latest.id;
    }
  } catch (err) {
    console.error('Failed to load trips from server:', err);
  }

  initTripForm(savedTripId, restoredChecklist);
}

init();
