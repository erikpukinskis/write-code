var library = require("module-library")(require)

module.exports = library.export(
  "edit-loop",
  ["./tokens", "add-html", "./editor"],
  function(tokens, addHtml, Editor) {

    function editLoop(editor, event) {

      var lineId = editor.lines.get(editor.line)

      var sourceNode = event.target.querySelector(".line-"+lineId)

      if (sourceNode) {
        var source = sourceNode.innerText
      } else {
        var source = event.target.innerText
        event.target.innerHTML = ""
      }

      syncLine(editor.line, editor, source)

      var synced = editor.line

      if (event.key == "Enter") {
        event.preventDefault()

        editor.pressEnter()

        syncLine(editor.line, editor)

        setSelection(editor.lines.get(editor.line), 0)
      } else {
        var lineId = editor.lines.get(editor.line)
        var text = editor.editables[lineId]
        setSelection(lineId, text.length)
      }
    }

    function syncLine(lineNumber, editor, source) {

      // if (lines.currentWords() == editableText) {
      //   return
      // } else {
      //   lines.setCurrentWords(editableText)
      // }

      editor.text(editor.line, source)

      var lineId = editor.lines.get(lineNumber)

      // console.log("syncing "+lineId+" at "+lineNumber)

      var editable = document.querySelector(".line-"+lineId)

      if (!editable) {
        var html = "<div class=\"line line-"+lineId+"\"></div>";
        var nodes = addHtml.inside(document.querySelector(".lines"), html)
        editable = nodes[0]
      }

      var words = editor.editables[lineId]

      if (words == "sa") {
        debugger
      }

      var introTokens = editor.getIntroSymbols(editor.line).map(Editor.symbolText)
      var outro = editor.getOutroSymbols(editor.line)
      // console.log("outro", outro)
      var outroTokens = outro.map(Editor.symbolText)

      tokens.setIntro(editable, introTokens)
      // setIntro guarantees at least one text node at this point
      tokens.setOutro(editable, outroTokens)

      var textNode = editable.childNodes[introTokens.length]

      textNode.textContent = words
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