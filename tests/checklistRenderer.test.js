// @vitest-environment jsdom

import { describe, it, expect, beforeEach } from 'vitest';
import { renderChecklist } from '../src/checklistRenderer.js';

describe('renderChecklist — XSS safety', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="checklist-container"></div>
      <p id="progress-text"></p>
    `;
  });

  it('renders checklist item names as text, never as HTML', () => {
    const payload = '<script>window.__xss = true;</script><img src=x onerror="window.__xss=true">';

    renderChecklist([
      { id: 'item-1', name: payload, category: 'Essentials', packed: false },
    ]);

    const container = document.getElementById('checklist-container');

    // No script element should be in the rendered tree — confirms textContent path.
    expect(container.querySelectorAll('script').length).toBe(0);
    // No img element either — onerror would not fire because img would not exist,
    // but checking explicitly guards against innerHTML regressions.
    expect(container.querySelectorAll('img').length).toBe(0);

    // The payload should appear verbatim as visible text on the label.
    const label = container.querySelector('label');
    expect(label).not.toBeNull();
    expect(label.textContent).toBe(payload);

    // Defense-in-depth: confirm the side-effect a real XSS would produce did not happen.
    expect(window.__xss).toBeUndefined();
  });

  it('renders category headings as text, never as HTML', () => {
    const payload = '<script>window.__xssCategory = true;</script>';

    renderChecklist([
      { id: 'item-1', name: 'Toothbrush', category: payload, packed: false },
    ]);

    const container = document.getElementById('checklist-container');

    expect(container.querySelectorAll('script').length).toBe(0);

    const heading = container.querySelector('h3');
    expect(heading).not.toBeNull();
    expect(heading.textContent).toBe(payload);

    expect(window.__xssCategory).toBeUndefined();
  });
});
