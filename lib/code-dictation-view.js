'use babel'

export default class CodeDictationView {
  constructor (serializedState) {
    // Create root element
    this.element = document.createElement('div')
    this.element.classList.add('code-dictation', 'panel', 'panel-top')
    this.element.innerHTML = '<span class="code-dictation-label">Dictation:</span>'
  }

  addWords (...words) {
    // this.clearHints()

    words.forEach((word) => {
      const wordElement = document.createElement('span')
      wordElement.classList.add('code-dictation-word')
      wordElement.textContent = word
      this.element.appendChild(wordElement)
    })
  }

  clearHints () {
    this.element.querySelectorAll('.code-dictation-hint')
      .forEach((hintElement) => {
        hintElement.remove()
      })
  }

  clearWords () {
    this.element.querySelectorAll('.code-dictation-word')
      .forEach((wordElement) => {
        wordElement.remove()
      })
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove()
  }

  getElement() {
    return this.element
  }

  hide () {
    this.element.parentNode.removeChild(this.element)
  }

  setHints (hints = []) {
    this.clearHints()

    hints.forEach((hint) => {
      const hintElement = document.createElement('span')
      hintElement.classList.add('code-dictation-hint')
      hintElement.textContent = hint
      this.element.appendChild(hintElement)
    })
  }

  show () {
    // Add view to top panel (above text editors)
    document.querySelector('atom-panel-container.top').appendChild(this.element)
  }
}
