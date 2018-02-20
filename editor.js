module.exports = Editor

function Editor() {
  this.currentLine = 0
  this.currentColumn = 0
  this.intros = {}
  this.outros = {}
  this.howToClose = {}
  this.linesClosedOn = {}
  this.editables = {}
}

symbols = {
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

Editor.prototype.text = function(lineNumber, text) {
  var expression = {}

  var regex = /("|function |var )?([. \w]*)((\((\w+,?)*\))|([-+<>=:]\w+)+)*([\[\]}{(),"]*)/

  var parts = text.match(regex)

  if (parts[7]) {
    var outroSymbols = parts[7].split("")
  }
  if (outroSymbols && outroSymbols[0] == symbols["left-paren"]) {
    expression.kind = "function call"
    expression.functionName = parts[2]
  } else if (parts[1] == symbols["quote"]) {
    expression.kind = "string literal"
    expression.string = parts[2]
  } else {
    expression.kind = "string literal"
    expression.string = parts[0]
  }

  console.log("···"+text+"···")
  if (text.match(/\(/)) {
    debugger
  }

  if (expression.kind == "string literal") {
    this.intros[lineNumber] = "quote"
    this.outros[lineNumber] = "quote"
    this.editables[lineNumber] = expression.string
  } else if (expression.kind == "function call") {
    delete this.intros[lineNumber]
    this.outros[lineNumber] = "left-paren"
    this.howToClose[lineNumber] = "right-paren"
    this.editables[lineNumber] = expression.functionName
    ensureContains(this.linesClosedOn, lineNumber+1, lineNumber)
  }
}

Editor.prototype.cursorLine = function() {
  return this.currentLine
}

Editor.prototype.cursorColumn = function() {
  return this.currentColumn
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