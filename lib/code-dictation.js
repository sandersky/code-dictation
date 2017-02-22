'use babel'

import {CompositeDisposable} from 'atom'

import TextEditorObserver from './text-editor-observer'

export default {
  observing: false,
  subscriptions: null,
  textEditorObserver: null,

  activate (state) {
    this.subscriptions = new CompositeDisposable()
    this.textEditorObserver = new TextEditorObserver()

    // Register command that toggles this view
    this.subscriptions.add(
      atom.commands.add('atom-workspace', {
        'code-dictation:observe': () => this.toggleObserver()
      })
    )
  },

  deactivate () {
    this.textEditorObserver.dispose()
    this.subscriptions.dispose()
  },

  serialize () {
    return {}
  },

  toggleObserver () {
    if (!this._observing) {
      this.textEditorObserver.start()
    } else {
      this.textEditorObserver.stop()
    }

    this._observing = !this._observing
  }
}
