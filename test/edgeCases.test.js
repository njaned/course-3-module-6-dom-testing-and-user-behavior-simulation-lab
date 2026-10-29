/**
 * @jest-environment jsdom
 */

const {
  addElementToDOM,
  removeElementFromDOM,
  simulateClick,
  handleFormSubmit,
} = require('../index')

describe('DOM edge cases and event wiring', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <button id="simulate-click">Simulate Click</button>
      <form id="user-form">
        <input type="text" id="user-input" />
        <button type="submit">Submit</button>
      </form>
      <div id="dynamic-content"></div>
      <div id="error-message" class="hidden"></div>
    `
  })

  it('returns false when removing an element that does not exist', () => {
    expect(removeElementFromDOM('missing-element')).toBe(false)
  })

  it('shows an error and returns null when the container is missing', () => {
    const result = addElementToDOM('missing-container', 'Hello')

    expect(result).toBeNull()
    expect(document.getElementById('error-message').textContent).toContain('was not found')
  })

  it('rejects whitespace-only input without adding content', () => {
    document.getElementById('user-input').value = '   '

    const accepted = handleFormSubmit('user-form', 'dynamic-content')

    expect(accepted).toBe(false)
    expect(document.getElementById('dynamic-content').textContent).toBe('')
    expect(document.getElementById('error-message').textContent).toBe('Input cannot be empty')
  })

  it('clears the input and error after a valid submission', () => {
    const input = document.getElementById('user-input')
    input.value = '  Hello there  '

    const accepted = handleFormSubmit('user-form', 'dynamic-content')

    expect(accepted).toBe(true)
    expect(document.getElementById('dynamic-content').textContent).toContain('Hello there')
    expect(input.value).toBe('')
    expect(document.getElementById('error-message').classList.contains('hidden')).toBe(true)
  })

  it('appends multiple entries instead of overwriting', () => {
    addElementToDOM('dynamic-content', 'First')
    addElementToDOM('dynamic-content', 'Second')

    const dynamicContent = document.getElementById('dynamic-content')
    expect(dynamicContent.children).toHaveLength(2)
    expect(dynamicContent.textContent).toContain('First')
    expect(dynamicContent.textContent).toContain('Second')
  })

  it('updates the DOM when the simulate button is clicked', () => {
    document.getElementById('simulate-click').dispatchEvent(new Event('click', { bubbles: true }))

    expect(document.getElementById('dynamic-content').textContent).toContain('Button Clicked!')
  })

  it('updates the DOM when the form is submitted through the page listener', () => {
    document.getElementById('user-input').value = 'From the form'

    const form = document.getElementById('user-form')
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
    form.dispatchEvent(submitEvent)

    expect(submitEvent.defaultPrevented).toBe(true)
    expect(document.getElementById('dynamic-content').textContent).toContain('From the form')
  })

  it('does not throw when optional elements are missing', () => {
    document.body.innerHTML = ''

    expect(() => simulateClick('dynamic-content', 'Hi')).not.toThrow()
    expect(() => handleFormSubmit('user-form', 'dynamic-content')).not.toThrow()
  })
})
