const STORAGE_KEY = 'smart-packing-checklist';

/**
 * Save the current trip and checklist state to localStorage.
 * @param {{ tripParams: object, checklist: Array }} state
 */
export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/**
 * Load saved state from localStorage.
 * @returns {{ tripParams: object, checklist: Array } | null}
 */
export function loadState() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : null;
}

/**
 * Clear saved state from localStorage.
 */
export function clearState() {
  localStorage.removeItem(STORAGE_KEY);
}
