var library = require("module-library")(require)

module.exports = library.export(
  "render-code",

  // Takes a bunch of text, parses it out
  // fairly simply, and draws elements

  ["web-element"],
  function(element) {

    function renderCode(bridge, lines, editLoop) {
      prepareBridge(bridge)

      var allowObjects = lines[0] == "dogs.do("
      var stack = []


      var lines = lines.map(
        function(line) {

          var spaces = line.match(/^ */)[0]
          var nonbreakingSpaces = "<indent>"+spaces.split("").map(function() { return "&nbsp;"}).join("")+"</indent>"

          line = line.slice(spaces.length)
          var width = spaces.length/1.5+"em"

          var el = element(
            element.tag(
              "line"),
            nonbreakingSpaces,
            lineContents(
              stack,
              allowObjects,
              editLoop, bridge, line))

          if (line.match(/^\s*\/\//)) {
            el.addSelector(".comment")
          }
          if (line.match(/\/\/ ezjs/)) {
            el.addSelector(".logo")
            el.addAttribute("contenteditable", "false")
          }
          return el
        }
      )

      var handleEdits = editLoop.withArgs(
        bridge.event)
        .evalable()

      var program = element(
        ".editable",{
        "contenteditable": "true",
        "onkeyup": handleEdits},
        lines)

      bridge.send(
        element(".editable-container",
          program))
    }

    function lineContents(stack, allowObjects, editLoop, bridge, line) {

      var symbol
      var text
      var sym
      var txt
      var html = ""

      function biteSymbol() {
        var symbolText = grabSymbol(line)
        if (symbolText == "//") {
          debugger
        }
        if (symbolText) {
          line = line.slice(symbolText.length)
          return symbolText
        }
      }

      function biteText() {
        if (grabSymbol(line)) {
          return
        }
        if (line.length > 0) {
          var text = line.match(/^[^"}{)(=]*/)[0]
          line = line.slice(text.length)
          return text
        }
      }

      var lastSym
      while((sym = biteSymbol()) || (txt = biteText())) {
        lastSym = sym || lastSym

        if (sym == "ezjs") {
          html += "<sym contenteditable=\"true\" spellcheck=\"false\" class=\"logo\">ezjs</sym>"
        } else if (sym == "*") {
          html += "<empty contenteditable=\"true\"> </empty>"
        } else if (sym) {
          if (["[", "{"].includes(sym)) {
            stack.push(sym)
          }

          html += "<sym class=\""+literalClass(stack, sym, allowObjects)+"\">"+sym+"</sym>"

          if (["}", "]"].includes(sym)) {
            stack.pop()
          }

        } else if (txt) {
          var isLogo = txt == " ezjs"
          var spelling = isLogo ? " spellcheck=\"false\"" : ""
          html += "<txt"+spelling+">"+txt+"</txt>"
        }
      }

      return html
    }

    function literalClass(stack, sym, allowObjects) {
      if (sym.length > 1) {
        var classes = "text "
      } else {
        var classes = ""
      }

      if (sym == "//") {
        return classes + " comment"
      }

      var top = stack[stack.length-1]
      var b = Math.max(255,stack.length*25);

      if (top == "[") {
        return classes+"array";
      } else if (stack.length == 2 && allowObjects) {
        return classes+"object";
      } else {
        return classes
      }
    }

    function grabSymbol(line) {
      if (line == ",") {
        return ","
      }
      var parts = line.match(/^(function|var|new|ezjs|\/\/)/)
      if (parts) {
        return parts[0]
      }
      var firstCharacter = line[0]
      if (["*", "\"", "{", "}", "(", ")", "[", "]", "=", ":", ".", ","].includes(firstCharacter)) {
        return firstCharacter
      }
    }

    var SYM_PADDING = "8px"
    var LOGO_COLOR = "red"

    var stylesheet = element.stylesheet([
      element.style(".editable-container",{
        "min-width": "16em",
        "max-width": "24em",
        "min-height": "4em",
      }),

      element.style(".editable",{
        "padding": "0.4em 0.4em 0.4em 4.4em",
      }),

      element.style(".editable sym, .editable sym.text, sym.array, .editable txt", {
      }),

      element.style("indent", {
        "display": "inline",
        "letter-spacing": "0.25em",
      }),

      element.style("indent + sym", {
        "margin-left": "-0.3em",
      }),

      element.style("sym", {
        "display": "inline",
        "margin": "0 0.15em",
        "border-left": SYM_PADDING+" solid #f6f6ff",
        "border-right": SYM_PADDING+" solid #f6f6ff",
        "text-align": "center",
        "font-weight": "bold",
        "background-color": "#f6f6ff",
        "color": "#7c7cfa",
        "border-radius": "0.2em",
      }),

      element.style("line.comment",{
        "margin": "1.4em 0 1.5em 0em",
      }),

      element.style("line.comment txt",{
        "color": "#faa",
        "-webkit-font-smoothing": "subpixel-antialiased",
      }),

      element.style("sym.text.comment",{
        "color": "white",
        "background": "#fbb",
        "border-left": SYM_PADDING+" solid #fbb",
        "border-right": SYM_PADDING+" solid #fbb",
        "padding": "0 5px 0 8px",
        "letter-spacing": "3px",
      }),

      element.style("sym.array", {
        "color": "#79caff",
      }),

      element.style("sym.object", {
        "color": "#79caff",
      }), 

      element.style("line.logo sym.text.comment",{
        "margin-top": "2em",
        "background": "#e5eeff",
        "border-color": "#e5eeff",
      }),

      element.style("line.logo txt",{
        "color": "#c6d4ef",
      }),

      element.style("empty", {
        "letter-spacing": "0.9em",
        "font-size": "0.5em",
        "vertical-align": "0.3em",
        "border-radius": "5px",
        "border": "3px solid #ddd",
      }),


      element.style("empty:first-child, sym:first-child", {
        "margin-left": "0",
      }),

      element.style("txt", {
        "color": "#635d5a",
        "-webkit-font-smoothing": "antialiased",
        "display": "inline",
      }),

      element.style("line", {
        "display": "block",
        "flex-direction": "row",

        "margin-bottom": "0.4em",
        "text-indent": "-2.15em",
        "line-height": "1.2em",

        "font-family": "sans-serif",
        "font-size": "1.3em",
      }),

      element.style("body", {
        "padding-left": "6em",
        "padding-top": "8em",
        "padding-bottom": "6em",
      })
    ])

    function prepareBridge(bridge) {
      if (!bridge.remember("write-code")) {
        bridge.addToHead(stylesheet)
        bridge.remember("write-code")
      }
    }

    return renderCode
  }
)
