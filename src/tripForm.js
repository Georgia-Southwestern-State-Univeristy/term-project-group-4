import { generateChecklist } from './checklistGenerator.js';
import { renderChecklist, setOnChecklistChange } from './checklistRenderer.js';
import { saveState, loadState, saveTripToServer, updateTripOnServer } from './storage.js';

/**
 * Initializes the trip form and wires up submission.
 */
export function initTripForm() {
  const form = document.getElementById('trip-form');
  const checklistSection = document.getElementById('checklist-section');
  const saveTripBtn = document.getElementById('save-trip-btn');

  // Restore state from localStorage so reload preserves checklist and server link
  const restored = loadState();
  let currentChecklist = restored?.checklist || null;
  let savedTripId = restored?.savedTripId || null;

  if (savedTripId) {
    saveTripBtn.textContent = `Saved! (ID: ${savedTripId.slice(0, 8)}…)`;
  }

  // When a checkbox changes and the trip has been saved, sync to server
  setOnChecklistChange((checklist) => {
    if (savedTripId) {
      updateTripOnServer(savedTripId, { checklist }).catch((err) =>
        console.error('Failed to sync checklist:', err),
      );
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const tripParams = {
      tripName: formData.get('tripName'),
      destinationType: formData.get('destinationType'),
      duration: parseInt(formData.get('duration'), 10),
    };

    currentChecklist = generateChecklist(tripParams);
    savedTripId = null;
    saveState({ tripParams, checklist: currentChecklist, savedTripId: null });
    checklistSection.hidden = false;
    renderChecklist(currentChecklist);
    saveTripBtn.disabled = false;
    saveTripBtn.textContent = 'Save Trip';
  });

  saveTripBtn.addEventListener('click', async () => {
    const formData = new FormData(form);

    saveTripBtn.disabled = true;
    saveTripBtn.textContent = 'Saving…';

    const tripData = {
      name: formData.get('tripName'),
      destinationType: formData.get('destinationType'),
      duration: parseInt(formData.get('duration'), 10),
      checklist: currentChecklist || [],
    };

    try {
      if (savedTripId) {
        // Update existing trip with all current form fields
        await updateTripOnServer(savedTripId, tripData);
        saveTripBtn.textContent = 'Saved!';
      } else {
        // Create new trip
        const saved = await saveTripToServer(tripData);
        savedTripId = saved.id;
        saveTripBtn.textContent = `Saved! (ID: ${saved.id.slice(0, 8)}…)`;
      }
      // Persist savedTripId so reload can resume syncing
      const state = loadState();
      if (state) {
        state.savedTripId = savedTripId;
        saveState(state);
      }
      saveTripBtn.disabled = false;
    } catch (err) {
      console.error('Failed to save trip:', err);
      saveTripBtn.textContent = 'Save failed – retry?';
      saveTripBtn.disabled = false;
    }
  });
}
