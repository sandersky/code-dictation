'use babel'

import likeWordsDictionary from '../dictionaries/javascript/like-words'
import GenericParser from './generic'

export default class JavaScriptParser extends GenericParser {
  constructor () {
    super(...arguments)
  }

  soundsLike (expected, actual) {
    if (super.soundsLike(expected, actual)) return true

    if (actual === expected) return true
    const likeWords = likeWordsDictionary[expected]
    if (!likeWords) return false
    return likeWords.indexOf(actual) !== -1
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
      return this.importDefaultProcessor
    }

    if (this.soundsLike('named', word)) {
      cancel()
      return this.importNamedProcessor
    }
  }

  startProcessor ({cancel, word}) {
    if (this.soundsLike('const', word)) {
      cancel()
      this.insertText('const ')
      return this.startProcessor
    }

    if (this.soundsLike('import', word)) {
      cancel()
      this.insertText('import ')
      return this.importProcessor
    }

    if (this.soundsLike('var', word)) {
      cancel()
      this.insertText('var ')
      return this.startProcessor
    }

    super.startProcessor({cancel, word})
  }
}
