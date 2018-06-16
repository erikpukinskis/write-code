var library = require("module-library")(require)

module.exports = library.export(
  "edit-loop",
  ["./tokens", "add-html", "./editor"],
  function(tokens, addHtml, Editor) {

    var currentLine = 0

    function editLoop(editor, event) {

      console.log("edit loop")

      if (event.key == "Enter") {

        editor.pressEnter(currentLine)
        syncLine(currentLine, editor)

        currentLine++

        var lineId = editor.lineIds.get(currentLine)
        syncLine(currentLine, editor)
        setSelection(lineId, 0)
        return
      }

      var lineId = editor.lineIds.get(currentLine)

      var sourceNode = event.target.querySelector(".line-"+lineId)

      var range = window.getSelection().getRangeAt(0)
      var cursorPosition = range.startOffset
      var node = range.commonAncestorContainer
      var selectionIndex = Array.prototype.indexOf.call(node.parentNode.childNodes, node)
      
      if (sourceNode) {
        var source = sourceNode.innerText
      } else {
        var source = event.target.innerText
        event.target.innerHTML = ""
      }

      if (source == "\"\"") {
        editor.text(currentLine, "")
      } else {
        editor.text(currentLine, source)
      }

      var sync = syncLine(currentLine, editor)

      if (event.key == "(" && editor.role(currentLine) == "function literal opener") {

        var lineId = editor.lineIds.get(currentLine)

        setSelection(lineId, null, 0)
        return
      }

      var nextLineId = editor.lineIds.get(currentLine + 1)

      var lineId = editor.lineIds.get(currentLine)
      var text = editor.getFirstHalf(currentLine)

      cursorPosition -= sync.charsRemoved

      if (selectionIndex > 2) {
        setSelection(lineId, null, cursorPosition)
      } else {
        setSelection(lineId, cursorPosition)
      }

      if (nextLineId) {
        syncLine(currentLine + 1, editor)
      }

      var outro = editor.outros[lineId]
      var onFunctionCall = outro == "left-paren"

      if (event.key == "(") {
        editor.pressEnter(currentLine)

        currentLine++

        var lineId = editor.lineIds.get(currentLine)

        setSelection(lineId, 0)
      }

    }

    function syncLine(lineNumber, editor) {

      var lineId = editor.lineIds.get(lineNumber)

      var editable = document.querySelector(".line-"+lineId)

      if (!editable) {
        var html = "<div class=\"line line-"+lineId+"\"></div>";
        var nodes = addHtml.inside(document.querySelector(".lines"), html)
        editable = nodes[0]
      }

      // This is sort of where I need to be.

      // write-code is feature frozen and needs to be rewritten to use render-code as its view layer...


      // somewhere in here probs


      var introToken = Editor.symbolText(editor.getIntroSymbol(lineNumber))
      var separator = Editor.symbolText(editor.getSeparator(lineNumber))
      var outroTokens = editor.getOutroSymbols(lineNumber).map(Editor.symbolText)

      tokens.setIntro(editable, introToken)

      var out = {}

      // setIntro guarantees at least one text node at this point
      if (introToken) {
        var textNode = editable.childNodes[1]
      } else {
        var textNode = editable.childNodes[0]
      }

      var originalLength = textNode.textContent.length
      var newContent = editor.getFirstHalf(lineNumber)
      textNode.textContent = newContent
      out.charsRemoved = originalLength - newContent.length

      tokens.setSeparator(
        editable,
        separator,
        editor.getSecondHalf(lineNumber))

      // setSeparator guarantees there are only symbols after the intro/first half/separator/second half

      tokens.setOutro(editable, outroTokens)

      return out
    }

    function setSelection(lineId, firstHalfStart, secondHalfStart) {
      var editable = document.querySelector(".line-"+lineId)
      var sawFirstHalf = false
      var selectInFirstHalf = typeof firstHalfStart == "number"

      for(var i=0; i<editable.childNodes.length; i++) {
        var textNode = editable.childNodes[i]
        var isText = textNode.nodeType == Node.TEXT_NODE

        if (isText && selectInFirstHalf) {
          break;
        } else if (isText && !sawFirstHalf) {
          sawFirstHalf = true
          textNode = undefined
        } else if (isText) {
          break;
        } else {
          textNode = undefined
        }
      }

      var range = document.createRange()
      var selectionStart = selectInFirstHalf ? firstHalfStart : secondHalfStart

      if (textNode && textNode.textContent[0] == Editor.EMPTY && selectionStart == 0) {
        selectionStart = 1
      }

      range.setStart(textNode, selectionStart)

      var selection = window.getSelection()
      selection.removeAllRanges()
      selection.addRange(range)
    }

    var debounce
    var event

    return function(editor, newEvent) {
      if (newEvent.key == "Enter") {
        newEvent.preventDefault()
      }
      event = newEvent
      if (debounce) {
        clearTimeout(debounce)
        debounce = null
      }
      debounce = setTimeout(function() {
        editLoop(editor, event)
      })
    }
  }
)