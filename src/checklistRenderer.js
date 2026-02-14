import { saveState, loadState } from './storage.js';

/**
 * Renders a checklist array into the DOM with checkboxes and progress tracking.
 * @param {Array<{ id: string, name: string, category: string, packed: boolean }>} checklist
 */
export function renderChecklist(checklist) {
  const container = document.getElementById('checklist-container');
  container.innerHTML = '';

  // Group items by category
  const grouped = {};
  for (const item of checklist) {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  }

  for (const [category, items] of Object.entries(grouped)) {
    const section = document.createElement('div');
    section.className = 'checklist-category';

    const heading = document.createElement('h3');
    heading.textContent = category;
    section.appendChild(heading);

    const list = document.createElement('ul');
    for (const item of items) {
      const li = document.createElement('li');

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = item.id;
      checkbox.checked = item.packed;
      checkbox.addEventListener('change', () => {
        item.packed = checkbox.checked;
        updateProgress(checklist);
        const state = loadState();
        if (state) {
          state.checklist = checklist;
          saveState(state);
        }
      });

      const label = document.createElement('label');
      label.htmlFor = item.id;
      label.textContent = item.name;

      li.appendChild(checkbox);
      li.appendChild(label);
      list.appendChild(li);
    }

    section.appendChild(list);
    container.appendChild(section);
  }

  updateProgress(checklist);
}

function updateProgress(checklist) {
  const packed = checklist.filter((item) => item.packed).length;
  const total = checklist.length;
  const percent = total > 0 ? Math.round((packed / total) * 100) : 0;
  document.getElementById('progress-text').textContent =
    `${packed} of ${total} items packed (${percent}%)`;
}
