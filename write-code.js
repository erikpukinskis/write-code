var library = require("module-library")(require)

// Todo:   capture enter keypress and start new string literal

module.exports = library.export(
  "write-code",
  [library.ref(), "browser-bridge", "web-element", "add-html", "bridge-module"],
  function(lib, BrowserBridge, element, addHtml, bridgeModule) {

    function prepareBridge(bridge) {

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
                var els = addHtml.inside(document.querySelector(".editor"), html)
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

        })

      var setSelection = bridge.defineFunction(
        function setSelection(node, selectionStart) {
          var range = document.createRange()
          range.setStart(node, selectionStart)

          var selection = window.getSelection()
          selection.removeAllRanges()
          selection.addRange(range)
        }
      )      

      var moveAround = bridge.defineFunction(
        [lines, setSelection],
        function moveAround(lines, setSelection, event) {
          if (event.key == "Enter") {
            event.preventDefault()
            var editable = lines.down()
            var text = document.createTextNode("\u200b")
            editable.prepend(text)
            setSelection(text, 0)
          }
        }
      )

      var parse = bridge.defineFunction(
        [isToken, setIntroTokens, setOutroTokens, lines, setSelection],
        function parse(isToken, setIntroTokens, setOutroTokens, lines, setSelection, event) {

          if (event.key == "Enter") {
            return
          }

          var editable = lines.stay()
          var editableText = editable.innerText

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

          var gotFunctionTokenAlready = isToken(editable.childNodes[0], "function")

          if (functionCall) {
            var functionName = functionCall[1]
            var remainder = functionCall[2]

            setIntroTokens()
            setOutroTokens("(")

            var textNode = editable.childNodes[0]
            textNode.textContent = functionName

            var editable = lines.down()

            firstToken(outroTokens, ")")
            setOutroTokens.apply(null, outroTokens)
            var text = document.createTextNode("\u200b")
            editable.prepend(text)
            setSelection(text, 0)

          } else if (functionLiteral) {
            var remainder = trimTrailingQuote(functionLiteral[1])

            setIntroTokens("function")

            setOutroTokens("(", ")", "{")

            var textNode = editable.childNodes[1]

            if (!gotFunctionTokenAlready) {
              textNode.textContent = textNode.textContent.substr("function".length)

              setSelection(textNode, textNode.textContent.length)
            }

            var editable = lines.down()
            setOutroTokens("}")
            lines.up()

          } else if (stringLiteral) {
            console.log("text is", stringLiteral)
            setIntroTokens("\"")

            firstToken(outroTokens, "\"")
            setOutroTokens.apply(null, outroTokens)
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

        })


      var line = element.template (
        ".line",
        element.style ( {
          "margin-top": "0.5em",
          "margin-left": "1em",
          "font-size": "30px",
          "min-height": "1em" } ) ,
        function(id) {
          this.addSelector (
            ".line-"+id ) } )

      var focus = element.style(
        ".editor:focus", {
        "outline": "none"})

      var token = element.style(
        ".token", {
          "background": "#EEF",
          "font-family": "Arial, sans-serif",
          "font-weight": "bold",
          "color": "#abd",
          "margin-left": "0.25em",
          "margin-right": "0.25em",
          "display": "inline-block",

          ".open": {
            "margin-right": "0"
          },

          ".close": {
            "margin-left": "0"
          },

          ":first-child": {
            "margin-left": "0",
          },
        })

      bridge.domReady(
        function() {
          document.querySelector(".editor").focus()
        })

      var body = element.style(
        "body",{
        "font-family": "Georgia, serif",
        "max-width": "30em",
        "margin": "0 auto",
        "background": "url(lightpaperfibers.png)",
        "opacity": "0.8"})

      bridge.addToHead(
        element.stylesheet(
          body,
          line,
          token,
          focus))
    }


    var editor = element(
      ".editor" , {
      "contenteditable": "true",
      "onkeydown": moveAround.withArgs(bridge.event).evalable(),
      "onkeyup": parse.withArgs(bridge.event).evalable() },
      line(0) )

    function prepareSite(site) {
      site.addRoute(
        "get",
        "/lightpaperfibers.png",
        // Thanks Atle Mo of http://atle.co
        site.sendFile(__dirname, "lightpaperfibers.png"))}
    }

    function writeCode(bridge) {
      var page = [
        element("h1", "ezjs"),
        editor,
        ]

      brige.send(page)
    }

    writeCode.prepareBridge = prepareBridge

    writeCode.prepareSite = prepareSite
    
    return writeCode
  }
)

