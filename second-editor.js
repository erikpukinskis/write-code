var library = require("module-library")(require)

library.using(
  ["browser-bridge", "web-site", "web-element", "add-html"],
  function(BrowserBridge, site, element, addHtml) {

    var bridge = new BrowserBridge()

    var isToken = bridge.defineFunction(
      function isToken(node, token) {
        if (!node || !node.classList) {
          return false }

        if (token && !classFor(token)) {
          return false }

        var hasClassForToken = node.classList.contains(classFor(token))

        if (token && !hasClassForToken) {
          return false }

        return node.classList.contains("token") })

    var setIntroTokens = bridge.defineFunction(
      [addHtml.defineOn(bridge), isToken],
      function setIntroTokens(addHtml, isToken, token1, token2, etc) {

        var editable = document.querySelector(".line")

        var childPosition = 0
        for(var i=2; i<arguments.length; i++) {
          var expectedToken = arguments[i]
          var node = editable.childNodes[childPosition]

          var isExpectedToken = isToken(node, expectedToken)

          if (!isExpectedToken) {
            var classes = "token "+classFor(expectedToken)
            if (expectedToken == "\"" || expectedToken == "function") {
              classes += " open"
            }
            addHtml.before(node, "<div class=\""+classes+"\">"+expectedToken+"</div>")
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
      })


    var classFor = bridge.defineFunction(
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

        return className })

    var setOutroTokens = bridge.defineFunction(
      [addHtml.defineOn(bridge), isToken, classFor],
      function setOutroTokens(addHtml, isToken, classFor, token1, token2, etc) {
        var lastDependency = classFor
        var dependencyCount = 3
        var tokenCount = arguments.length - dependencyCount
        var tokenIndex = arguments.length - 1
        var editable = document.querySelector(".line")
        var childCount = editable.childNodes.length
        var expectedToken = arguments[tokenIndex]

        var testNodeIndex = childCount - 1

        do {
          if (testNodeIndex < 0) {
            break
          }

          var node = editable.childNodes[testNodeIndex]

          var isExpectedToken = isToken(node, expectedToken)

          if (isExpectedToken) {
            testNodeIndex--
          } else {
            var classes = "token "+classFor(expectedToken)
            if (expectedToken == "\"") {
              classes += " close"
            }

            addHtml.after(node, "<quote class=\""+classes+"\">"+expectedToken+"</quote>")
          }
          tokenIndex--
          var expectedToken = arguments[tokenIndex]
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

      })


    var parse = bridge.defineFunction(
      [isToken, setIntroTokens, setOutroTokens],
      function parse(isToken, setIntroTokens, setOutroTokens) {
        var editable = document.querySelector(".line")
        var editableText = editable.innerText
        var functionLiteral = editableText.match(/^"?function([\s(].*)$/)
        var stringLiteral = editableText.match(/^"?(.*)"?,?$/)
        var gotFunctionTokenAlready = isToken(editable.childNodes[0], "function")

        if (isToken(editable.childNodes[0], "function")) {
          // debugger
        }

        if (functionLiteral) {
          var remainder = trimTrailingQuote(functionLiteral[1])

          setIntroTokens("function")

          setOutroTokens("(", ")", "{", "}")

          var shouldBeText = editable.childNodes[1]

          if (shouldBeText.constructor.name != "Text") {
            throw new Error("not text?")
          }

          if (!gotFunctionTokenAlready) {
            shouldBeText.textContent = shouldBeText.textContent.substr("function".length)

            setSelection(shouldBeText, shouldBeText.textContent.length)
          }

        } else {
          setIntroTokens("\"")
          setOutroTokens("\"")
        }

        function trimTrailingQuote(text) {
          var lastChar = text.substr(text.length - 1)
          if (lastChar == "\"") {
            return text.substr(0, text.length - 1)
          } else {
            return text
          }
        }

        function setSelection(node, selectionStart) {
          var range = document.createRange()
          range.setStart(node, selectionStart)

          var selection = window.getSelection()
          selection.removeAllRanges()
          selection.addRange(range)
          console.log("add "+selectionStart+" range to "+node.outerHTML)
        }

      })

    var line = element.template(
      ".line", {
      "contenteditable": "true",
      "onkeyup": parse.evalable()},
      element.style({
        "margin-top": "0.5em",
        "padding-bottom": "320px",
        "font-size": "30px",
        "font-family": "sans-serif"}))

    var focus = element.style(
      ".line:focus", {
      "outline": "none"})

    var token = element.style(
      ".token", {
        "background": "#EEF",
        "font-weight": "bold",
        "color": "#abd",
        "margin": "0 0.25em",
        "display": "inline-block",

        ".open": {
          "margin-right": "0"
        },

        ".close": {
          "margin-left": "0"
        },
      })

    bridge.domReady(
      function() {
        document.querySelector(".line").focus()
      })

    site.addRoute(
      "get",
      "/",
      bridge.requestHandler([
        line(),
        element.stylesheet(line, token, focus)]))

    site.start(1413)
  }
)

