// @vitest-environment jsdom

import { describe, it, expect, beforeEach } from 'vitest';
import { renderSavedTrips } from '../src/savedTripsRenderer.js';

describe('renderSavedTrips — XSS safety', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <ul id="saved-trips-list"></ul>
      <p id="no-trips-message" hidden></p>
    `;
  });

  it('renders trip name as text, never as HTML', () => {
    const payload = '<script>window.__xssSavedTripName = true;</script><img src=x onerror="window.__xssSavedTripName=true">';

    renderSavedTrips(
      [{ id: 't1', name: payload, destinationType: 'beach', duration: 3 }],
      () => {},
      () => {},
    );

    const list = document.getElementById('saved-trips-list');

    // No script element should be in the rendered tree — confirms textContent path.
    expect(list.querySelectorAll('script').length).toBe(0);
    // No img element either — onerror would not fire because img would not exist,
    // but checking explicitly guards against innerHTML regressions.
    expect(list.querySelectorAll('img').length).toBe(0);

    // The payload should appear verbatim as visible text on the info span.
    const span = list.querySelector('span');
    expect(span).not.toBeNull();
    expect(span.textContent).toBe(`${payload} — beach, 3 days`);

    // Defense-in-depth: confirm the side-effect a real XSS would produce did not happen.
    expect(window.__xssSavedTripName).toBeUndefined();
  });

  it('renders destinationType as text, never as HTML', () => {
    const payload = '<script>window.__xssSavedTripDest = true;</script>';

    renderSavedTrips(
      [{ id: 't1', name: 'Family Vacation', destinationType: payload, duration: 5 }],
      () => {},
      () => {},
    );

    const list = document.getElementById('saved-trips-list');

    expect(list.querySelectorAll('script').length).toBe(0);

    const span = list.querySelector('span');
    expect(span).not.toBeNull();
    expect(span.textContent).toBe(`Family Vacation — ${payload}, 5 days`);

    expect(window.__xssSavedTripDest).toBeUndefined();
  });
});
