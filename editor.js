var library = require("module-library")(require)

module.exports = library.export(
  "editor",
  ["forkable-list", "an-expression", "parse-a-little-js"],
  function(forkableList, anExpression, parseALittleJs) {

    // This probably shouldn't take a tree as an argument. It should expose some hooks, and when we wire up a tree, we should indicate how those hooks affect the tree. In general I don't think Editor should think about whether a tree exists.

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
      this.rootFunctionId = null
      this.parents = {}
      this.expressions = {}

      var editor = this

      if (tree) {
        tree.expressionIds.forEach(
          function(lineId, lineNumber) {
            importTreeExpression(editor, tree, lineId, lineNumber)})
      }
    }

    Editor.prototype.importLines =  function(lines) {
      var lineNumber = this.lineIds.length
      var editor = this
      lines.forEach(function(text) {
        editor.text(lineNumber, text)
        lineNumber++
      })
    }

    function importTreeExpression(editor, tree, lineId, lineNumber) {

      editor.lineIds.set(lineNumber, lineId)

      var kind = tree.getAttribute("kind", lineId)

      if (kind == "string literal") {
        editor.intros[lineId] = "quote"
        editor.firstHalves[lineId] = tree.getAttribute("string", lineId)
        editor.outros[lineId] = ["quote"]

      } else if (kind == "function literal") {
        editor.intros[lineId] = "function"
        editor.firstHalves[lineId] = tree.getAttribute("functionName", lineId) || Editor.EMPTY
        editor.separators[lineId] = "arguments-open"
        var argumentNames
        tree.eachListItem("argumentNames", lineId, function(name) {
          if (argumentNames) {
            argumentNames += ", "+name
          } else {
            argumentNames = name
          }
        })
        editor.secondHalves[lineId] = argumentNames || Editor.EMPTY
        editor.outros[lineId] = ["arguments-close", "curly-open"]

      } else if (kind == "function call") {
        editor.firstHalves[lineId] = tree.getAttribute("functionName", lineId)
        editor.outros[lineId] = ["left-paren"]
      }

      var parentId = tree.getAttribute("parentId", lineId)

      if (!parentId) {
        return
      }

      editor.parents[lineId] = parentId

      var kindOfParent = tree.getAttribute("kind", parentId)

      var isCallArg = kindOfParent == "function call"

      var previousLineId = tree.expressionIds.get(lineNumber - 1)

      if (previousLineId) {

        var parentOfPrevious = tree.getAttribute("parentId", previousLineId)

        var precededBySibling = parentOfPrevious == parentId

        if (precededBySibling && isCallArg) {
          ensureArray(editor.outros, previousLineId)
          editor.outros[previousLineId].push("comma")
        }
      }

      var nextLineId = tree.expressionIds.get(lineNumber+1)

      if (nextLineId) {
        var parentOfNext = tree.getAttribute("parentId", nextLineId)

        var followedBySibling = parentOfNext == parentId
      } else {
        followedBySibling = false
      }

      if (parentId && !followedBySibling) {
        ensureArray(editor.linesClosedOn, lineId)
        editor.linesClosedOn[lineId].push(parentId)
        ensureArray(editor.outros, previousLineId)

        editor.outros[lineId].push(closerForKind(kindOfParent))
      }

      // yay, imported a line
    }

    function ensureArray(object, key) {
      if (!object[key]) {
        object[key] = []
      }
    }

    function keysWithValue(list, value) {
      var matchingKeys = []
      for(var key in list) {
        if (list[key] == value) {
          matchingKeys.push(key)
        }
      }
      return matchingKeys
    }

    Editor.prototype.dump = function(stack, schema, depth) {
      if (!stack) {
        var entrypoint = true
        stack = []
        schema = []
        depth = -1
        var nodeId = this.rootFunctionId
      } else {
        var nodeId = stack.pop()
      }

      schema.push(this.describe(nodeId, depth))

      var childIds = keysWithValue(this.parents, nodeId)
      var dump = this.dump.bind(this)

      childIds.forEach(function(childId) {  
        dump(stack.concat([nodeId, childId]), schema, depth+1)
      })

      if (entrypoint) {
        console.log(schema.join("\n"))
      }
    }

    function pad(number) {
      if (typeof number == "undefined") {
        return "-  "
      }
      var spaces = [" "," "," "]
      var digits = (""+number).split("")
      return spaces.map(function(space, i) {
        return digits[i] || space
      }).join("")
    }

    Editor.prototype.describe = function(lineId, depth) {
      var expression = this.expressions[lineId]
      if (!expression) {
        var text = "@"+lineId+" is empty"
      } else {
        var content = JSON.stringify(expression.functionName || expression.string)
        var text = "@"+lineId+" ["+expression.kind+"] "+content
      }
      var tabs = Array(depth+1).join(" \u00B7 ")
      var index = this.lineIds.find(lineId)
      var number = pad(index)+"|"
      return number+" "+tabs+text
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

    function introName(segments) {
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
        var literal = anExpression.functionLiteral()

        if (this.tree) {
          this.tree.addExpressionAt(
            this.tree.reservePosition(),
            literal)
        }

        this.rootFunctionId = literal.id
        this.expressions[literal.id] = literal
        var emptyId = this.ensureSomethingAt(0, this.rootFunctionId)
        this.parents[emptyId] = this.rootFunctionId
      }

      var lineId = this.lineIds.get(lineNumber)

      expression.id = lineId

      if (!lineId) {
        debugger
        throw new Error("trying to add text at line "+lineNumber+" but there's no line there")
      }

      var staleExpression = this.expressions[lineId]

      if (expression.kind == "empty expression") {
        if (this.expressions[lineId]) {
          throw new Error("trying to notice an empty expression where there already is something")
        } else {
          // do nothing
        }

      } else if (staleExpression == null) {
        var parentId = this.parents[lineId] || this.rootFunctionId

        this.tree && this.tree.addToParent(parentId, expression)
        this.expressions[lineId] = expression

      } else if (expression.kind != staleExpression.kind) {
        this.tree && this.tree.insertExpression(expression, "inPlaceOf", staleExpression.id)
        this.expressions[lineId] = expression

      } else {
        var keys = ["string"]

        for(var i=0; i<keys.length; i++) {
          var key = keys[i]

          if (staleExpression[key] != expression[key]) {
            this.tree && this.tree.setAttribute(key, staleExpression.id, expression[key])}
            staleExpression[key] = expression[key]
        }
      }

      doubleCheckIds(this, this.tree)
    }

    function doubleCheckIds(editor, tree) {
      if (!tree) { return }
      for(var index=0; index<editor.expressions.length; index++) {

        var idFromEditor = editor.expressions.get(index).id

        // The tree is indexed off by one, because it has the root expression in it, whereas editor could be indexed from any point in the tree. Right now it just contains a function literal wrapper tho, so its expressions will be at index + 1

        var idFromTree = tree.expressionIds.get(index + 1)

        if (idFromTree != idFromEditor) {
          throw new Error("The editor has expression "+idFromEditor+" at line "+index+" but the tree has "+idFromTree+" at the associated index ("+(index + 1)+")")
        }
      }
    }

    function expectNotEqual(one, other, message) {
      if (one === other) {
        throw new Error(message)
      }
    }

    Editor.prototype.text = function(lineNumber, text) {
      expectNotEqual(typeof text, "undefined", "editor.text takes a line number and a string")

      var segments = parseALittleJs(text)

      var expression = parseALittleJs.detectExpression(segments)

      var remainder = expression.remainder
      delete expression.remainder

      if (expression.kind == "leaf expression") {
        // this is where we would look up in the tree if we've seen that identifier before
        expression.kind = "string literal"
      }

      this.noticeExpressionAt(lineNumber, expression)

      this.syncExpressionToLine(lineNumber, expression)

      var lineId = this.lineIds.get(lineNumber)
      var remainder = this.handleClosers(
        remainder, lineId)

      if (remainder) {
        lineNumber++
        return this.text(lineNumber, remainder)
      } else {
        return lineNumber
      }
    }

    Editor.prototype.handleClosers = function(remainder, lineId) {
      if (!remainder) {
        return }
      var handledCount = 0
      var alreadyClosed = this.linesClosedOn[lineId]
      var confirmedCount = 0

      for(var i=0; i<remainder.length; i++) {
        var closer = remainder[i]
        var nextCloser = null
        if (alreadyClosed) {
          var nextClosedLineId = alreadyClosed[confirmedCount]
          if (nextClosedLineId) {
            var nextCloser = symbolText[this.
            howToClose[nextClosedLineId]]
          }
        }
        if (closer == "\"") {
          handledCount++
          continue
        } else if (closer == nextCloser) {
          confirmedCount++
        } else if (closer == "]") {
          throw new Error("find the array and close it.")
        } else if (closer == "}") {
          throw new Error("find the function and close it.")
        } else if (closer == ")") {
          debugger
          throw new Error("find the call and close it.")
        } else {
          return remainder.slice(handledCount)
        }
      }
    }

    Editor.prototype.syncExpressionToLine = function(lineNumber, expression) {

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

        this.howToClose[lineId] = closerForKind(expression.kind)

        ensureContains(this.linesClosedOn, nextLineId, lineId)

      } else if (expression.kind == "function call") {

        this.firstHalves[lineId] = expression.functionName
        delete this.secondHalves[lineId]

        delete this.intros[lineId]
        delete this.separators[lineId]

        this.outros[lineId] = "left-paren"
        this.howToClose[lineId] = closerForKind(expression.kind)

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

    function closerForKind(kind) {
      return {
        "function literal": "curly-close",
        "function call": "right-paren"
      }[kind]}

    Editor.prototype.depthOf = function(lineId) {
      var depth = 0
      while(lineId = this.parents[lineId]) {
        depth++
      }
      return depth
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