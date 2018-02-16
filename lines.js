var library = require("module-library")(require)

module.exports = library.export(
  "lines",
  ["add-html", "an-expression", "a-wild-universe-appeared", "make-request"],
  function(addHtml, anExpression, aWildUniverseAppeared, makeRequest) {

    // Not sure what lines is, except

    // it wraps tree pretty well

    // we use it in every other submodule (tokens, edit-render-loop) but not in write-code

    // we're confining the universe in here

    function Lines() {
      this.identifier = null
      this.currentLine = 0
      this.ids = []
      this.words = []
      this.tree = anExpression.tree()

      var universe = aWildUniverseAppeared(
        "expression-trees", {
        anExpression: "an-expression"})

      universe.mute()

      this.tree.logTo(universe)

      this.tree.addExpressionAt(
        this.tree.reservePosition(),
        anExpression.functionLiteral())

      universe.onStatement(this.save.bind(this))
    }

    Lines.prototype.setIdentifier = function(identifier) {
      this.identifier = identifier
    }

    Lines.prototype.save = function(functionName, args) {

      var data = {
        functionName: functionName,
        args: args,
      }

      var path = "/universes/write-code/"+this.identifier

      makeRequest({
        method: "post",
        path: path,
        data: data })
    }

    Lines.prototype.setAttribute =function(key, value) {

      var id = this.ids[this.currentLine]
      if (!id) {
        if (key != "kind") {
          throw new Error("You need to set the kind of the current line before you set any other attributes")
        }
        var newExpression = {
          id: anExpression.id(),
          kind: value,
        }
        this.tree.addLine(
          this.tree.rootId(),
          this.tree.reservePosition(),
          newExpression)
        this.ids[this.currentLine] = newExpression.id
      } else {
        var existing = this.tree.getAttribute(key, id)
        if (value != existing) {
          this.tree.setAttribute(key, id, value)
        }
      }
    }

    Lines.prototype.currentWords = function() {
      return this.words[this.currentLine]
    }

    Lines.prototype.setCurrentWords = function(words) {
      this.words[this.currentLine] = words
    }

    Lines.prototype.up = function() {
      this.currentLine--
      return this.stay()
    }

    Lines.prototype.down = function() {
      this.currentLine++
      return this.stay()
    }

    Lines.prototype.stay = function() {
      var el = document.querySelector(".line-"+this.currentLine)

      if (!el) {
        var html = "<div class=\"line line-"+this.currentLine+"\" contenteditable></div>";
        var els = addHtml.inside(document.querySelector(".editor"), html)
        el = els[0]
      }

      return el
    }

    return new Lines()
  }
)
