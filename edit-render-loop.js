var library = require("module-library")(require)

module.exports = library.export(
  "edit-render-loop",
  ["./lines", "./tokens"],
  function(lines, tokens) {

    function editRenderLoop(event) {

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

      if (lines.currentWords() == editableText) {
        return
      } else {
        lines.setCurrentWords(editableText)
      }

      var introMatch = editableText.match(/^[\u200b\(\)\{\}\(\)]+/)
      var noText = introMatch && introMatch[0].length == editableText.length

      if (introMatch && !noText) {
        var introTokens = splitString(introMatch[0])
        var sliceStart = introTokens.length
      } else {
        var introTokens = []
        var sliceStart = 0
      }

      var outroMatch = editableText.match(/[\u200b\(\)\{\}\(\)]+$/)
      if (outroMatch) {
        var outroTokens = splitString(outroMatch[0])
        var sliceEnd = editableText.length - outroTokens.length
      } else {
        var outroTokens = []
        var sliceEnd = editableText.length
      }

      var sliceLength = sliceEnd - sliceStart

      editableText = editableText.slice(sliceStart, sliceLength)

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

        tokens.setIntro()
        tokens.setOutro("(")

        var textNode = editable.childNodes[0]
        textNode.textContent = functionName

        var editable = lines.down()

        firstToken(outroTokens, ")")
        tokens.setOutro.apply(null, outroTokens)
        var text = document.createTextNode("\u200b")
        editable.prepend(text)
        setSelection(text, 0)

      } else if (functionLiteral) {
        var remainder = trimTrailingQuote(functionLiteral[1])

        tokens.setIntro("function")

        tokens.setOutro("(", ")", "{")

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
        console.log("text is", stringLiteral)
        tokens.setIntro("\"")

        firstToken(outroTokens, "\"")
        tokens.setOutro.apply(null, outroTokens)
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

    function splitString(string) {
      var array = []
      for(var i=0; i<string.length; i++) {
        array.push(string[i])
      }
      return array
    }

    return editRenderLoop
  }
)