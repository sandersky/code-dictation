'use babel'

import fs from 'fs'
import path from 'path'

import GenericParser from './generic'

export default class JavaScriptParser extends GenericParser {
  constructor () {
    super(...arguments)

    const likeWordsDictionary = this.loadDictionary('like-words', 'javascript')

    // Extend generic like words dictionary (has ability to override rules as well)
    Object.keys(likeWordsDictionary).forEach((key) => {
      this.likeWordsDictionary[key] = likeWordsDictionary[key]
    })
  }

  importDefaultProcessor ({cancel, word}) {
    //
  }

  importNamedProcessor ({cancel, word}) {
    //
  }

  importProcessor ({cancel, word}) {
    if (this.soundsLike('default', word)) {
      cancel()
      return {state: this.importDefaultProcessor}
    }

    if (this.soundsLike('named', word)) {
      cancel()
      return {state: this.importNamedProcessor}
    }
  }

  startProcessor ({cancel, word}) {
    if (this.soundsLike('const', word)) {
      cancel()
      this.insertText('const ')
      return {state: this.startProcessor}
    }

    if (this.soundsLike('import', word)) {
      cancel()
      this.insertText('import ')
      return {
        hints: ['default', 'named'],
        state: this.importProcessor
      }
    }

    if (this.soundsLike('var', word)) {
      cancel()
      this.insertText('var ')
      return {state: this.startProcessor}
    }

    return super.startProcessor({cancel, word})
  }
}
