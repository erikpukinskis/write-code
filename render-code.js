var library = require("module-library")(require)

module.exports = library.export(
  "render-code",
  ["web-element"],
  function(element) {

    function renderCode(bridge, lines, editLoop) {
      prepareBridge(bridge)

      var allowObjects = lines[0] == "dogs.do("
      var stack = []

      var linesOfHtml = lines.map(lineEl.bind(null, stack, allowObjects, editLoop, bridge))

      bridge.send(linesOfHtml.join("\n"))
    }

    function lineEl(stack, allowObjects, editLoop, bridge, line) {

      var symbol
      var text
      var spaces = line.match(/^ */)[0].length
      var width = spaces/1.5+"em"
      line = line.slice(spaces)
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

      var el = element(
        element.tag("line"),{
        "contenteditable": "true",
        "onkeyup": editLoop.withArgs(bridge.event).evalable()},
        element.style({
          "padding-left": width}),
        html)

      return el.html()
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
        "width": "0.66em",
        "font-weight": "bold",
        "background-color": "#f6f6ff",
        "color": "#99b",
        "border-radius": "0.1em",
      }),

      element.style("sym.text, sym.logo", {
        "width": "auto",
        "padding-left": "0.2em",
        "padding-right": "0.2em",
      }),

      element.style("sym.array", {
        "color": "#9ce",
      }),

      element.style("sym.object", {
        "color": "#b83",
      }), 

      element.style("sym.logo", {
        "margin-top": "1em",
        "line-height": "1.2em",
        "font-size": "130%",
      }),

      element.style("sym, empty", {
        "display": "inline-block",
        "margin-left": "0.2em",
        "margin-right": "0.2em",
      }),

      element.style("empty", {
        "width": "0.66em",
        "height": "0.66em",
        "box-sizing": "border-box",
        "border-radius": "0.22em",
        "border": "0.1em solid #ddd",
      }),


      element.style("empty:first-child, sym:first-child", {
        "margin-left": "0",
      }),

      element.style("txt", {
        "color": "#222",
        "-webkit-font-smoothing": "antialiased",
        "display": "inline",
      }),

      element.style("line", {
        "font-family": "sans-serif",
        "line-height": "1.25em",
        "margin-bottom": "0.4em",
        "font-size": "1.25em",
        "display": "block",
        "max-width": "18em",
        "border-right": "0.1em solid  #fff6f6",
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
