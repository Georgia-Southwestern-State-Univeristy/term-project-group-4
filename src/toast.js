const TOAST_DURATION = 4000;

function createToastContainer() {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
}

/**
 * Show a toast notification.
 * @param {string} message
 * @param {'success'|'error'|'info'} [type]
 */
export function showToast(message, type = 'info') {
  const container = createToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  // Auto-dismiss
  const timeout = setTimeout(() => {
    toast.classList.add('toast--hide');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, TOAST_DURATION);

  // Allow click to dismiss early
  toast.addEventListener('click', () => {
    clearTimeout(timeout);
    toast.classList.add('toast--hide');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  });

  return toast;
}
