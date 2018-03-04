var library = require("module-library")(require)

module.exports = library.export(
  "tokens",
  ["add-html"],
  function(addHtml) {  

    function isToken(node, token) {
      if (!node || !node.classList) {
        return false }

      if (token && !classFor(token)) {
        return false }

      var hasClassForToken = node.classList.contains(classFor(token))

      if (token && !hasClassForToken) {
        return false }

      return node.classList.contains("token")
    }

    function classFor(token) {
      var className = {
        "function": "function",
        "\"": "quote",
        "{": "left-curly",
        "}": "right-curly",
        "(": "left-paren",
        ")": "right-paren",
        "var": "var",
        "=": "equals",
        ":": "colon",
        "+": "plus",
        "-": "minus",
        "/": "divided-by",
        "*": "times",
      }[token]

      if (!className) {
        return null }

      return className
    }

    function setIntroToken(editable, expectedToken) {

      if (expectedToken) {
        var node = editable.childNodes[0]
        var isExpectedToken = isToken(node, expectedToken)

        if (isExpectedToken) {
          node.innerText = expectedToken
        } else {
          var classes = "token "+classFor(expectedToken)
          if (expectedToken == "\"" || expectedToken == "function") {
            classes += " open"
          }
          var html = "<div class=\""+classes+"\">"+expectedToken+"</div>"
          if (node) {
            addHtml.before(node, html)
          } else {
            addHtml.inside(editable, html)
          }
        }

        var removeTokensFrom = 1
      } else {
        var removeTokensFrom = 0
      }

      while(node = editable.childNodes[removeTokensFrom]) {
        if (isToken(node)) {
          editable.removeChild(node)
        } else {
          break;
        }
      }

      var wentToEnd = !node

      if (wentToEnd) {
        text = document.createTextNode("\u200b")
        editable.appendChild(text)
      }
    }

    function setSeparator(editable, separator, secondHalf) {

      var first = editable.childNodes[0]

      if (isToken(first)) {
        var separatorIndex = 2
      } else {
        var separatorIndex = 1
      }

      if (!separator) {
        deleteNonTokensFrom(editable, separatorIndex)
        return
      }

      var maybeSeparator = editable.childNodes[separatorIndex]

      var maybeSecondHalf = editable.childNodes[separatorIndex + 1]

      var isAlreadySeparated = isToken(maybeSeparator) && isTextNode(maybeSecondHalf)

      var hasClosingTokens = !isAlreadySeparated && isToken(maybeSeparator)

      if (isAlreadySeparated) {
        maybeSeparator.innerText = separator
        maybeSecondHalf.innerText = secondHalf

      } else if (hasClosingTokens) {
        var nextNode = maybeSeparator

        var newSeparatorNode = document.createElement("div")
        newSeparatorNode.classList.add("token")
        newSeparatorNode.innerText = separator

        var newSecondHalfNode = document.createTextNode(secondHalf)

        if (nextNode) {
          editable.insertBefore(newSeparatorNode, nextNode)
          editable.insertBefore(newSecondHalfNode, nextNode)
        } else {
          editable.appendChild(newSeparatorNode)        
          editable.appendChild(newSecondHalfNode)
        }
      }

      deleteNonTokensFrom(editable, separatorIndex + 2)
    }

    function deleteNonTokensFrom(editable, position) {
      while(node = editable.childNodes[position]) {
        if (isToken(node)) {
          position++
        } else {
          editable.removeChild(node)
        }
      }
    }

    function isTextNode(node) {
      if (!node) {
        return false
      }
      return node.nodeType === Node.TEXT_NODE
    }

    function setOutroTokens(editable,tokens) {

      var tokenCount = tokens.length
      var tokenIndex = tokens.length - 1
      var childCount = editable.childNodes.length
      var expectedToken = tokens[tokenIndex]
      var testNodeIndex = childCount - 1

      function nextToken() {
        tokenIndex--
        var token = tokens[tokenIndex]
        if (token == "\u200b") {
          tokenIndex--
          var token = tokens[tokenIndex]
        }
        return token
      }

      if (expectedToken) {

        do {

          var classes = "token "+classFor(expectedToken)
          if (expectedToken == "\"") {
            classes += " close"
          }
          var html = "<quote class=\""+classes+"\">"+expectedToken+"</quote>"

          if (testNodeIndex >= 0) {
            var node = editable.childNodes[testNodeIndex]

            var isExpectedToken = isToken(node, expectedToken)

            if (isExpectedToken) {
              testNodeIndex--
            } else {            
              addHtml.after(node, html)
            }

          } else {
            addHtml.firstIn(editable, html)
          }

          var expectedToken = nextToken()
          var ranOutOfTokens = tokenIndex < 0
        } while(!ranOutOfTokens)
      }

      while(node = editable.childNodes[testNodeIndex]) {
        if (isToken(node)) {
          editable.removeChild(node)
          testNodeIndex--
        } else {
          break;
        }
      }

    }

    return {
      isToken: isToken,
      setIntro: setIntroToken,
      setOutro: setOutroTokens,
      setSeparator: setSeparator,
    }
  }
)




