import { initTripForm } from './tripForm.js';
import { loadState } from './storage.js';
import { renderChecklist } from './checklistRenderer.js';

// On page load, restore any saved state from localStorage
const saved = loadState();
if (saved) {
  const form = document.getElementById('trip-form');
  if (saved.tripParams) {
    if (saved.tripParams.tripName) {
      form.elements['tripName'].value = saved.tripParams.tripName;
    }
    if (saved.tripParams.destinationType) {
      form.elements['destinationType'].value = saved.tripParams.destinationType;
    }
    if (saved.tripParams.duration) {
      form.elements['duration'].value = saved.tripParams.duration;
    }
  }
  if (saved.checklist) {
    document.getElementById('checklist-section').hidden = false;
    document.getElementById('save-trip-btn').disabled = false;
    renderChecklist(saved.checklist);
  }
}

// Initialize the trip form
initTripForm();
