var library = require("module-library")(require)

module.exports = library.export(
  "editor",
  ["forkable-list"],
  function(forkableList) {

    function Editor() {
      this.intros = {}
      this.outros = {}
      this.commas = {}
      this.howToClose = {}
      this.linesClosedOn = {}
      this.editables = {}
      this.lines = forkableList([])
    }

    var lastInteger = 1000*50
    function generateId() {
      lastInteger++
      var id = lastInteger.toString(36)
      return "ln-"+id
    }

    Editor.prototype.pressEnter = function(lineNumber) {
      var lineId = this.lines.get(lineNumber)
      var nextLineId = this.lines.get(lineNumber + 1)

      // todo: probably should splice if there's any editable there too
      if (this.intros[nextLineId]) {
        throw new Error("there's stuff on the next line we need to splice")
      } else {
        // just move down a line
        var kind = this.kindOfParent(lineNumber)
        nextLineId = generateId()
        this.lines.splice(lineNumber + 1, 0, nextLineId) 
        var linesClosed = this.linesClosedOn[lineId] 
        this.linesClosedOn[nextLineId] = linesClosed
        delete this.linesClosedOn[lineId]
        if (kind == "function call") {
          this.commas[lineId] = true
        }
      }

    } 

    Editor.prototype.kindOfParent = function(lineNumber) {
      var lineId = this.lines.get(lineNumber)
      var closers = this.linesClosedOn[lineId]
      if (!closers) {
        throw new Error("no parents")
      }
      var lineNumbers = closers.map(this.lines.find.bind(this.lines))
      var latest = Math.max.apply(null, lineNumbers)
      var index = lineNumbers.indexOf(latest)
      var parentId = closers[index]

      var outro = this.outros[parentId]
      if (outro == "left-paren") {
        return "function call"
      } else {
        throw new Error("not sure")
      }
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

      var outro = segments.outro && segments.outro.split("") || []

      var intro = segments.intro && segments.intro.split("") || []

      var isFunctionLiteral = intro && contains(intro, "function ")

      var isFunctionCall = !isFunctionLiteral && outro && outro[0] == "("

      var isStringLiteral = !isFunctionCall

      console.log(JSON.stringify(segments, null, 2))

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

      console.log(JSON.stringify(expression, null, 2))

      var lineId = this.ensureSomethingAt(lineNumber)

      if (expression.kind == "function literal") {

        this.intros[lineId] = "function"
        this.editables[lineId] = expression.functionName
        var nextLineId = this.ensureSomethingAt(lineNumber + 1)

        ensureContains(this.linesClosedOn, nextLineId, lineId)

      } else if (expression.kind == "function call") {

        delete this.intros[lineId]
        this.outros[lineId] = "left-paren"
        this.howToClose[lineId] = "right-paren"
        this.editables[lineId] = expression.functionName
        var nextLineId = this.ensureSomethingAt(lineNumber + 1)

        ensureContains(this.linesClosedOn, nextLineId, lineId)

      } else if (expression.kind == "string literal") {

        this.intros[lineId] = "quote"
        this.outros[lineId] = "quote"
        this.editables[lineId] = expression.string

      }

    }

    Editor.prototype.ensureSomethingAt = function(lineNumber) {
      var lineId = this.lines.get(lineNumber)
      if (!lineId) {
        lineId = generateId()
        this.lines.set(lineNumber, lineId)
      }
      if (!this.editables[lineId]) {
        this.editables[lineId] = Editor.EMPTY
      }
      return lineId
    }

    Editor.prototype.getLineSource = function(lineNumber) {
      var lineId = this.lines.get(lineNumber)
      return this.getIntroSymbols(lineNumber).map(symbolNameToText) + this.editables[lineId] + this.getOutroSymbols(lineNumber).map(symbolNameToText)
    }

    Editor.EMPTY = "\u200b"

    function ensureContains(collection, index, value) {
      if (!collection[index]) {
        collection[index] = []
      }

      collection[index].unshift(value)
    }

    Editor.prototype.getFirstEditable = function(lineNumber) {
      var lineId = this.lines.get(lineNumber)
      return this.editables[lineId]
    }

    function lineToExpression(text) {
      return {
        kind: "string literal"
      }
    }

    Editor.prototype.getIntroSymbols = function(lineNumber) {
      var lineId = this.lines.get(lineNumber)
      var symbol = this.intros[lineId]
      if (symbol) {
        return [symbol]
      } else {
        return []
      }
    } 

    Editor.prototype.getOutroSymbols = function(lineNumber) {
      var lineId = this.lines.get(lineNumber)
      var outro = this.outros[lineId]
      var comma = this.commas[lineId]
      var howToClose = this.howToClose

      if (this.linesClosedOn[lineId]) {
        var closers = this.linesClosedOn[lineId].map(function(lineOpened) {
          return howToClose[lineOpened]
        })
      }

      var symbols = []
      if (outro) {
        symbols.push(outro)
      }
      if (comma) {
        symbols.push("comma")
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