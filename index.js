// DOM Testing and User Behavior Simulation
// Implements reusable DOM helpers and wires up the demo page interactions.

/* ------------------------------------------------------------------ */
/* Reusable utilities                                                  */
/* ------------------------------------------------------------------ */

/**
 * Create an element with attributes and optional text content.
 * @param {string} tag - Tag name for the new element.
 * @param {Object} attributes - Attributes to set on the element.
 * @param {string} textContent - Optional text content.
 * @returns {HTMLElement}
 */
function createElementWithAttributes(tag, attributes = {}, textContent = '') {
  const element = document.createElement(tag);

  Object.keys(attributes).forEach((name) => {
    element.setAttribute(name, attributes[name]);
  });

  if (textContent !== '') {
    element.textContent = textContent;
  }

  return element;
}

/**
 * Show a message in the error container.
 * @param {string} message
 * @param {string} errorId
 */
function displayError(message, errorId = 'error-message') {
  const errorElement = document.getElementById(errorId);
  if (!errorElement) {
    return;
  }

  errorElement.textContent = message;
  errorElement.classList.remove('hidden');
}

/**
 * Hide and reset the error container.
 * @param {string} errorId
 */
function clearError(errorId = 'error-message') {
  const errorElement = document.getElementById(errorId);
  if (!errorElement) {
    return;
  }

  errorElement.textContent = '';
  errorElement.classList.add('hidden');
}

/* ------------------------------------------------------------------ */
/* DOM manipulation                                                    */
/* ------------------------------------------------------------------ */

/**
 * Append a new element to a container.
 * @param {string} containerId - Id of the container to append to.
 * @param {string} content - Text displayed inside the new element.
 * @param {string} tag - Tag name for the new element.
 * @param {string} className - Extra class name for the new element.
 * @returns {HTMLElement|null} The new element, or null if the container is missing.
 */
function addElementToDOM(containerId, content, tag = 'p', className = '') {
  const container = document.getElementById(containerId);

  if (!container) {
    displayError(`Container with id "${containerId}" was not found.`);
    return null;
  }

  const classes = ['dynamic-item', className].filter(Boolean).join(' ');
  const element = createElementWithAttributes(tag, { class: classes }, content);

  container.append(element);
  return element;
}

/**
 * Remove an element from the DOM by id.
 * Missing elements are treated as a no-op so callers can safely retry.
 * @param {string} elementId
 * @returns {boolean} True when an element was removed.
 */
function removeElementFromDOM(elementId) {
  const element = document.getElementById(elementId);
  if (!element) {
    return false;
  }

  element.remove();
  return true;
}

/* ------------------------------------------------------------------ */
/* User behavior simulation                                            */
/* ------------------------------------------------------------------ */

/**
 * Simulate a button click by appending feedback to a container.
 * @param {string} containerId
 * @param {string} message
 * @returns {HTMLElement|null}
 */
function simulateClick(containerId = 'dynamic-content', message = 'Button Clicked!') {
  return addElementToDOM(containerId, message, 'p', 'click-feedback');
}

/**
 * Handle a form submission: validate the input, then update the DOM.
 * @param {string} formId
 * @param {string} containerId
 * @returns {boolean} True when the submission was accepted.
 */
function handleFormSubmit(formId = 'user-form', containerId = 'dynamic-content') {
  const form = document.getElementById(formId);

  if (!form) {
    displayError(`Form with id "${formId}" was not found.`);
    return false;
  }

  const input = form.querySelector('#user-input') || form.querySelector('input');

  if (!input) {
    displayError('Input field was not found.');
    return false;
  }

  const value = input.value.trim();

  if (value === '') {
    displayError('Input cannot be empty');
    return false;
  }

  clearError();
  addElementToDOM(containerId, value, 'p', 'user-entry');
  input.value = '';

  return true;
}

/* ------------------------------------------------------------------ */
/* Event wiring                                                        */
/* ------------------------------------------------------------------ */

/**
 * Attach delegated listeners so the page keeps working even when the
 * form or button is added after this script runs.
 */
function initEventListeners() {
  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!target || typeof target.closest !== 'function') {
      return;
    }

    if (target.closest('#simulate-click')) {
      simulateClick('dynamic-content', 'Button Clicked!');
    }
  });

  document.addEventListener('submit', (event) => {
    const form = event.target;
    if (!form || typeof form.closest !== 'function') {
      return;
    }

    const matchedForm = form.matches('#user-form') ? form : form.closest('#user-form');
    if (!matchedForm) {
      return;
    }

    event.preventDefault();
    handleFormSubmit(matchedForm.id || 'user-form', 'dynamic-content');
  });
}

if (typeof document !== 'undefined') {
  initEventListeners();
}

/* ------------------------------------------------------------------ */
/* Exports                                                             */
/* ------------------------------------------------------------------ */

const domUtils = {
  createElementWithAttributes,
  displayError,
  clearError,
  addElementToDOM,
  removeElementFromDOM,
  simulateClick,
  handleFormSubmit,
  initEventListeners,
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = domUtils;
}
