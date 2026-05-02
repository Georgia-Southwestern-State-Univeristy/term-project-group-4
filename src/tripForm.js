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
  const progressText = document.getElementById('progress-text');
  const nameInput = form.elements['name'];
  const destinationInput = form.elements['destinationType'];
  const durationInput = form.elements['duration'];

  let currentChecklist = null;
  let savedTripId = null;
  let isGeneratingChecklist = false;
  let isEditingExistingTrip = false;
  let originalFormState = null;
  let hasChanges = false;

  function isChecklistFormReady() {
    const hasName = !!nameInput?.value?.trim();
    const hasDestination = !!destinationInput?.value;
    const hasDuration = !!durationInput?.value;
    return hasName && hasDestination && hasDuration && form.checkValidity();
  }

  function updateGenerateButtonState() {
    if (!generateChecklistBtn) return;
    generateChecklistBtn.disabled = isGeneratingChecklist || !isChecklistFormReady();
    generateChecklistBtn.textContent = isGeneratingChecklist ? 'Generating...' : 'Generate Checklist';
  }

  function setSaveButtonForNewTrip() {
    saveTripBtn.textContent = 'Save Trip';
    saveTripBtn.disabled = true;
  }

  function setSaveButtonForEditing() {
    saveTripBtn.textContent = 'Update Trip';
    saveTripBtn.disabled = !hasChanges;
  }

  function hideEditingContext() {
    if (!editingContext) return;
    editingContext.textContent = '';
    editingContext.hidden = true;
  }

  function showEditingContext(tripName) {
    if (!editingContext) return;
    editingContext.textContent = `Editing: ${tripName}`;
    editingContext.hidden = false;
  }

  /**
   * Capture only the Create a Trip fields for edit-mode change detection.
   * Checklist item packed/unpacked state is auto-saved separately and should
   * not enable the Update Trip button.
   */
  function captureFormState() {
    return {
      name: form.elements['name'].value || '',
      destinationType: form.elements['destinationType'].value || '',
      duration: form.elements['duration'].value || '',
    };
  }

  /**
   * Update button disabled state based on whether there are changes
   */
  function updateButtonState() {
    if (isEditingExistingTrip) {
      saveTripBtn.disabled = !hasChanges;
      return;
    }
  }

  /**
   * Check if the Create a Trip fields have changed from the saved state.
   * Checklist item changes are intentionally excluded because they auto-save
   * independently and should not affect the Update Trip button.
   */
  function checkForChanges() {
    if (!isEditingExistingTrip || !originalFormState) {
      return false;
    }

    const currentState = captureFormState();
    const changed =
      currentState.name !== originalFormState.name ||
      currentState.destinationType !== originalFormState.destinationType ||
      currentState.duration !== originalFormState.duration;

    hasChanges = changed;
    updateButtonState();
    return changed;
  }

  function debounce(fn, delay) {
    let timer = null;
    return (...args) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  function setChecklistLoading(isLoading) {
    isGeneratingChecklist = isLoading;
    updateGenerateButtonState();
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

  function enterEditMode(trip) {
    savedTripId = trip.id;
    isEditingExistingTrip = true;
    currentChecklist = structuredClone(trip.checklist || []);

    form.elements['name'].value = trip.name || '';
    form.elements['destinationType'].value = trip.destinationType || '';
    form.elements['duration'].value = trip.duration || '';

    checklistSection.hidden = currentChecklist.length === 0;

    if (currentChecklist.length > 0) {
      renderChecklist(currentChecklist);
    } else if (checklistContainer) {
      checklistContainer.innerHTML = '';
    }

    showEditingContext(trip.name);

    originalFormState = captureFormState();
    hasChanges = false;

    setSaveButtonForEditing();
    updateGenerateButtonState();
  }

  function exitEditModeAndResetForm() {
    form.reset();
    checklistSection.hidden = true;

    if (checklistContainer) checklistContainer.innerHTML = '';
    if (progressText) progressText.textContent = '';

    currentChecklist = null;
    savedTripId = null;
    isEditingExistingTrip = false;
    originalFormState = null;
    hasChanges = false;

    hideEditingContext();
    setSaveButtonForNewTrip();
    updateGenerateButtonState();
  }

  function resetFormAfterCreateSave() {
    exitEditModeAndResetForm();
  }

  const autoSaveChecklist = debounce(async (checklist) => {
    if (!savedTripId) return;

    try {
      await updateTripOnServer(savedTripId, { checklist });
      // Silent auto-save - no success toast to avoid notification spam
    } catch (err) {
      // Show error toasts immediately as they need user attention
      showToast(`Failed to sync checklist: ${err.message}`, 'error');
      console.error('Failed to sync checklist:', err);
    }
  }, 600);

  // When a checkbox changes and the trip has been saved, sync checklist state
  // to the server. This should not mark the trip details form as changed.
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
    enterEditMode(trip);
  }

  ['input', 'change'].forEach((eventName) => {
    form.addEventListener(eventName, updateGenerateButtonState);
  });

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
        checkForChanges();
      } else {
        saveTripBtn.textContent = 'Save Trip';
        saveTripBtn.disabled = false;
      }
    } finally {
      setChecklistLoading(false);
    }
  });

  // Only trip-detail fields should enable the Update Trip button in edit mode.
  // Checklist checkbox changes are handled by auto-save and should not mark
  // the trip details as dirty.
  [nameInput, destinationInput, durationInput].forEach((field) => {
    if (!field) return;
    field.addEventListener('input', checkForChanges);
    field.addEventListener('change', checkForChanges);
  });

  updateGenerateButtonState();
  setSaveButtonForNewTrip();
  hideEditingContext();

  saveTripBtn.addEventListener('click', async () => {
    const formData = new FormData(form);

    saveTripBtn.disabled = true;
    saveTripBtn.textContent = 'Saving...';

    const tripData = {
      name: formData.get('name')?.trim(),
      destinationType: formData.get('destinationType'),
      duration: parseInt(formData.get('duration'), 10),
      checklist: currentChecklist || [],
    };

    try {
      if (savedTripId) {
        await updateTripOnServer(savedTripId, tripData);
        showToast('Trip updated successfully.', 'success');

        originalFormState = captureFormState();
        hasChanges = false;
        setSaveButtonForEditing();
      } else {
        const saved = await saveTripToServer(tripData);
        const savedId = saved.id;
        saveTripBtn.textContent = `Saved! (ID: ${saved.id.slice(0, 8)}...)`;
        showToast('Trip saved successfully.', 'success');

        // Allow any pending autosave callbacks to complete as a saved trip,
        // then reset UI for next new-trip entry.
        savedTripId = savedId;
        resetFormAfterCreateSave();
      }

      if (onTripSaved) await onTripSaved();
      
    } catch (err) {
      showToast(`Failed to save trip: ${err.message}`, 'error');
      console.error('Failed to save trip:', err);
      saveTripBtn.textContent = isEditingExistingTrip ? 'Update failed - retry?' : 'Save failed - retry?';
      saveTripBtn.disabled = false;
    }
  });

  return { loadTrip };
}