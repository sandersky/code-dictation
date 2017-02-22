'use babel'

export default class GenericParser {
  constructor ({editor}) {
    console.debug('Now using the generic parser')

    Object.assign(this, {
      editor,
      stateProcessor: this.startProcessor
    })
  }

  process (event) {
    console.info('process')
    this.stateProcessor(event)
  }

  // Processor methods

  goToProcessor ({cancel, text}) {
    console.info('goToProcesor', text)

    if (/line \d+/i.test(text)) {
      cancel()
      // Get line from voice command
      let line = parseInt(text.match(/\d+/)[0])

      // Don't let user try to access a line before the first one (line 1)
      line = Math.max(1, line) // Don't let line go below 0

      // Don't let line go beyond number of lines in editor
      line = Math.min(line, this.editor.getLineCount())

      // Move cursor to begininning of line specified by user
      this.editor.setCursorScreenPosition([line - 1, 0])

      // Go back to begininning of state machine
      this.stateProcessor = this.startProcessor
    }
  }

  startProcessor ({cancel, text}) {
    console.debug('startProcesor', text)

    switch (text.toLowerCase()) {
      case 'go to':
        cancel()
        this.stateProcessor = this.goToProcessor
        break
    }
  }
}
