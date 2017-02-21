'use babel'

import TextEditorObserver from './classes/text-editor-observer'

export default class CodeDictationView {

  constructor (serializedState) {
    this._observing = false

    // Create root element
    this.element = document.createElement('div')
    this.element.classList.add('code-dictation')

    this._textEditorObserver = new TextEditorObserver()
  }

  // Returns an object that can be retrieved when package is activated
  serialize () {}

  // Tear down any state and detach
  destroy () {
    this.element.remove()
  }

  getElement () {
    return this.element
  }

  observe () {
    if (!this._observing) {
      this._textEditorObserver.start()
    } else {
      this._textEditorObserver.stop()
    }

    this._observing = !this._observing
  }
}
