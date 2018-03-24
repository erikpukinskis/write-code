var library = require("module-library")(require)

module.exports = library.export(
  "editor",
  ["forkable-list", "an-expression"],
  function(forkableList, anExpression) {

    function Editor(tree) {
      this.tree = tree
      this.intros = {}
      this.outros = {}
      this.commas = {}
      this.howToClose = {}
      this.linesClosedOn = {}
      this.firstHalves = {}
      this.separators = {}
      this.secondHalves = {}
      this.lineIds = forkableList([])
      this.parents = {}
      this.expressions = {}
    }

    var lastInteger = 1000*50
    function generateId() {
      return anExpression.id()
    }

    Editor.prototype.pressEnter = function(lineNumber) {
      if (typeof lineNumber != "number") {
        throw new Error("what line are we pressing Enter from?")
      }
      var lineId = this.lineIds.get(lineNumber)
      var role = this.role(lineNumber)

      this.addLineAfter(lineNumber, lineId)

      if (role == "function call argument") {
        this.commas[lineId] = true
      }
    }

    Editor.prototype.addLineAfter = function(lineNumber, parentId) {
      var nextLineId = this.lineIds.get(lineNumber + 1)
      var nextLineIsEmpty = this.firstHalves[nextLineId] == Editor.EMPTY

      if (nextLineIsEmpty) {
        return        
      }

      var nextLineId = generateId()

      this.lineIds.splice(lineNumber + 1, 0, nextLineId)
      this.parents[nextLineId] = parentId
      this.ensureSomethingAt(lineNumber + 1, parentId)
      var lineId = this.lineIds.get(lineNumber)
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
      var lineNumbers = closers.map(editor.lineIds.find.bind(editor.lineIds))
      var latest = Math.max.apply(null, lineNumbers)
      var index = lineNumbers.indexOf(latest)
      return closers[index]
    }

    Editor.prototype.role = function(lineNumber) {
      var lineId = this.lineIds.get(lineNumber)

      if (this.commas[lineId]) {
        throw new Error("probably an arg?")
        return "function call arg"
      }

      var openerId = lineClosedBy(this, lineId)
      var outro = this.outros[openerId]

      if (!openerId) {
        if (this.getSeparator(lineNumber) == "arguments-open") {
          return "function literal opener"
        } else {
          return "opener"
        }
      } else if (outro == "left-paren") {
        return "function call argument"
      } else {
        throw new Error("not sure")
      }
    }

    var symbolText = {
      "quote": "\"",
      "comma": ",",
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

      if (middle) {
        var functionLiteralMatch = middle.match(/^\s*(\w*)\s*\(\s*((\w*)\s*(,\s*\w+\s*)*)/)

        var identiferMatch = middle.match(/^\s*([\.\w]+)\s*$/)

        var separatedMatch = middle.match(/^(\w+)\s*([=:])\s*(\w+)$/)

        if (functionLiteralMatch) {
          var identifierIsh = functionLiteralMatch[1]
          var argumentSignature = functionLiteralMatch[2]
        } else if (identiferMatch) {
          var identifierIsh = identiferMatch[1]
        } else if (separatedMatch) {
          var identifierIsh = separatedMatch[1]
          var separator = separatedMatch[2]
          var notIdentifier = separatedMatch[3]
        } else {
          var notIdentifier = middle
        }
      }

      var segments = {
        text: text,
        intro: intro,
        outro: outro,
        middle: middle,
        separator: separator,
        identifierIsh: identifierIsh,
        notIdentifier: notIdentifier,
        argumentSignature: argumentSignature,
      }

      var expectIdentifier = segments.intro && segments.intro.trim() == "var"

      if (expectIdentifier && segments.notIdentifier && !separator) {
        throw new Error("\nthere's probably an identifier in here: "+segments.notIdentifier)
      }

      return segments
    }

    Editor.prototype.detectExpression = function(text) {

      var emptyMatch = text.match(/^[\s\u200b]*"?[\s\u200b]*$/)

      if (emptyMatch) {
        return anExpression.emptyExpression()
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

        if (segments.argumentSignature) {
          expression.argumentNames = segments.argumentSignature.split(/\s*,\s*/)
        }

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

    Editor.prototype.noticeExpressionAt = function(lineNumber, expression) {


      if (!this.rootFunctionId) {

        if (this.tree) {
          var literal = anExpression.functionLiteral()
          this.tree.addExpressionAt(
            this.tree.reservePosition(),
            literal)
          this.rootFunctionId = literal.id
        } else {
          this.rootFunctionId = anExpression.id()
        }

        var emptyId = this.ensureSomethingAt(0, this.rootFunctionId)
        this.parents[emptyId] = this.rootFunctionId
      }

      var lineId = this.lineIds.get(lineNumber)

      expression.id = lineId

      if (!lineId) {
        throw new Error("trying to add an expression for a line without an id")
      }

      if (!this.tree) {
        return
      }

      var staleExpression = this.expressions[lineId]

      if (staleExpression == null) {
        var parentId = this.parents[lineId] || this.rootFunctionId

        this.tree.addToParent(parentId, expression)
        this.expressions[lineId] = expression

      } else if (expression.kind != staleExpression.kind) {
        this.tree.insertExpression(expression, "inPlaceOf", staleExpression.id)
        this.expressions[lineId] = expression

      } else {
        var keys = ["string"]

        for(var i=0; i<keys.length; i++) {
          var key = keys[i]

          if (staleExpression[key] != expression[key]) {
            this.tree.setAttribute(key, staleExpression.id, expression[key])}
            staleExpression[key] = expression[key]
        }
      }

      doubleCheckIds(this, this.tree)
    }

    function doubleCheckIds(editor, tree) {
      for(var index=0; index<editor.expressions.length; index++) {

        var idFromEditor = editor.expressions.get(index).id

        // The tree is indexed off by one, because it has the root expression in it, whereas editor could be indexed from any point in the tree. Right now it just contains a function literal wrapper tho, so its expressions will be at index + 1

        var idFromTree = tree.expressionIds.get(index + 1)

        if (idFromTree != idFromEditor) {
          throw new Error("The editor has expression "+idFromEditor+" at line "+index+" but the tree has "+idFromTree+" at the associated index ("+(index + 1)+")")
        }
      }
    }

    Editor.prototype.text = function(lineNumber, text) {
      var expression = this.detectExpression(text)

      this.noticeExpressionAt(lineNumber, expression)

      var lineId = this.lineIds.get(lineNumber)

      if (!lineId) {
        throw new Error("no id")
      }

      var linesPreviouslyClosedHere = this.linesClosedOn[lineId]

      if (!expression) {
        delete this.intros[lineId]
        delete this.separators[lineId]
        delete this.outros[lineId]
        this.firstHalves[lineId] = Editor.EMPTY
        delete this.secondHalves[lineId]

      } else if (expression.kind == "function literal") {

        this.intros[lineId] = "function"
        this.separators[lineId] = "arguments-open"
        this.outros[lineId] = ["arguments-close","curly-open"]
        this.firstHalves[lineId] = " "+(expression.functionName || "")

        if (expression.argumentNames) {
          this.secondHalves[lineId] = expression.argumentNames.join(", ")
        } else {
          this.secondHalves[lineId] = Editor.EMPTY
        }

        var nextLineId = this.addLineAfter(lineNumber, lineId)

        delete this.linesClosedOn[lineId]
        this.linesClosedOn[nextLineId] = linesPreviouslyClosedHere

        this.howToClose[lineId] = "curly-close"
        ensureContains(this.linesClosedOn, nextLineId, lineId)

      } else if (expression.kind == "function call") {

        this.firstHalves[lineId] = expression.functionName
        delete this.secondHalves[lineId]

        delete this.intros[lineId]
        delete this.separators[lineId]

        this.outros[lineId] = "left-paren"
        this.howToClose[lineId] = "right-paren"

        if (linesPreviouslyClosedHere) {
          var nextLineId = this.addLineAfter(lineNumber, lineId)
          delete this.linesClosedOn[lineId]
          this.linesClosedOn[nextLineId] = linesPreviouslyClosedHere

        } else {
          var nextLineId = this.ensureSomethingAt(lineNumber + 1, lineId)
        }

        ensureContains(this.linesClosedOn, nextLineId, lineId)

      } else if (expression.kind == "string literal") {

        this.intros[lineId] = "quote"
        delete this.separators[lineId]
        this.outros[lineId] = "quote"
        this.firstHalves[lineId] = expression.string
        delete this.secondHalves[lineId]
      }
    }

    Editor.prototype.ensureSomethingAt = function(lineNumber, parentId) {
      var lineId = this.lineIds.get(lineNumber)
      if (!lineId) {
        lineId = generateId()
        this.lineIds.set(lineNumber, lineId)
        this.parents[lineId] = parentId
      }
      if (!this.firstHalves[lineId]) {
        this.firstHalves[lineId] = Editor.EMPTY
      }
      return lineId
    }

    Editor.EMPTY = "\u200b"

    function ensureContains(collection, index, value) {
      if (!collection[index]) {
        collection[index] = []
      }

      if (collection[index].indexOf(value) < 0) {
        collection[index].unshift(value)
      }
    }

    Editor.prototype.getFirstHalf = function(lineNumber) {
      var lineId = this.lineIds.get(lineNumber)
      return this.firstHalves[lineId]
    }

    Editor.prototype.getSecondHalf = function(lineNumber) {
      var lineId = this.lineIds.get(lineNumber)
      return this.secondHalves[lineId]
    }

    Editor.prototype.getIntroSymbol = function(lineNumber) {
      var lineId = this.lineIds.get(lineNumber)
      var symbol = this.intros[lineId]

      return symbol
    } 

    Editor.prototype.getSeparator = function(lineNumber) {
      var lineId = this.lineIds.get(lineNumber)
      var symbol = this.separators[lineId]

      return symbol
    } 

    Editor.prototype.getOutroSymbols = function(lineNumber) {
      var lineId = this.lineIds.get(lineNumber)
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