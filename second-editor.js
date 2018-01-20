var library = require("module-library")(require)

// Todo:   capture enter keypress and start new string literal

library.using(
  [library.ref(), "browser-bridge", "web-site", "web-element", "add-html", "bridge-module"],
  function(lib, BrowserBridge, site, element, addHtml, bridgeModule) {

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

    var lines = bridge.defineSingleton(
      "lines",
      [bridgeModule(lib, "add-html", bridge)],
      function(addHtml) {
        var currentLine = 0

        return {
          up: function() {
            currentLine--
            return this.stay()
          },
          down: function() {
            currentLine++
            return this.stay()
          },
          stay: function() {
            var el = document.querySelector(".line-"+currentLine)

            if (!el) {
              var html = "<div class=\"line line-"+currentLine+"\" contenteditable></div>";
              var els = addHtml(html)
              el = els[0]
            }

            return el
          },
        }
      }
    )

    var setIntroTokens = bridge.defineFunction(
      [addHtml.defineOn(bridge), isToken, lines],
      function setIntroTokens(addHtml, isToken, lines, token1, token2, etc) {

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
      [addHtml.defineOn(bridge), isToken, classFor, lines],
      function setOutroTokens(addHtml, isToken, classFor, lines, token1, token2, etc) {
        var dependencyCount = 4
        var lastDependency = arguments[dependencyCount - 1]
        var tokenCount = arguments.length - dependencyCount
        var tokenIndex = arguments.length - 1
        var editable = lines.stay()
        var childCount = editable.childNodes.length
        var expectedToken = arguments[tokenIndex]

        var testNodeIndex = childCount - 1

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
            addHtml.inside(editable, html)
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

    var moveAround = bridge.defineFunction(
      [lines],
      function moveAround(lines, event) {
        if (event.key == "Enter") {
          console.log("down")
          var editable = lines.down()
          editable.focus()
          event.preventDefault()
        }
      }
    )

    var parse = bridge.defineFunction(
      [isToken, setIntroTokens, setOutroTokens, lines],
      function parse(isToken, setIntroTokens, setOutroTokens, lines, event) {

        if (event.key == "Enter") {
          return
        }

        var editable = lines.stay()
        var editableText = editable.innerText
        if (editableText.length < 1) {
          return }
        var functionLiteral = editableText.match(/^"?function([\s(].*)$/)
        var stringLiteral = editableText.match(/^"?(.*)"?,?$/)
        var gotFunctionTokenAlready = isToken(editable.childNodes[0], "function")

        if (isToken(editable.childNodes[0], "function")) {
        }

        if (functionLiteral) {
          var remainder = trimTrailingQuote(functionLiteral[1])

          setIntroTokens("function")

          setOutroTokens("(", ")", "{")

          var shouldBeText = editable.childNodes[1]

          if (shouldBeText.constructor.name != "Text") {
            throw new Error("not text?")
          }

          if (!gotFunctionTokenAlready) {
            shouldBeText.textContent = shouldBeText.textContent.substr("function".length)

            setSelection(shouldBeText, shouldBeText.textContent.length)
          }

          var editable = lines.down()
          setOutroTokens("}")
          lines.up()

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
      "onkeydown": moveAround.withArgs(bridge.event).evalable(),
      "onkeyup": parse.withArgs(bridge.event).evalable()},
      element.style({
        "margin-top": "0.5em",
        "font-size": "30px",
        "font-family": "sans-serif"}),
      function(id) {
        this.addSelector(".line-"+id);
      })

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
        line(0),
        element.stylesheet(line, token, focus)]))

    site.start(1413)
  }
)

