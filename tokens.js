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

    var closersByClassName = {}

    function unshiftCloser(editable, token) {
      var id = editable.className
      if (!id) {
        throw new Error("editable has no className")
      }
      if (!closersByClassName[id]) {
        closersByClassName[id] = []
      }
      closersByClassName[id].unshift(token)
    }

    function setIntroTokens(editable, token1, token2, etc) {

      var dependencyCount = 1
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

    function setOutroTokens(editable,token1, token2, etc) {

      var closers = closersByClassName[editable.className] || []

      var provided = Array.prototype.slice.call(arguments, 1)

      var tokens = provided.concat(closers)

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


    function inIntroOf(text) {      
      var introMatch = text.match(/^[\u200b\(\)\{\}\(\)"]+/)
      var noText = introMatch && introMatch[0].length == text.length

      if (introMatch && !noText) {
        return splitString(introMatch[0])
      } else {
        return introTokens = []
      }
    }

    function inOutroOf(text) {
      var outroMatch = text.match(/[{}()\u200b"]+$/)
      if (outroMatch) {
        return splitString(outroMatch[0])
      } else {
        return []
      }
    }

    function splitString(string) {
      var array = []
      for(var i=0; i<string.length; i++) {
        array.push(string[i])
      }
      return array
    }

    return {
      isToken: isToken,
      setIntro: setIntroTokens,
      setOutro: setOutroTokens,
      inIntroOf: inIntroOf,
      inOutroOf: inOutroOf,
      unshiftCloser: unshiftCloser,
    }
  }
)




