var library = require("module-library")(require)

module.exports = library.export(
  "edit-loop",
  ["./tokens", "add-html", "./editor"],
  function(tokens, addHtml, Editor) {

    var currentLine = 0

    function editLoop(editor, event) {

      if (event.key == "Enter") {

        editor.pressEnter(currentLine)

        syncLine(currentLine, editor)

        currentLine++

        var lineId = editor.lines.get(currentLine)

        syncLine(currentLine, editor)

        setSelection(lineId, 0)
        return
      }

      var lineId = editor.lines.get(currentLine)

      var sourceNode = event.target.querySelector(".line-"+lineId)

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

      syncLine(currentLine, editor)

      var synced = currentLine
      var nextLineId = editor.lines.get(currentLine + 1)

      var lineId = editor.lines.get(currentLine)
      var text = editor.getFirstHalf(currentLine)
      setSelection(lineId, text.length)

      if (nextLineId) {
        syncLine(currentLine + 1, editor)
      }

      var outro = editor.outros[lineId]
      var onFunctionCall = outro == "left-paren"

      if (event.key == "(") {
        editor.pressEnter(currentLine)

        currentLine++

        var lineId = editor.lines.get(currentLine)

        setSelection(lineId, 0)
      }

    }

    function syncLine(lineNumber, editor) {

      var lineId = editor.lines.get(lineNumber)

      var editable = document.querySelector(".line-"+lineId)

      if (!editable) {
        var html = "<div class=\"line line-"+lineId+"\"></div>";
        var nodes = addHtml.inside(document.querySelector(".lines"), html)
        editable = nodes[0]
      }

      var introToken = Editor.symbolText(editor.getIntroSymbol(lineNumber))
      var separator = Editor.symbolText(editor.getSeparator(lineNumber))
      var outroTokens = editor.getOutroSymbols(lineNumber).map(Editor.symbolText)

      tokens.setIntro(editable, introToken)

      // setIntro guarantees at least one text node at this point
      if (introToken) {
        editable.childNodes[1].textContent = editor.getFirstHalf(lineNumber)
      } else {
        editable.childNodes[0].textContent = editor.getFirstHalf(lineNumber)
      }

      tokens.setSeparator(
        editable,
        separator,
        editor.getSecondHalf(lineNumber))

      // setSeparator guarantees there are only symbols after the intro/first half/separator/second half

      tokens.setOutro(editable, outroTokens)
    }

    function setSelection(lineId, selectionStart) {
      var editable = document.querySelector(".line-"+lineId)

      for(var i=0; i<editable.childNodes.length; i++) {
        var textNode = editable.childNodes[i]
        if (textNode.nodeType == Node.TEXT_NODE) {
          break;
        } else {
          textNode = undefined
        }
      }

      var range = document.createRange()
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