var library = require("module-library")(require)

module.exports = library.export(
  "editor",
  ["forkable-list"],
  function(forkableList) {

    function Editor(tree) {
      this.tree = tree
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
      if (typeof lineNumber != "number") {
        throw new Error("what line are we pressing Enter from?")
      }
      var lineId = this.lines.get(lineNumber)
      var role = this.role(lineNumber)

      this.addLineAfter(lineNumber)

      if (role == "function call argument") {
        this.commas[lineId] = true
      }
    }

    Editor.prototype.addLineAfter = function(lineNumber) {
      var nextLineId = this.lines.get(lineNumber + 1)
      var nextLineIsEmpty = this.editables[nextLineId] == Editor.EMPTY

      if (nextLineIsEmpty) {
        return        
      }

      var nextLineId = generateId()
      this.lines.splice(lineNumber + 1, 0, nextLineId)
      this.ensureSomethingAt(lineNumber + 1)
      var lineId = this.lines.get(lineNumber)
      var linesClosed = this.linesClosedOn[lineId] 
      this.linesClosedOn[nextLineId] = linesClosed
      delete this.linesClosedOn[lineId]
      return nextLineId
    }

    function lineClosedBy(editor, lineId) {
      var closers = editor.linesClosedOn[lineId]

      if (!closers) {
        return
      }
      var lineNumbers = closers.map(editor.lines.find.bind(editor.lines))
      var latest = Math.max.apply(null, lineNumbers)
      var index = lineNumbers.indexOf(latest)
      return closers[index]
    }

    Editor.prototype.role = function(lineNumber) {
      var lineId = this.lines.get(lineNumber)

      if (this.commas[lineId]) {
        throw new Error("probably an arg?")
        return "function call arg"
      }

      var openerId = lineClosedBy(this, lineId)
      var outro = this.outros[openerId]

      if (!openerId) {
        return "opener"
      } else if (outro == "left-paren") {
        return "function call argument"
      } else {
        throw new Error("not sure")
      }
    }

    var symbolText = {
      "quote": "\"",
      "left-paren": "(",
      "right-paren": ")", 
      "arguments-open": "(",
      "arguments-close": ")", 
      "curly-open": "{",
      "curly-close": "}",
      "left-brace": "[",
      "right-brace": "]",
      "function": "function",
      "var": "var",
    }

    var symbolNames = {}
    for(var name in symbolText) {
      var text = symbolText[name]
      symbolNames[name] = text
    }

    Editor.symbolName = function(text) {
      return symbolNames[text]
    }

    Editor.symbolText = function(name) {
      return symbolText[name]
    }

    Editor.prototype.parse = function(text) {

      var introMatch = text.match(/^("?function\s|"?var\s)/) || text.match(/^"/)
      var outroMatch = text.match(/("?function\s|"?var\s|")?(.*?)([\[\]}{(),"]*)$/)
      var intro = introMatch && introMatch[0]
      var middle = outroMatch[2]
      var outro = outroMatch[3]

      if (middle.match(/[^\u200b]/)) {
        middle = middle.replace(Editor.EMPTY, "")
      }

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

      var emptyMatch = text.match(/^[\s\u200b]*"?[\s\u200b]*$/)

      if (emptyMatch) {
        return
      }

      var segments = this.parse(text)

      var expression = {}

      var outro = segments.outro && segments.outro.split("") || []

      var intro = introFromSegments(segments)

      var isFunctionLiteral = intro == "function"

      var isFunctionCall = !isFunctionLiteral && segments.outro && !!segments.outro.match(/^\([^{]*$/)

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

    function introFromSegments(segments) {
      var intro = segments.intro

      if (!intro) {
        return
      }

      if (intro.match(/function/)) {
        return "function"
      } else if (intro.match(/var/)) {
        return "var"
      } else if (intro.match(/"/)) {
        return "quote"
      }
    }

    Editor.prototype.text = function(lineNumber, text) {
      var expression = this.detectExpression(text)

      var lineId = this.ensureSomethingAt(lineNumber)

      var linesPreviouslyClosedHere = this.linesClosedOn[lineId]

      if (!expression) {
        delete this.intros[lineId]
        delete this.outros[lineId]
        this.editables[lineId] = Editor.EMPTY

      } else if (expression.kind == "function literal") {

        this.intros[lineId] = "function"
        this.outros[lineId] = ["arguments-open","arguments-close","curly-open"]
        this.editables[lineId] = " "+(expression.functionName || "")

        var nextLineId = this.addLineAfter(lineNumber)

        delete this.linesClosedOn[lineId]
        this.linesClosedOn[nextLineId] = linesPreviouslyClosedHere

        this.howToClose[lineId] = "curly-close"
        ensureContains(this.linesClosedOn, nextLineId, lineId)

      } else if (expression.kind == "function call") {

        this.editables[lineId] = expression.functionName

        if (this.outros[lineId] == "left-paren") {
          return
        }

        delete this.intros[lineId]
        this.outros[lineId] = "left-paren"
        this.howToClose[lineId] = "right-paren"

        if (linesPreviouslyClosedHere) {
          var nextLineId = this.addLineAfter(lineNumber)
          delete this.linesClosedOn[lineId]
          this.linesClosedOn[nextLineId] = linesPreviouslyClosedHere

        } else {
          var nextLineId = this.ensureSomethingAt(lineNumber + 1)
        }

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
      if (outro && Array.isArray(outro)) {
        symbols = symbols.concat(outro)
      } else if (outro) {
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