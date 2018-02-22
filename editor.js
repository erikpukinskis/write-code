var library = require("module-library")(require)

module.exports = library.export(
  "editor",
  [],
  function(regex) {

    function Editor() {
      this.intros = {}
      this.outros = {}
      this.howToClose = {}
      this.linesClosedOn = {}
      this.editables = {}
    }

    var symbols = {
      "quote": "\"",
      "left-paren": "(",
      "right-paren": "(",
      "open-curly": "{",
      "close-curly": "}",
      "left-brace": "[",
      "right-brace": "]",
      "function": "function",
      "var": "var",
    }

    function symbolNameToText(name) {
      return symbols[name]
    }

    Editor.prototype.parse = function(text) {
      var introOutro = text.match(/^("?function |"?var |")?(.*?)([\[\]}{(),"]*)$/)
      var intro = introOutro[1]
      var middle = introOutro[2]
      var outro = introOutro[3]

      var regex = /^([.\w]*)((\((\w+,?)*\))|([+<>=:]\w+)+|(.+))*$/

      var parts = (middle||"").match(regex)

      var identifierIsh = parts[1]
      var notIdentifier = parts[2]
      var argumentSignature = parts[3]
      var moarExpression = parts[5]
      var notCode = parts[6]

      var segments = {
        text: text,
        intro: intro,
        outro: outro,
        middle: middle,
        identifierIsh: identifierIsh,
        notIdentifier: notIdentifier,
        argumentSignature: argumentSignature,
        moarExpression: moarExpression,
      }

      return segments
    }

    Editor.prototype.detectExpression = function(text) {
      var expression = {}

      var segments = this.parse(text)

      console.log(JSON.stringify(segments, null, 2))

      var outro = segments.outro && segments.outro.split("") || []
      var intro = segments.intro && segments.intro.split("") || []


      var isFunctionLiteral = intro && contains(intro, "function ")

      var isFunctionCall = !isFunctionLiteral && outro && outro[0] == "("

      var isStringLiteral = !isFunctionCall

      if (isFunctionLiteral) {
        expression.kind = "function literal"
        expression.functionName = segments.identifierIsh
      } else if (isFunctionCall) {
        expression.kind = "function call"
        expression.functionName = segments.identifierIsh
      } else if (isStringLiteral) {
        expression.kind = "string literal"
        expression.string = segments.middle
      }

      return expression
    }

    Editor.prototype.text = function(lineNumber, text) {
      var expression = this.detectExpression(text)

      if (expression.kind == "function literal") {

        this.intros[lineNumber] = "function"
        this.editables[lineNumber] = expression.functionName
        ensureSomething(this.editables, lineNumber+1)
        ensureContains(this.linesClosedOn, lineNumber+1, lineNumber)

      } else if (expression.kind == "function call") {

        delete this.intros[lineNumber]
        this.outros[lineNumber] = "left-paren"
        this.howToClose[lineNumber] = "right-paren"
        this.editables[lineNumber] = expression.functionName
        ensureSomething(this.editables, lineNumber+1)
        ensureContains(this.linesClosedOn, lineNumber+1, lineNumber)

      } else if (expression.kind == "string literal") {

        this.intros[lineNumber] = "quote"
        this.outros[lineNumber] = "quote"
        this.editables[lineNumber] = expression.string

      }

    }

    function ensureSomething(editables, lineNumber) {
      if (!editables[lineNumber]) {
        editables[lineNumber] = Editor.EMPTY
      }
    }

    Editor.prototype.getLineSource = function(lineNumber) {
      return this.getIntroSymbols(lineNumber).map(symbolNameToText) + this.editables[lineNumber] + this.getOutroSymbols(lineNumber).map(symbolNameToText)
    }

    Editor.EMPTY = "\u200b"

    function ensureContains(collection, index, value) {
      if (!collection[index]) {
        collection[index] = []
      }

      collection[index].unshift(value)
    }

    Editor.prototype.getFirstEditable = function(lineNumber) {
      return this.editables[lineNumber]
    }

    function lineToExpression(text) {
      return {
        kind: "string literal"
      }
    }

    Editor.prototype.pressEnter = function() {
    } 

    Editor.prototype.getIntroSymbols = function(lineNumber) {
      var symbol = this.intros[lineNumber]
      if (symbol) {
        return [symbol]
      } else {
        return []
      }
    } 

    Editor.prototype.getOutroSymbols = function(lineNumber) {
      var outro = this.outros[lineNumber]
      var howToClose = this.howToClose

      if (this.linesClosedOn[lineNumber]) {
        var closers = this.linesClosedOn[lineNumber].map(function(lineOpened) {
          return howToClose[lineOpened]
        })
      }

      var symbols = []
      if (outro) {
        symbols.push(outro)
      }
      if (closers) {
        symbols = symbols.concat(closers)
      }
      return symbols
    }

    function contains(array, value) {
      if (!Array.isArray(array)) {
        throw new Error("looking for "+JSON.stringify(value)+" in "+JSON.stringify(array)+", which is supposed to be an array. But it's not.")
      }
      var index = -1;
      var length = array.length;
      while (++index < length) {
        if (array[index] == value) {
          return true
        }
      }
      return false
    }

    return Editor
  }
)