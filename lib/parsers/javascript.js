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

  startProcessor ({cancel, word}) {
    if (this.soundsLike('const', word)) {
      cancel()
      this.insertText('const ')
      return this.startProcessor
    }

    if (this.soundsLike('var', word)) {
      cancel()
      this.insertText('var ')
      return this.startProcessor
    }

    super.startProcessor({cancel, word})
  }
}
