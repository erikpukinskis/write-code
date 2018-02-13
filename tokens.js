var library = require("module-library")(require)

module.exports = library.export(
  "tokens",
  ["add-html", "lines"],
  function(addHtml, lines) {  

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

    function setIntroTokens(token1, token2, etc) {

      var editable = lines.stay()
      var dependencyCount = 3
      var childPosition = 0
      for(var i=dependencyCount; i<arguments.length; i++) {
        var expectedToken = arguments[i]
        var node = editable.childNodes[childPosition]

        var isExpectedToken = isToken(node, expectedToken)

        if (!isExpectedToken) {
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
      }

      while(node = editable.childNodes[childPosition]) {
        if (isToken(node)) {
          editable.removeChild(node)
        } else {
          break;
        }
      }
    }

    function setOutroTokens(token1, token2, etc) {
      var args = arguments
      var dependencyCount = 4
      var lastDependency = arguments[dependencyCount - 1]
      var tokenCount = arguments.length - dependencyCount
      var tokenIndex = arguments.length - 1
      var editable = lines.stay()
      var childCount = editable.childNodes.length
      var expectedToken = arguments[tokenIndex]

      var testNodeIndex = childCount - 1

      function nextToken() {
        tokenIndex--
        var token = args[tokenIndex]
        if (token == "\u200b") {
          tokenIndex--
          var token = args[tokenIndex]
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
        var ranOutOfTokens = expectedToken == lastDependency
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




