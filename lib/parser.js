'use babel'

import fs from 'fs'
import os from 'os'
import path from 'path'

export default class Parser {
  constructor ({editor, view}) {
    Object.assign(this, {
      commands: this.loadLanguageCommands('generic'),
      editor,
      likeWordsDictionary: this.loadDictionary('like-words'),
      lineJumpsDictionary: this.loadDictionary('line-jumps'),
      numbersDictionary: this.loadDictionary('numbers'),
      previousHints: [],
      state: this.startProcessor,
      view
    })

    this.commands.snippets = this.loadSnippets()
    this.previousHints = Object.keys(this.commands)
    this.view.setHints(this.previousHints)
  }

  commandProcessor ({cancel, word}) {
    const keys = Object.keys(this.commandsPointer)

    if (keys.indexOf('#') !== -1) {
      const number = this.normalizeNumber(word)

      if (number !== null) {
        cancel()
        this.commandArguments.push(number)
        this.commandsPointer = this.commandsPointer['#']

        if (Array.isArray(this.commandsPointer)) {
          return this.processCommands()
        } else if (typeof this.commandsPointer === 'object') {
          return {
            hints: Object.keys(this.commandsPointer),
            state: this.commandProcessor
          }
        } else if (typeof this.commandsPointer === 'string') {
          this.insertText(this.commandsPointer)
          return {state: this.startProcessor}
        }
      }
    }

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]

      if (this.soundsLike(key, word)) {
        cancel()
        this.commandsPointer = this.commandsPointer[key]

        if (Array.isArray(this.commandsPointer)) {
          return this.processCommands()
        } else if (typeof this.commandsPointer === 'object') {
          return {
            hints: Object.keys(this.commandsPointer),
            state: this.commandProcessor
          }
        } else if (typeof this.commandsPointer === 'string') {
          this.insertText(this.commandsPointer)
          return {state: this.startProcessor}
        }
      }
    }
  }

  goToLine (line) {
    // Don't let user try to access a line before the first one (line 1)
    line = Math.max(1, line) // Don't let line go below 0

    // Don't let line go beyond number of lines in editor
    line = Math.min(line, this.editor.getLineCount())

    // Move cursor to begininning of line specified by user
    this.editor.setCursorScreenPosition([line - 1, 0])
  }

  goToTab (tab) {
    const pane = atom.workspace.getPanes()[0]

    // Don't let user try to access a tab before the first one (tab 1)
    tab = Math.max(1, tab) // Don't let tab go below 0

    // Don't let tab go beyond number of tabs currently open
    tab = Math.min(tab, pane.items.length)

    // Switch active tab
    const activeItem = pane.items[tab - 1]
    pane.setActiveItem(activeItem)
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

  loadDictionary (name) {
    const fileName = `${name}.json`
    const filePath = path.join(__dirname, 'dictionaries', fileName)
    const dictionary = JSON.parse(
      fs.readFileSync(filePath, {encoding: 'utf8'})
    )

    // Integrate users custom dictionary
    try {
      const userDictionaryPath = path.join(os.homedir(), '.code-dictation', fileName)
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

  loadLanguage (language) {
    const commands = this.loadLanguageCommands('generic')
    const languageCommands = this.loadLanguageCommands(language)

    Object.keys(languageCommands).forEach((key) => {
      commands[key] = languageCommands[key]
    })

    this.commands = commands
  }

  loadLanguageCommands (language) {
    const commands = {}
    let definitions

    try {
      const filePath = path.join(__dirname, 'parsers', `${language}.json`)

      definitions = JSON.parse(
        fs.readFileSync(filePath, {encoding: 'utf8'})
      )
    } catch (err) {
      console.info(err)
    }

    if (typeof definitions === 'object') {
      const definitionKeys = Object.keys(definitions)

      definitionKeys.forEach((key) => {
        const commandWords = key.split(' ')
        let pointer = commands

        for (let i = 0; i < commandWords.length; i++) {
          const word = commandWords[i]

          if (i === commandWords.length - 1) {
            pointer[word] = definitions[key]
          } else if (!pointer[word]) {
            pointer[word] = {}
          }

          pointer = pointer[word]
        }
      })
    }

    return commands
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

        pointer = [{command: 'snippet'}]
      })

    return snippets
  }

  normalizeNumber (word) {
    if (/^\d+$/.test(word)) {
      return parseInt(word)
    }

    if (word in this.numbersDictionary) {
      return this.numbersDictionary[word]
    }

    return null
  }

  process ({cancel, text}) {
    text.toLowerCase().split(' ').forEach((word) => {
      if (this.state === this.startProcessor) {
        this.wordBuffer = []
      }

      this.wordBuffer.push(word)
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
      this.previousHints = Object.keys(this.commands)
      this.view.setHints(this.previousHints)
      this.previousHints = []
    }
  }

  processChangeTabCommand (definition, args) {
    const pane = atom.workspace.getPanes()[0]
    const currentTab = pane.items.indexOf(pane.activeItem) + 1
    let tab = definition.tab || args[0]

    if (/^\+\d+$/.test(tab)) {
      tab = currentTab + this.normalizeNumber(tab.match(/\d+/)[0])
    } else if (/^-\d+$/.test(tab)) {
      tab = currentTab - this.normalizeNumber(tab.match(/\d+/)[0])
    }

    this.goToTab(tab)

    return {state: this.startProcessor}
  }

  processCloseTabCommand (definition, args) {
    atom.workspace.getPanes()[0].activeItem.destroy()
    return {state: this.startProcessor}
  }

  processCommand (definition) {
    const args = this.commandArguments

    switch (definition.command) {
      case 'changeTab':
        return this.processChangeTabCommand(definition, args)

      case 'closeTab':
        return this.processCloseTabCommand(definition, args)

      case 'line':
        return this.processLineCommand(definition, args)

      case 'newFile':
        return this.processNewFileCommand(definition, args)
    }
  }

  processCommands () {
    this.commandsPointer.forEach((commandDefinition) => {
      this.processCommand(commandDefinition)
    })

    return {state: this.startProcessor}
  }

  processLineCommand (definition, args) {
    const currentLine = this.editor.getCursorScreenPosition().row + 1
    let line = definition.line || args[0]

    if (/^\+\d+$/.test(line)) {
      line = currentLine + this.normalizeNumber(line.match(/\d+/)[0])
    } else if (/^-\d+$/.test(line)) {
      line = currentLine - this.normalizeNumber(line.match(/\d+/)[0])
    }

    this.goToLine(line)

    return {state: this.startProcessor}
  }

  processNewFileCommand (definition, args) {
    atom.workspace.open()
    return {state: this.startProcessor}
  }

  processSnippetCommand () {
    const snippetsPath = path.join(os.homedir(), '.code-dictation', 'snippets')
    const fileName = this.wordBuffer.join('-')
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

  soundsLike (expected, actual) {
    if (actual === expected) return true
    const likeWords = this.likeWordsDictionary[expected]
    if (!likeWords) return false
    return likeWords.indexOf(actual) !== -1
  }

  startProcessor ({cancel, word}) {
    if (word in this.lineJumpsDictionary) {
      cancel()
      this.goToLine(this.lineJumpsDictionary[word])
      return {state: this.startProcessor}
    }

    this.commandArguments = []
    this.commandsPointer = this.commands
    return this.commandProcessor({cancel, word})
  }
}
