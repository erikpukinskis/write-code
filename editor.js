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

      console.log(JSON.stringify(segments, null, 2))

      return segments
    }

    Editor.prototype.text = function(lineNumber, text) {
      var expression = {}

      var segments = parse(text)

      if (parts[3]) {
        var outro = parts[3].match(/[\[\]}{(),"]+$/)
        if (outro) {
          var freeText = parts[3].slice(0, parts[3].length - outro.length)
        } else {
          var freeText = parts[3]
        }
      } else {
        var outro = false
      }

      // console.  log("···"+text+"···")
      // console.log(JSON.stringify(parts, null, 2))

      if (text.match("browser-bridge")) {
        debugger
      }
      var outroSymbols = null

      var isFunctionCall = outroSymbols && outroSymbols[0] == symbols["left-paren"]

      var isStringLiteral = !isFunctionCall && parts[1] == symbols["quote"]

      if (isFunctionCall) {
        expression.kind = "function call"
        expression.functionName = parts[2]
      } else {
        expression.kind = "string literal"
        expression.string = (parts[2]||"") + (parts[3]||"")
      }

      // if (text.match(/browser-bridge/)) {
      //   debugger
      // }

      if (expression.kind == "string literal") {
        this.intros[lineNumber] = "quote"
        this.outros[lineNumber] = "quote"
        this.editables[lineNumber] = expression.string
      } else if (expression.kind == "function call") {
        delete this.intros[lineNumber]
        this.outros[lineNumber] = "left-paren"
        this.howToClose[lineNumber] = "right-paren"
        this.editables[lineNumber] = expression.functionName
        ensureSomething(this.editables, lineNumber+1)
        ensureContains(this.linesClosedOn, lineNumber+1, lineNumber)
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

    return Editor
  }
)