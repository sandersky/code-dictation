# code-dictation package

An Atom plugin to enable dictating code. It is as easy as:

1. Get a computer running OS X if you don't have one already.
2. [Enable dictation on your
computer](https://support.apple.com/en-us/HT202584).
3. Install this plugin in Atom by running the command `apm install code-dictation`.
4. In your editor enable dictation with `Ctrl+Alt+O` *(Use the same command to turn dictation off)*.
5. Enable your Mac's dictation so it listens to your voice *(double tap the `fn` key)*.
6. Learn what voice commands are built-in and go nuts.

Below are the voice commands currently supported by this
plugin:

* **down** – move cursor to beginning of next line
* **go to line x** – move cursor to beginning of line x (replace x with a number)
* **line x** – move cursor to beginning of line x (replace x with a number)
* **up** – move cursor to beginning of previous line

Additional commands exist for the following languages and will automatically be
loaded if the file you are working on has the proper grammar set for the file
type:

* [JavaScript](documentation/languages/javascript.md)

## Configuration

When you say **line** Apple's dictation may end up hearing **wine** instead. The rate at which words aren't quite right would make voice commands rather useless if the plugin didn't handle these cases and treat them as if they are the intended word. This plugin does handle these use cases via a [like-words dictionary file](lib/dictionaries/like-words.json), which maps supported voice command words to alternatives the speech recognition layer may think it heard. If you find the built-in dictionary doesn't quite cut it for you and the plugin is constantly rejecting your speech you can define your own like-words dictionary in a file at *~/.code-dictation/like-words.json*. This should be in the same format as the file mentioned above that is the default dictionary for this project.

## Snippets

One of the arguably more powerful features of this plugin is the ability to on-board your code code snippets. The way this works is you add files to the directory *~/.code-dictation/snippets/* and this plugin will automatically turn those into valid voice commands.
The filename should be the words that make up the voice command separating words with hyphens. For example if I want a command that generates the base content for a `package.json` file (for a Node package), I might want to add a command triggered by `node package`. All I have to do is add a file named `node-package.txt` to the location mentioned previously and in it paste the contents of my snippet which may look something like:

```json
{
  "name": "",
  "description": "",
  "version": "0.0.0",
  "scripts": {},
  "devDependencies": {},
  "dependencies": {}
}
```

Then with this plugin running I can simply say `snippet node package` and the contents above will automatically be pasted into the editor at the current cursor location.

> Note: To trigger a snippet command you must say `snippet` followed by your on-boarded command. 
