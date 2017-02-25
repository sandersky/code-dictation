'use babel'

import fs from 'fs'
import os from 'os'
import path from 'path'

export default class GenericParser {
  constructor ({editor, view}) {
    Object.assign(this, {
      buffer: [],
      editor,
      likeWordsDictionary: this.loadDictionary('like-words'),
      lineJumps: this.loadDictionary('line-jumps'),
      numberDictionary: this.loadDictionary('number'),
      previousHints: [],
      snippets: this.loadSnippets(),
      state: this.startProcessor,
      view
    })
  }

  insertText (text, options = {}) {
    if (options.leadingSpace) {
      const cursorPoint = this.editor.getCursorScreenPosition()
      const lineText = this.editor.lineTextForScreenRow(cursorPoint.row)
      const matches = lineText.match(/^\s+/)

      if (matches) {
        const leadingWhitespace = matches[0]
        text = text.split('\n').join(`\n${leadingWhitespace}`)
      }
    }

    this.editor.insertText(text)
  }

  loadDictionary (name, grammar) {
    const basePath = path.join(__dirname, '..', 'dictionaries')
    const fileName = `${name}.json`
    const filePath = grammar ? path.join(basePath, grammar, fileName) : path.join(basePath, fileName)
    const dictionary = JSON.parse(
      fs.readFileSync(filePath, {encoding: 'utf8'})
    )

    // Integrate users custom dictionary
    try {
      const userDictionaryPath = path.join(os.homedir(), '.code-dictation', 'like-words.json')
      const userDictionary = JSON.parse(
        fs.readFileSync(userDictionaryPath, {encoding: 'utf8'})
      )

      Object.keys(userDictionary).forEach((key) => {
        dictionary[key] = userDictionary[key]
      })
    } catch (err) {
      //
    }

    return dictionary
  }

  loadSnippets () {
    let fileNames

    try {
      const snippetsPath = path.join(os.homedir(), '.code-dictation', 'snippets')
      fileNames = fs.readdirSync(snippetsPath)
    } catch (err) {
      return {}
    }

    const snippets = {}

    fileNames.map((fileName) => fileName.toLowerCase().replace(/\.([^.]+)/, '').split('-'))
      .forEach((commandWords) => {
        let pointer = snippets

        for (let i = 0; i < commandWords.length; i++) {
          const word = commandWords[i]
          if (!pointer[word]) pointer[word] = {}
          pointer = pointer[word]
        }
      })

    return snippets
  }

  normalizeNumber (word) {
    if (/^\d+$/.test(word)) {
      return parseInt(word)
    }

    if (word in this.numberDictionary) {
      return this.numberDictionary[word]
    }

    return null
  }

  process ({cancel, text}) {
    text.toLowerCase().split(' ').forEach((word) => {
      const {hints, state} = this.state({cancel, word}) || {}
      this.view.setHints(hints)

      if (this.state !== this.startProcessor || state !== this.startProcessor) {
        cancel()
      }

      this.state = state || this.state

      if (!state) {
        this.view.addWrongWord(word)
        this.view.setHints(this.previousHints)
      }  else {
        this.previousHints = hints
      }
    })

    if (this.state === this.startProcessor) {
      this.view.clearWords()
      this.previousHints = []
    }
  }

  soundsLike (expected, actual) {
    if (actual === expected) return true
    const likeWords = this.likeWordsDictionary[expected]
    if (!likeWords) return false
    return likeWords.indexOf(actual) !== -1
  }

  // Helpers

  getSnippetHints (words) {
    let pointer = this.snippets

    for (let i = 0; i < words.length; i++) {
      const word = words[i]
      pointer = pointer[word]
    }

    return Object.keys(pointer)
  }

  goToLine (line) {
    // Don't let user try to access a line before the first one (line 1)
    line = Math.max(1, line) // Don't let line go below 0

    // Don't let line go beyond number of lines in editor
    line = Math.min(line, this.editor.getLineCount())

    // Move cursor to begininning of line specified by user
    this.editor.setCursorScreenPosition([line - 1, 0])
  }

  // Processor methods

  goProcessor ({cancel, word}) {
    const nextStates = {
      to: {
        hints: ['line'],
        state: this.goToProcessor
      }
    }

    const nextStateKeys = Object.keys(nextStates)

    for (let i = 0; i < nextStateKeys.length; i++) {
      if (this.soundsLike(nextStateKeys[i], word)) {
        this.view.addWords(nextStateKeys[i])
        return nextStates[nextStateKeys[i]]
      }
    }

    // "to line"
    if (word === 'lunchtime') {
      this.view.addWords('to', 'line')
      return {
        hints: ['#'],
        state: this.goToLineProcessor
      }
    }
  }

  goToLineProcessor ({cancel, word}) {
    if (/^\d+$/.test(word)) {
      const line = parseInt(word.match(/\d+/)[0])
      this.goToLine(line)
      return {state: this.startProcessor}
    }

    const number = this.normalizeNumber(word)

    if (number) {
      this.goToLine(number)
      return {state: this.startProcessor}
    }
  }

  goToProcessor ({cancel, word}) {
    const nextStates = {
      line: {
        hints: ['#'],
        state: this.goToLineProcessor
      }
    }

    const nextStateKeys = Object.keys(nextStates)

    for (let i = 0; i < nextStateKeys.length; i++) {
      if (this.soundsLike(nextStateKeys[i], word)) {
        this.view.addWords(nextStateKeys[i])
        return nextStates[nextStateKeys[i]]
      }
    }

    if (word in this.lineJumps) {
      goToLine(this.lineJumps[word])
      return {state: this.startProcessor}
    }
  }

  snippetProcessor ({cancel, word}) {
    let pointer = this.snippets

    for (let i = 0; i < this.snippetBuffer.length; i++) {
      pointer = pointer[this.snippetBuffer[i]]
    }

    const match = Object.keys(pointer).find((key) => {
      if (this.soundsLike(key, word)) {
        pointer = pointer[key]
        this.snippetBuffer.push(key)
        return true
      }
    })

    // Word doesn't match and snippet commands
    if (!match) return

    const keys = Object.keys(pointer)

    // If wev'e reached end of snippet command
    if (keys.length === 0) {
      const snippetsPath = path.join(os.homedir(), '.code-dictation', 'snippets')
      const fileName = this.snippetBuffer.join('-')
      const filePath = path.join(snippetsPath, `${fileName}.txt`)

      try {
        const contents = fs.readFileSync(filePath, {encoding: 'utf8'})
        this.insertText(contents, {leadingSpace: true})
      } catch (err) {
        console.error(err)
        // TODO: notify user we failed to load snippet?
      }

      return {state: this.startProcessor}
    }

    return {
      hints: this.getSnippetHints(this.snippetBuffer),
      state: this.snippetProcessor
    }
  }

  startProcessor ({cancel, word}) {
    const nextStates = {
      go: {
        hints: ['to'],
        state: this.goProcessor
      },
      line: {
        hints: ['#'],
        state: this.goToLineProcessor
      }
    }

    const nextStateKeys = Object.keys(nextStates)

    for (let i = 0; i < nextStateKeys.length; i++) {
      if (this.soundsLike(nextStateKeys[i], word)) {
        this.view.addWords(nextStateKeys[i])
        return nextStates[nextStateKeys[i]]
      }
    }

    if (this.soundsLike('down', word)) {
      this.goToLine(this.editor.getCursorScreenPosition().row + 2)
      return {state: this.startProcessor}
    }

    if (this.soundsLike('snippet', word)) {
      this.snippetBuffer = []

      return {
        hints: this.getSnippetHints(this.snippetBuffer),
        state: this.snippetProcessor
      }
    }

    if (this.soundsLike('up', word)) {
      this.goToLine(this.editor.getCursorScreenPosition().row)
      return {state: this.startProcessor}
    }

    if (word in this.lineJumps) {
      goToLine(this.lineJumps[word])
      return {
        hints: ['#'],
        state: this.startProcessor
      }
    }
  }
}
