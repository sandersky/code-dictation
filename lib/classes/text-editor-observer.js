'use babel'

const rules = {
  'arrow function': function () {
    this._editor.insertText('() => {}')
  },

  'function': function () {
    this._editor.insertText('function () {}')
  }
}

export default class TextEditorObserver {
  constructor () {
    //
  }

  observeTextEditors (editor) {
    console.info('observe')
    if (this._onWillInsertTextDisposable) {
      this._onWillInsertTextDisposable.dispose()
    }

    this._editor = editor

    this._onWillInsertTextDisposable = editor.onWillInsertText(this.onWillInsertText.bind(this))
  }

  onDidStopChangingActivePaneItem (item) {
    this.observeTextEditors(item)
  }

  onWillInsertText (event) {
    const text = event.text.toLowerCase()

    if (text in rules) {
      event.cancel()
      rules[text].call(this)
    }
  }

  start () {
    this._observeTextEditorsDisposable = atom.workspace.observeTextEditors(
      this.observeTextEditors.bind(this)
    )

    this._onDidStopChangingActivePaneItemDisposable = atom.workspace.onDidStopChangingActivePaneItem(
      this.onDidStopChangingActivePaneItem.bind(this)
    )
  }

  stop () {
    ;[
      '_observeTextEditorsDisposable',
      '_onDidStopChangingActivePaneItemDisposable',
      '_onWillInsertTextDisposable'
    ]
      .forEach((key) => {
        if (this[key]) this[key].dispose()
      })
  }
}
