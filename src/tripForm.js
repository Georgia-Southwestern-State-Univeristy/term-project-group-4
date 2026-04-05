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
  const editingContext = document.getElementById('editing-context');
  const checklistContainer = document.getElementById('checklist-container');
  const editingContext = document.getElementById('editing-context');

  let currentChecklist = null;
  let savedTripId = null;
  let isEditingExistingTrip = false;
  let originalFormState = null;
  let hasChanges = false;

  /**
   * Capture the current form state for change detection
   */
  function captureFormState() {
    return {
      name: form.elements['name'].value || '',
      destinationType: form.elements['destinationType'].value || '',
      duration: form.elements['duration'].value || '',
      checklist: currentChecklist ? JSON.stringify(currentChecklist) : '',
    };
  }

  /**
   * Check if form has changed from the saved state
   */
  function checkForChanges() {
    if (!isEditingExistingTrip || !originalFormState) {
      return false;
    }

    const currentState = captureFormState();
    const changed =
      currentState.name !== originalFormState.name ||
      currentState.destinationType !== originalFormState.destinationType ||
      currentState.duration !== originalFormState.duration ||
      currentState.checklist !== originalFormState.checklist;

    hasChanges = changed;
    updateButtonState();
    return changed;
  }

  /**
   * Update button disabled state based on whether there are changes
   */
  function updateButtonState() {
    if (isEditingExistingTrip) {
      saveTripBtn.disabled = !hasChanges;
    }
  }

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

  function flashChecklistUpdated() {
    if (!checklistContainer) return;

    checklistContainer.classList.remove('checklist-updated');

    // Force reflow so the animation can restart on repeated generations
    void checklistContainer.offsetWidth;

    checklistContainer.classList.add('checklist-updated');

    setTimeout(() => {
      checklistContainer.classList.remove('checklist-updated');
    }, 400);
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
    // Check for changes whenever checklist is modified
    checkForChanges();
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
    isEditingExistingTrip = true;
    currentChecklist = trip.checklist || [];

    // Capture the initial state for change detection
    originalFormState = captureFormState();
    hasChanges = false;

    // Show editing context
    editingContext.textContent = `Editing: ${trip.name}`;
    editingContext.hidden = false;
    saveTripBtn.textContent = 'Update Trip';

    if (currentChecklist.length > 0) {
      checklistSection.hidden = false;
      renderChecklist(currentChecklist);
      updateButtonState();
    } else {
      checklistSection.hidden = true;
      saveTripBtn.disabled = true;
    }
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
      flashChecklistUpdated();
      
      if (isEditingExistingTrip) {
        saveTripBtn.textContent = 'Update Trip';
        // Let checkForChanges() detect if the checklist actually changed
        checkForChanges();
      } else {
        saveTripBtn.textContent = 'Save Trip';
        saveTripBtn.disabled = false;
      }
    } finally {
      setChecklistLoading(false);
    }
  });

  // Add change detection to form inputs
  form.addEventListener('input', checkForChanges);

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
        saveTripBtn.textContent = 'Trip Updated ✓';
        showToast('Trip updated successfully.', 'success');
        // Reset change tracking after successful update
        originalFormState = captureFormState();
        hasChanges = false;
      } else {
        const saved = await saveTripToServer(tripData);
        savedTripId = saved.id;
        isEditingExistingTrip = true;
        editingContext.textContent = `Editing: ${tripData.name}`;
        editingContext.hidden = false;
        saveTripBtn.textContent = 'Update Trip';
        showToast('Trip saved successfully.', 'success');
        // Capture state after successful save for change detection
        originalFormState = captureFormState();
        hasChanges = false;
        updateButtonState();
      }

      if (onTripSaved) await onTripSaved();
      
      saveTripBtn.disabled = false;
    } catch (err) {
      showToast(`Failed to save trip: ${err.message}`, 'error');
      console.error('Failed to save trip:', err);
      saveTripBtn.textContent = isEditingExistingTrip ? 'Update failed – retry?' : 'Save failed – retry?';
      saveTripBtn.disabled = false;
    }
  });

  return { loadTrip };
}
