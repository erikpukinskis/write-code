module.exports = Editor

function Editor() {
  this.currentLine = 0
  this.intros = {}
  this.outros = {}
  this.closing = {}
}

var QUOTE = "\""

Editor.prototype.text = function(lineNumber, text) {
  var expression = lineToExpression(text)

  debugger
  if (expression.kind == "string literal") {
    this.intros[lineNumber] = "quote"
    this.outros[lineNumber] = "quote"
  }
}

function lineToExpression(text) {
  return {
    kind: "string literal"
  }
}

Editor.prototype.pressEnter = function() {
} 

Editor.prototype.getIntroSymbols = function(lineNumber) {
  debugger
  var symbol = this.intros[lineNumber]
  if (symbol) {
    return [symbol]
  } else {
    return []
  }
} 

Editor.prototype.getOutroSymbols = function(lineNumber) {
  var outro = this.outros[lineNumber]
  var closing = this.closing[lineNumber]
  var symbols = []
  if (outro) {
    symbols.push(outro)
  }
  if (closing) {
    symbols = symbols.concat(closing)
  }
  return symbols
} 