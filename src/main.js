import { initTripForm } from './tripForm.js';
import { loadState } from './storage.js';
import { renderChecklist } from './checklistRenderer.js';

// On page load, restore any saved state
const saved = loadState();
if (saved && saved.checklist) {
  document.getElementById('checklist-section').hidden = false;
  renderChecklist(saved.checklist);
}

// Initialize the trip form
initTripForm();
