var library = require("module-library")(require)

module.exports = library.export(
  "edit-loop",
  ["./tokens"],
  function(tokens) {

    function editLoop(lines, event) {

      if (event.key == "Enter") {
        event.preventDefault()
        var editable = lines.down()
        var text = document.createTextNode("\u200b")
        editable.prepend(text)
        setSelection(text, 0)
        return
      }

      var editable = lines.stay()
      var editableText = editable.innerText

      var introTokens = tokens.inIntroOf(editableText)
  
      var sliceStart = introTokens.length

      var outroTokens = tokens.inOutroOf(editableText)

      var sliceEnd = editableText.length - outroTokens.length

      var sliceLength = sliceEnd - sliceStart

      editableText = editableText.slice(sliceStart, sliceLength)


      if (lines.currentWords() == editableText) {
        return
      } else {
        lines.setCurrentWords(editableText)
      }

      if (editableText.match(/"/)) {
        debugger
      }
      if (editableText.length < 1) {
        return }

      var emptyLine = editableText.length < 1
      var functionLiteral = !emptyLine && editableText.match(/^"?function([\s].*)$/)

      var functionCall = !functionLiteral && editableText.match(/^"?(\w+)[(](.*)$/)

      if (!functionCall && editableText.length > 0) {
        var stringLiteral = editableText }

      var gotFunctionTokenAlready = tokens.isToken(editable.childNodes[0], "function")

      if (functionCall) {
        var functionName = functionCall[1]
        var remainder = functionCall[2]

        tokens.setIntro(editable, "(")
        tokens.setOutro(editable, "(")

        var textNode = editable.childNodes[0]
        textNode.textContent = functionName

        var editable = lines.down()

        firstToken(outroTokens, ")")
        tokens.setOutro.apply(
          tokens,
          [editable].concat(outroTokens))
        var text = document.createTextNode("\u200b")
        editable.prepend(text)
        setSelection(text, 0)

      } else if (functionLiteral) {
        var remainder = trimTrailingQuote(functionLiteral[1])

        tokens.setIntro(editable, "function")

        tokens.setOutro(editable, "(", ")", "{")

        var textNode = editable.childNodes[1]

        if (!gotFunctionTokenAlready) {
          textNode.textContent = textNode.textContent.substr("function".length)

          setSelection(textNode, textNode.textContent.length)
        }

        var editable = lines.down()
        tokens.setOutro("}")
        lines.up()

      } else if (stringLiteral) {
        lines.setAttribute("kind", "string literal")
        lines.setAttribute("string", stringLiteral)
        tokens.setIntro(editable, "\"")

        firstToken(outroTokens, "\"")

        tokens.setOutro.apply(
          tokens,
          [editable].concat(outroTokens))
      }

      // done with onEditorEvent
    }

    function setSelection(node, selectionStart) {
      var range = document.createRange()
      range.setStart(node, selectionStart)

      var selection = window.getSelection()
      selection.removeAllRanges()
      selection.addRange(range)
    }

    function firstToken(tokens, expectedToken) {
      if (tokens[0] != expectedToken) {
        tokens.unshift(expectedToken)
      }
    }

    function trimTrailingQuote(text) {
      var lastChar = text.substr(text.length - 1)
      if (lastChar == "\"") {
        return text.substr(0, text.length - 1)
      } else {
        return text
      }
    }

    return editLoop
  }
)