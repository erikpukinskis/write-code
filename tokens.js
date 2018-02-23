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

    function setIntroTokens(editable, tokens) {
      // console.log("setting intro tokens to "+JSON.stringify(tokens))
      var childPosition = 0

      tokens.forEach(function(expectedToken) {

        var node = editable.childNodes[childPosition]
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

        childPosition++
      })

      while(node = editable.childNodes[childPosition]) {
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

    function setOutroTokens(editable,tokens) {
      // console.log("setting OUTRO tokens to "+JSON.stringify(tokens))

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
      setIntro: setIntroTokens,
      setOutro: setOutroTokens,
    }
  }
)




