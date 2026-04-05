import { generateChecklist } from './checklistGenerator.js';
import { renderChecklist, setOnChecklistChange } from './checklistRenderer.js';
import { saveTripToServer, updateTripOnServer } from './storage.js';
import { showToast } from './toast.js';

/**
 * Initializes the trip form and wires up submission.
 * @param {{ onTripSaved?: function(): void }} [options]
 * @returns {{ loadTrip: function }} Controls for loading a trip into the form
 */
export function initTripForm({ onTripSaved } = {}) {
  const form = document.getElementById('trip-form');
  const checklistSection = document.getElementById('checklist-section');
  const generateChecklistBtn = form.querySelector('button[type="submit"]');
  const saveTripBtn = document.getElementById('save-trip-btn');

  let currentChecklist = null;
  let savedTripId = null;

  function debounce(fn, delay) {
    let timer = null;
    return (...args) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  function setChecklistLoading(isLoading) {
    if (generateChecklistBtn) {
      generateChecklistBtn.disabled = isLoading;
      generateChecklistBtn.textContent = isLoading ? 'Generating...' : 'Generate Checklist';
    }
  }

  const autoSaveChecklist = debounce(async (checklist) => {
    if (!savedTripId) return;

    try {
      await updateTripOnServer(savedTripId, { checklist });
      showToast('Checklist saved.', 'success');
    } catch (err) {
      showToast(`Failed to sync checklist: ${err.message}`, 'error');
      console.error('Failed to sync checklist:', err);
    }
  }, 600);

  // When a checkbox changes and the trip has been saved, sync to server
  setOnChecklistChange((checklist) => {
    if (savedTripId) {
      autoSaveChecklist(checklist);
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

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    setChecklistLoading(true);
    try {
      // Yield one animation frame so the spinner renders before generation starts.
      await new Promise((resolve) => requestAnimationFrame(resolve));

      const formData = new FormData(form);
      const tripParams = {
        name: formData.get('name')?.trim(),
        destinationType: formData.get('destinationType'),
        duration: parseInt(formData.get('duration'), 10),
      };

      currentChecklist = generateChecklist(tripParams);
      checklistSection.hidden = false;
      renderChecklist(currentChecklist);
      saveTripBtn.disabled = false;

      if (savedTripId) {
        saveTripBtn.textContent = `Saved! (ID: ${savedTripId.slice(0, 8)}…)`;
      } else {
        saveTripBtn.textContent = 'Save Trip';
      }
    } finally {
      setChecklistLoading(false);
    }
  });

  saveTripBtn.addEventListener('click', async () => {
    const formData = new FormData(form);

    saveTripBtn.disabled = true;
    saveTripBtn.textContent = 'Saving…';

    const tripData = {
      name: formData.get('name')?.trim(),
      destinationType: formData.get('destinationType'),
      duration: parseInt(formData.get('duration'), 10),
      checklist: currentChecklist || [],
    };

    try {
      if (savedTripId) {
        await updateTripOnServer(savedTripId, tripData);
        saveTripBtn.textContent = `Saved! (ID: ${savedTripId.slice(0, 8)}…)`;
        showToast('Trip updated successfully.', 'success');
      } else {
        const saved = await saveTripToServer(tripData);
        savedTripId = saved.id;
        saveTripBtn.textContent = `Saved! (ID: ${saved.id.slice(0, 8)}…)`;
        showToast('Trip saved successfully.', 'success');
      }

      if (onTripSaved) await onTripSaved();
      
      saveTripBtn.disabled = false;
    } catch (err) {
      showToast(`Failed to save trip: ${err.message}`, 'error');
      console.error('Failed to save trip:', err);
      saveTripBtn.textContent = 'Save failed – retry?';
      saveTripBtn.disabled = false;
    }
  });

  return { loadTrip };
}
