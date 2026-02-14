import { initTripForm } from './tripForm.js';
import { loadState } from './storage.js';
import { renderChecklist } from './checklistRenderer.js';

// On page load, restore any saved state
const saved = loadState();
if (saved) {
  if (saved.tripParams) {
    const form = document.getElementById('trip-form');
    if (saved.tripParams.destinationType) {
      form.elements['destinationType'].value = saved.tripParams.destinationType;
    }
    if (saved.tripParams.duration) {
      form.elements['duration'].value = saved.tripParams.duration;
    }
  }
  if (saved.checklist) {
    document.getElementById('checklist-section').hidden = false;
    renderChecklist(saved.checklist);
  }
}

// Initialize the trip form
initTripForm();
