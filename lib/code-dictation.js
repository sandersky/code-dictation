'use babel'

import CodeDictationView from './code-dictation-view'
import { CompositeDisposable } from 'atom'

export default {

  codeDictationView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.codeDictationView = new CodeDictationView(state.codeDictationViewState)
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.codeDictationView.getElement(),
      visible: false
    })

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable()

    // Register command that toggles this view
    this.subscriptions.add(
      atom.commands.add('atom-workspace', {
        'code-dictation:observe': () => this.toggleObserver()
      })
    )
  },

  deactivate() {
    this.modalPanel.destroy()
    this.subscriptions.dispose()
    this.codeDictationView.destroy()
  },

  serialize() {
    return {
      codeDictationViewState: this.codeDictationView.serialize()
    }
  },

  toggleObserver () {
    this.codeDictationView.observe()
  }
}
