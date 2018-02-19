var library = require("module-library")(require)

module.exports = library.export(
  "edit-loop",
  ["./tokens"],
  function(tokens) {

    function editLoop(lines, event) {

      if (event.key == "Enter") {
        debugger
        event.preventDefault()
        var editable = lines.down()
        var text = document.createTextNode("\u200b")
        editable.prepend(text)
        setSelection(text, 0)
        return
      }

      var editable = lines.stay(event)
      var text = editable.innerText

      console.log("**>"+text+"<**")
      var introTokens = tokens.inIntroOf(text)
      var sliceStart = introTokens.length
      if (text.match(/b/)) {
        debugger
      }
      var outroTokens = tokens.inOutroOf(text)
      var sliceLength = text.length -outroTokens.length

      var editableText = text.slice(sliceStart, sliceLength)

      // console.log(introTokens.length, "intro tokens,", outroTokens.length, "outro tokens")

      // if (lines.currentWords() == editableText) {
      //   return
      // } else {
      //   lines.setCurrentWords(editableText)
      // }

      if (editableText.length < 1) {
        return }

      var emptyLine = editableText.length < 1

      var functionLiteral = !emptyLine && editableText.match(/^"?function([\s].*)$/)

      var functionCall = !functionLiteral && outroTokens[0] == "("

      if (!functionCall && editableText.length > 0) {
        var stringLiteral = editableText }

      var gotFunctionTokenAlready = tokens.isToken(editable.childNodes[0], "function")

      if (functionCall) {
        // console.log("FUNCTION CALL")
        var functionName = editableText

        tokens.setIntro(editable)
        tokens.setOutro(editable, "(")

        var textNode = editable.childNodes[0]
        textNode.textContent = functionName

        var editable = lines.down()

        tokens.unshiftCloser(editable, ")")
        tokens.setOutro(editable)

        var text = document.createTextNode("\u200b")
        editable.prepend(text)
        setSelection(text, 0)

      } else if (functionLiteral) {
        // console.log("FUNCTION LITERAL")

        tokens.setIntro(editable, "function")

        tokens.setOutro(editable, "(", ")", "{")

        var textNode = editable.childNodes[1]

        if (!gotFunctionTokenAlready) {
          textNode.textContent = textNode.textContent.substr("function".length)

          setSelection(textNode, textNode.textContent.length)
        }

        var editable = lines.down()
        tokens.unshiftCloser(editable, "}")
        tokens.setOutro(editable)
        lines.up()

      } else if (stringLiteral) {
        // console.log("STRING LITERAL")
        lines.setAttribute("kind", "string literal")
        lines.setAttribute("string", stringLiteral)
        tokens.setIntro(editable, "\"")
        tokens.setOutro(editable, "\"")
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

    var debounce
    var event

    return function(lines, newEvent) {
      if (newEvent.key == "Enter") {
        newEvent.preventDefault()
      }
      event = newEvent
      if (debounce) {
        clearTimeout(debounce)
        debounce = null
      }
      debounce = setTimeout(function() {
        editLoop(lines, event)
      })
    }
  }
)