import { generateChecklist } from './checklistGenerator.js';
import { renderChecklist, setOnChecklistChange } from './checklistRenderer.js';
import { saveTripToServer, updateTripOnServer } from './storage.js';

/**
 * Initializes the trip form and wires up submission.
 * @param {{ onTripSaved?: function(): void }} [options]
 * @returns {{ loadTrip: function }} Controls for loading a trip into the form
 */
export function initTripForm({ onTripSaved } = {}) {
  const form = document.getElementById('trip-form');
  const checklistSection = document.getElementById('checklist-section');
  const saveTripBtn = document.getElementById('save-trip-btn');

  let currentChecklist = null;
  let savedTripId = null;

  // When a checkbox changes and the trip has been saved, sync to server
  setOnChecklistChange((checklist) => {
    if (savedTripId) {
      updateTripOnServer(savedTripId, { checklist }).catch((err) =>
        console.error('Failed to sync checklist:', err),
      );
    }
  });

  /**
   * Load a saved trip into the form and render its checklist.
   * @param {{ id: string, name: string, destinationType: string, duration: number, checklist: Array }} trip
   */
  function loadTrip(trip) {
    form.elements['name'].value = trip.name || '';
    form.elements['destinationType'].value = trip.destinationType || '';
    form.elements['duration'].value = trip.duration || '';

    savedTripId = trip.id;
    currentChecklist = trip.checklist || [];

    if (currentChecklist.length > 0) {
      checklistSection.hidden = false;
      renderChecklist(currentChecklist);
      saveTripBtn.disabled = false;
    } else {
      checklistSection.hidden = true;
      saveTripBtn.disabled = true;
    }
    saveTripBtn.textContent = `Saved! (ID: ${savedTripId.slice(0, 8)}…)`;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const tripParams = {
      name: formData.get('name'),
      destinationType: formData.get('destinationType'),
      duration: parseInt(formData.get('duration'), 10),
    };

    currentChecklist = generateChecklist(tripParams);
    savedTripId = null;
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
      name: formData.get('name'),
      destinationType: formData.get('destinationType'),
      duration: parseInt(formData.get('duration'), 10),
      checklist: currentChecklist || [],
    };

    try {
      if (savedTripId) {
        await updateTripOnServer(savedTripId, tripData);
        saveTripBtn.textContent = 'Saved!';
      } else {
        const saved = await saveTripToServer(tripData);
        savedTripId = saved.id;
        saveTripBtn.textContent = `Saved! (ID: ${saved.id.slice(0, 8)}…)`;
      }
      saveTripBtn.disabled = false;
      if (onTripSaved) onTripSaved();
    } catch (err) {
      console.error('Failed to save trip:', err);
      saveTripBtn.textContent = 'Save failed – retry?';
      saveTripBtn.disabled = false;
    }
  });

  return { loadTrip };
}
