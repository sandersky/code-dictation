'use babel'

import {CompositeDisposable} from 'atom'

import CodeDictationView from './code-dictation-view'
import TextEditorObserver from './text-editor-observer'

export default {
  observing: false,
  subscriptions: null,
  textEditorObserver: null,

  activate (state) {
    this.codeDictationView = new CodeDictationView(state.codeDictationViewState)
    this.subscriptions = new CompositeDisposable()
    this.textEditorObserver = new TextEditorObserver({
      view: this.codeDictationView
    })

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
    this.codeDictationView.destroy()
  },

  serialize () {
    return {
      codeDictationViewState: this.codeDictationView.serialize()
    }
  },

  toggleObserver () {
    if (!this._observing) {
      this.codeDictationView.show()
      this.textEditorObserver.start()
    } else {
      this.textEditorObserver.stop()
      this.codeDictationView.hide()
    }

    this._observing = !this._observing
  }
}
