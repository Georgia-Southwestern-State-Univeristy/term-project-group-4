let onChangeCallback = null;

/**
 * Register a callback that fires whenever a checklist item is toggled.
 * @param {function(Array): void} cb
 */
export function setOnChecklistChange(cb) {
  onChangeCallback = cb;
}

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
    // Category strings originate from server-stored checklist items and may
    // ultimately derive from user input. Always render via textContent — never
    // innerHTML — to prevent XSS.
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
        if (onChangeCallback) {
          onChangeCallback(checklist);
        }
      });

      const label = document.createElement('label');
      label.htmlFor = item.id;
      // Item names are user-supplied (from trip-creation flow). Always render
      // via textContent — never innerHTML — to prevent XSS.
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
