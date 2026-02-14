import { generateChecklist } from './checklistGenerator.js';
import { renderChecklist } from './checklistRenderer.js';
import { saveState } from './storage.js';

/**
 * Initializes the trip form and wires up submission.
 */
export function initTripForm() {
  const form = document.getElementById('trip-form');
  const checklistSection = document.getElementById('checklist-section');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const tripParams = {
      destinationType: formData.get('destinationType'),
      duration: parseInt(formData.get('duration'), 10),
    };

    const checklist = generateChecklist(tripParams);
    saveState({ tripParams, checklist });
    checklistSection.hidden = false;
    renderChecklist(checklist);
  });
}
