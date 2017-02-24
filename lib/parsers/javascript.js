'use babel'

import fs from 'fs'
import path from 'path'

import GenericParser from './generic'

export default class JavaScriptParser extends GenericParser {
  constructor () {
    super(...arguments)
  }

  importDefaultProcessor ({cancel, word}) {
    //
  }

  importNamedProcessor ({cancel, word}) {
    //
  }

  importProcessor ({cancel, word}) {
    if (this.soundsLike('default', word)) {
      return {state: this.importDefaultProcessor}
    }

    if (this.soundsLike('named', word)) {
      return {state: this.importNamedProcessor}
    }
  }

  startProcessor ({cancel, word}) {
    if (this.soundsLike('const', word)) {
      this.insertText('const ')
      return {state: this.startProcessor}
    }

    if (this.soundsLike('import', word)) {
      this.insertText('import ')
      return {
        hints: ['default', 'named'],
        state: this.importProcessor
      }
    }

    if (this.soundsLike('var', word)) {
      this.insertText('var ')
      return {state: this.startProcessor}
    }

    return super.startProcessor({cancel, word})
  }
}
