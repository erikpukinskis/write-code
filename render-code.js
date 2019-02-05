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

          var spaces = line.match(/^ */)[0].length
          line = line.slice(spaces)
          var width = spaces/1.5+"em"

          var el = element(
            element.tag(
              "line"),
            element.style({
              "padding-left": width}),
            lineContents(
              stack,
              allowObjects,
              editLoop, bridge, line))

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

      bridge.send(program)
    }

    function lineContents(stack, allowObjects, editLoop, bridge, line) {

      var symbol
      var text
      var sym
      var txt
      var html = ""

      function biteSymbol() {
        var symbolText = grabSymbol(line)
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

      while((sym = biteSymbol()) || (txt = biteText())) {
        if (sym == "ezjs") {
          html += "<sym class=\"logo\">ezjs</sym>"
        } else if (sym == "*") {
          html += "<empty></empty>"
        } else if (sym) {
          if (["[", "{"].includes(sym)) {
            stack.push(sym)
          }

          html += "<sym class=\""+literalClass(stack, sym, allowObjects)+"\">"+sym+"</sym>"

          if (["}", "]"].includes(sym)) {
            stack.pop()
          }

        } else if (txt) {
          html += "<txt>"+txt+"</txt>"
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
      var parts = line.match(/^(function|var|new|ezjs)/)
      if (parts) {
        return parts[0]
      }
      var firstCharacter = line[0]
      if (["*", "\"", "{", "}", "(", ")", "[", "]", "=", ":", ".", ","].includes(firstCharacter)) {
        return firstCharacter
      }
    }

    var stylesheet = element.stylesheet([
      element.style("sym", {
        "text-indent": "0",
        "text-align": "center",
        "width": "1em",
        "font-weight": "bold",
        "background-color": "#f6f6ff",
        "color": "#7c7cfa",
        "border-radius": "0.2em",
      }),

      element.style("sym.text, sym.logo", {
        "width": "auto",
        "padding-left": "0.2em",
        "padding-right": "0.2em",
      }),

      element.style("sym.array", {
        "color": "#79caff",
      }),

      element.style("sym.object", {
        "color": "#ff9f00",
      }), 

      element.style("sym.logo", {
        "margin-top": "1em",
        "line-height": "1.2em",
        "font-size": "130%",
      }),

      element.style("sym, empty", {
        "display": "inline-block",
        "margin-left": "0.1em",
        "margin-right": "0.1em",
      }),

      element.style("empty", {
        "width": "0.7em",
        "margin-left": "0.4em",
        "margin-right": "0.4em",
        "height": "0.7em",
        "box-sizing": "border-box",
        "border-radius": "0.22em",
        "border": "0.1em solid #ddd",
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
        "font-family": "sans-serif",
        "line-height": "1.3em",
        "margin-bottom": "0.4em",
        "font-size": "1.4em",
        "display": "block",
        "max-width": "20em",
        "box-sizing": "border-box",
        "text-indent": "-1.4em",
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
