import { generateChecklist } from './checklistGenerator.js';
import { renderChecklist } from './checklistRenderer.js';
import { saveState } from './storage.js';

/**
 * Initializes the trip form and wires up submission.
 */
export function initTripForm() {
  const form = document.getElementById('trip-form');
  const checklistSection = document.getElementById('checklist-section');
  const saveTripBtn = document.getElementById('save-trip-btn');

  let currentChecklist = null;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const tripParams = {
      tripName: formData.get('tripName'),
      destinationType: formData.get('destinationType'),
      duration: parseInt(formData.get('duration'), 10),
    };

    currentChecklist = generateChecklist(tripParams);
    saveState({ tripParams, checklist: currentChecklist });
    checklistSection.hidden = false;
    renderChecklist(currentChecklist);
    saveTripBtn.disabled = false;
  });

  saveTripBtn.addEventListener('click', async () => {
    const formData = new FormData(form);
    const tripData = {
      name: formData.get('tripName'),
      destinationType: formData.get('destinationType'),
      duration: parseInt(formData.get('duration'), 10),
      checklist: currentChecklist || [],
    };

    try {
      const res = await fetch('/api/saveTrip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tripData),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const saved = await res.json();
      saveTripBtn.textContent = `Saved! (ID: ${saved.id.slice(0, 8)}…)`;
      saveTripBtn.disabled = true;
    } catch (err) {
      console.error('Failed to save trip:', err);
      saveTripBtn.textContent = 'Save failed – retry?';
    }
  });
}
