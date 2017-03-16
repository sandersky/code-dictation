'use babel'

import Parser from './parser'

export default class TextEditorObserver {
  constructor ({view}) {
    Object.assign(this, {
      editor: null,
      lastText: '',
      parser: null,
      view
    })
  }

  dispose () {
    this.stop()
  }

  observeTextEditors (editor) {
    if (this._onDidChangeGrammarDisposable) this._onDidChangeGrammarDisposable.dispose()
    if (this._onWillInsertTextDisposable) this._onWillInsertTextDisposable.dispose()

    this.lastText = ''
    this.editor = editor

    if (!editor) return

    this.parser = new Parser({
      editor: this.editor,
      view: this.view
    })

    // Since the editor changed make sure we are working with the proper grammar
    if (editor.getGrammar) {
      this.onDidChangeGrammar(editor.getGrammar())
    }

    if (editor.onDidChangeGrammar) {
      this._onDidChangeGrammarDisposable = editor.onDidChangeGrammar(this.onDidChangeGrammar.bind(this))
    }

    if (editor.onWillInsertText) {
      this._onWillInsertTextDisposable = editor.onWillInsertText(this.onWillInsertText.bind(this))
    }
  }

  onDidChangeGrammar (grammar) {
    const language = grammar.name.toLowerCase()
    this.parser.loadLanguage(language)
  }

  onDidStopChangingActivePaneItem (item) {
    this.observeTextEditors(item)
  }

  onWillInsertText (event) {
    // Wait for user to pause so we get the full input
    if (this.lastText !== event.text) {
      this.lastText = event.text
      return
    }

    // Clear last text so we can process next batch
    this.lastText = ''

    this.parser.process(event)
  }

  start () {
    const editor = atom.workspace.getActiveTextEditor()

    if (editor) {
      this.parser = new Parser({
        editor,
        view: this.view
      })
    }

    this._observeTextEditorsDisposable = atom.workspace.observeTextEditors(
      this.observeTextEditors.bind(this)
    )

    this._onDidStopChangingActivePaneItemDisposable = atom.workspace.onDidStopChangingActivePaneItem(
      this.onDidStopChangingActivePaneItem.bind(this)
    )

    console.debug('Now observing text editors')
  }

  stop () {
    ;[
      '_observeTextEditorsDisposable',
      '_onDidChangeGrammarDisposable',
      '_onDidStopChangingActivePaneItemDisposable',
      '_onWillInsertTextDisposable'
    ]
      .forEach((key) => {
        if (this[key]) this[key].dispose()
      })

    this.parser = null

    console.debug('No longer observing text editors')
  }
}
