'use babel'

import fs from 'fs'
import os from 'os'

import likeWordsDictionary from '../lib/dictionaries/like-words'
import lineJumpsDictionary from '../lib/dictionaries/line-jumps'
import numbersDictionary from '../lib/dictionaries/numbers'
import Parser from '../lib/parser'
import genericParser from '../lib/parsers/generic'
import genericCommandsNoSnippets from './fixtures/generic-commands-no-snippets'
import genericCommandsWithSnippets from './fixtures/generic-commands-with-snippets'
import mergedLikeWordsDictionary from './fixtures/merged-like-words-dictionary'
import mergedLineJumpsDictionary from './fixtures/merged-line-jumps-dictionary'
import mergedNumbersDictionary from './fixtures/merged-numbers-dictionary'
import CodeDictationViewMock from './mocks/code-dictation-view'

describe('parser', () => {
  let editor, view

  beforeEach(() => {
    editor = atom.workspace.buildTextEditor()
    view = new CodeDictationViewMock()
  })

  describe('with no user data', () => {
    let parser

    beforeEach(() => {
      spyOn(fs, 'readFileSync').andCallFake((filePath) => {
        filePath = filePath.replace(/.*\/lib\//, '')

        switch (filePath) {
          case 'dictionaries/like-words.json':
            return JSON.stringify(likeWordsDictionary)

          case 'dictionaries/line-jumps.json':
            return JSON.stringify(lineJumpsDictionary)

          case 'dictionaries/numbers.json':
            return JSON.stringify(numbersDictionary)

          case 'parsers/generic.json':
            return JSON.stringify(genericParser)

          default:
            throw new Error(`Failed to load file ${filePath}`)
        }
      })
      spyOn(fs, 'readdirSync').andReturn([])
      parser = new Parser({editor, view})
    })

    it('loads commands', () => {
      expect(parser.commands).toEqual(genericCommandsNoSnippets)
    })

    it('sets the editor', () => {
      expect(parser.editor).toBe(editor)
    })

    it('initializes like-words dictionary', () => {
      expect(parser.likeWordsDictionary).toEqual(likeWordsDictionary)
    })

    it('initializes line-jumps dictionary', () => {
      expect(parser.lineJumpsDictionary).toEqual(lineJumpsDictionary)
    })

    it('initializes numbers dictionary', () => {
      expect(parser.numbersDictionary).toEqual(numbersDictionary)
    })

    it('initializes previous hints as empty array', () => {
      expect(parser.previousHints).toEqual([])
    })

    it('initializes processor state to be start state', () => {
      expect(parser.state).toBe(parser.startProcessor)
    })

    it('sets the view', () => {
      expect(parser.view).toBe(view)
    })

    describe('insertText()', () => {
      describe('when leadingSpace options is not set', () => {
        describe('when cursor is at start of line', () => {
          beforeEach(() => {
            editor.setCursorScreenPosition([0, 0])
            parser.insertText('foo\nbar')
          })

          it('inserts text as expected', () => {
            expect(editor.getText()).toBe('foo\nbar')
          })
        })

        describe('when cursor is not at start of line', () => {
          beforeEach(() => {
            editor.insertText('    ')
            editor.setCursorScreenPosition([0, 4])
            parser.insertText('foo\nbar')
          })

          it('inserts text as expected', () => {
            expect(editor.getText()).toBe('    foo\nbar')
          })
        })
      })

      describe('when leadingSpace options is true', () => {
        describe('when cursor is at start of line', () => {
          beforeEach(() => {
            editor.setCursorScreenPosition([0, 0])
            parser.insertText('foo\nbar', {leadingSpace: true})
          })

          it('inserts text as expected', () => {
            expect(editor.getText()).toBe('foo\nbar')
          })
        })

        describe('when cursor is not at start of line', () => {
          beforeEach(() => {
            editor.insertText('    ')
            editor.setCursorScreenPosition([0, 4])
            parser.insertText('foo\nbar', {leadingSpace: true})
          })

          it('inserts text as expected', () => {
            expect(editor.getText()).toBe('    foo\n    bar')
          })
        })
      })

      describe('when leadingSpace options is false', () => {
        describe('when cursor is at start of line', () => {
          beforeEach(() => {
            editor.setCursorScreenPosition([0, 0])
            parser.insertText('foo\nbar', {leadingSpace: false})
          })

          it('inserts text as expected', () => {
            expect(editor.getText()).toBe('foo\nbar')
          })
        })

        describe('when cursor is not at start of line', () => {
          beforeEach(() => {
            editor.insertText('    ')
            editor.setCursorScreenPosition([0, 4])
            parser.insertText('foo\nbar', {leadingSpace: false})
          })

          it('inserts text as expected', () => {
            expect(editor.getText()).toBe('    foo\nbar')
          })
        })
      })
    })
  })

  describe('with user defined like-words', () => {
    let parser

    beforeEach(() => {
      spyOn(fs, 'readFileSync').andCallFake((filePath) => {
        filePath = filePath
          .replace(/.*\/lib\//, '')
          .replace(os.homedir(), '~')

        switch (filePath) {
          case '~/.code-dictation/like-words.json':
            return JSON.stringify({
              bar: ['car'],
              baz: ['jazz'],
              foo: ['boo', 'too']
            })

          case 'dictionaries/like-words.json':
            return JSON.stringify(likeWordsDictionary)

          case 'dictionaries/line-jumps.json':
            return JSON.stringify(lineJumpsDictionary)

          case 'dictionaries/numbers.json':
            return JSON.stringify(numbersDictionary)

          case 'parsers/generic.json':
            return JSON.stringify(genericParser)

          default:
            throw new Error(`Failed to load file ${filePath}`)
        }
      })
      spyOn(fs, 'readdirSync').andReturn([])
      parser = new Parser({editor, view})
    })

    it('loads commands', () => {
      expect(parser.commands).toEqual(genericCommandsNoSnippets)
    })

    it('sets the editor', () => {
      expect(parser.editor).toBe(editor)
    })

    it('initializes like-words dictionary with user defined like-words', () => {
      expect(parser.likeWordsDictionary).toEqual(mergedLikeWordsDictionary)
    })

    it('initializes line-jumps dictionary', () => {
      expect(parser.lineJumpsDictionary).toEqual(lineJumpsDictionary)
    })

    it('initializes numbers dictionary', () => {
      expect(parser.numbersDictionary).toEqual(numbersDictionary)
    })

    it('initializes previous hints as empty array', () => {
      expect(parser.previousHints).toEqual([])
    })

    it('initializes processor state to be start state', () => {
      expect(parser.state).toBe(parser.startProcessor)
    })

    it('sets the view', () => {
      expect(parser.view).toBe(view)
    })
  })

  describe('with user defined line-jumps', () => {
    let parser

    beforeEach(() => {
      spyOn(fs, 'readFileSync').andCallFake((filePath) => {
        filePath = filePath
          .replace(/.*\/lib\//, '')
          .replace(os.homedir(), '~')

        switch (filePath) {
          case '~/.code-dictation/line-jumps.json':
            return JSON.stringify({
              bar: 1,
              baz: 2,
              foo: 3
            })

          case 'dictionaries/like-words.json':
            return JSON.stringify(likeWordsDictionary)

          case 'dictionaries/line-jumps.json':
            return JSON.stringify(lineJumpsDictionary)

          case 'dictionaries/numbers.json':
            return JSON.stringify(numbersDictionary)

          case 'parsers/generic.json':
            return JSON.stringify(genericParser)

          default:
            throw new Error(`Failed to load file ${filePath}`)
        }
      })
      spyOn(fs, 'readdirSync').andReturn([])
      parser = new Parser({editor, view})
    })

    it('loads commands', () => {
      expect(parser.commands).toEqual(genericCommandsNoSnippets)
    })

    it('sets the editor', () => {
      expect(parser.editor).toBe(editor)
    })

    it('initializes like-words dictionary', () => {
      expect(parser.likeWordsDictionary).toEqual(likeWordsDictionary)
    })

    it('initializes line-jumps dictionary with user defined line-jumps', () => {
      expect(parser.lineJumpsDictionary).toEqual(mergedLineJumpsDictionary)
    })

    it('initializes numbers dictionary', () => {
      expect(parser.numbersDictionary).toEqual(numbersDictionary)
    })

    it('initializes previous hints as empty array', () => {
      expect(parser.previousHints).toEqual([])
    })

    it('initializes processor state to be start state', () => {
      expect(parser.state).toBe(parser.startProcessor)
    })

    it('sets the view', () => {
      expect(parser.view).toBe(view)
    })
  })

  describe('with user defined numbers', () => {
    let parser

    beforeEach(() => {
      spyOn(fs, 'readFileSync').andCallFake((filePath) => {
        filePath = filePath
          .replace(/.*\/lib\//, '')
          .replace(os.homedir(), '~')

        switch (filePath) {
          case '~/.code-dictation/numbers.json':
            return JSON.stringify({
              dos: 2,
              tres: 3,
              uno: 1
            })

          case 'dictionaries/like-words.json':
            return JSON.stringify(likeWordsDictionary)

          case 'dictionaries/line-jumps.json':
            return JSON.stringify(lineJumpsDictionary)

          case 'dictionaries/numbers.json':
            return JSON.stringify(numbersDictionary)

          case 'parsers/generic.json':
            return JSON.stringify(genericParser)

          default:
            throw new Error(`Failed to load file ${filePath}`)
        }
      })
      spyOn(fs, 'readdirSync').andReturn([])
      parser = new Parser({editor, view})
    })

    it('loads commands', () => {
      expect(parser.commands).toEqual(genericCommandsNoSnippets)
    })

    it('sets the editor', () => {
      expect(parser.editor).toBe(editor)
    })

    it('initializes like-words dictionary', () => {
      expect(parser.likeWordsDictionary).toEqual(likeWordsDictionary)
    })

    it('initializes line-jumps dictionary', () => {
      expect(parser.lineJumpsDictionary).toEqual(lineJumpsDictionary)
    })

    it('initializes numbers dictionary with user defined numbers', () => {
      expect(parser.numbersDictionary).toEqual(mergedNumbersDictionary)
    })

    it('initializes previous hints as empty array', () => {
      expect(parser.previousHints).toEqual([])
    })

    it('initializes processor state to be start state', () => {
      expect(parser.state).toBe(parser.startProcessor)
    })

    it('sets the view', () => {
      expect(parser.view).toBe(view)
    })
  })

  describe('with user defined snippets', () => {
    let parser

    beforeEach(() => {
      spyOn(fs, 'readFileSync').andCallFake((filePath) => {
        filePath = filePath.replace(/.*\/lib\//, '')

        switch (filePath) {
          case 'dictionaries/like-words.json':
            return JSON.stringify(likeWordsDictionary)

          case 'dictionaries/line-jumps.json':
            return JSON.stringify(lineJumpsDictionary)

          case 'dictionaries/numbers.json':
            return JSON.stringify(numbersDictionary)

          case 'foo-bar.txt':
            return "Foo bar, where's my car?"

          case 'foo-baz.txt':
            return 'Foo baz,\nI like jazz!'

          case 'parsers/generic.json':
            return JSON.stringify(genericParser)

          case 'spam.txt':
            return 'Spam is disgusting'

          default:
            throw new Error(`Failed to load file ${filePath}`)
        }
      })
      spyOn(fs, 'readdirSync').andReturn([
        'foo-bar.txt',
        'foo-baz.txt',
        'spam.txt'
      ])

      parser = new Parser({editor, view})
    })

    it('loads commands', () => {
      expect(parser.commands).toEqual(genericCommandsWithSnippets)
    })

    it('sets the editor', () => {
      expect(parser.editor).toBe(editor)
    })

    it('initializes like-words dictionary', () => {
      expect(parser.likeWordsDictionary).toEqual(likeWordsDictionary)
    })

    it('initializes line-jumps dictionary', () => {
      expect(parser.lineJumpsDictionary).toEqual(lineJumpsDictionary)
    })

    it('initializes numbers dictionary', () => {
      expect(parser.numbersDictionary).toEqual(numbersDictionary)
    })

    it('initializes previous hints as empty array', () => {
      expect(parser.previousHints).toEqual([])
    })

    it('initializes processor state to be start state', () => {
      expect(parser.state).toBe(parser.startProcessor)
    })

    it('sets the view', () => {
      expect(parser.view).toBe(view)
    })
  })
})
