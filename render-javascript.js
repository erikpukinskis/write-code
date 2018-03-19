var library = require("module-library")(require)

module.exports = library.export(
  "render-javascript",
  ["web-element", "browser-bridge"],
  function(element, BrowserBridge) {

    var stylesheet = element.stylesheet([
      element.style("body", {
        "font-family": "sans-serif",
        "font-size": "1.4em",
        "line-height": "1.4em",
        "margin-left": "1em",
        "margin-top": "7em",
        "width": "15em",
        "min-height": "1000px",
      }),

      element.style(".symbol", {
        "width": "0.6em",
        "display": "inline-block",
        "text-align": "center",
        "background": "rgb(240,240,255)",
        "font-weight": "bold",
        "margin-left": "0.2em",
        "margin-right": "0.2em",
      }),

      element.style(".logo.symbol", {
        "background": "transparent",
        "border": "2px solid rgba(100,110,140, 0.8)",
        "border-radius": "5px",
      }),
      
      element.style(".symbol.opening-symbol", {
        "margin-right": "0",
      }),

      element.style(".symbol.closing-symbol", {
        "margin-left": "0",
      }),

      element.style(".symbol.text-symbol", {
        "width": "auto",
        "padding-left": "0.2em",
        "padding-right": "0.2em",
      }),

      element.style(".symbols", {
        "white-space": "nowrap",
      }),

      element.style(".text", {
        "text-align": "center",
        "display": "inline-block",
      }),

      element.style(".text.empty", {
        "height": "0.5em",
        "width": "0.5em",
        "margin": "0.3em",
        "border-radius": "0.15em",
        "vertical-align": "middle",
      }),

      element.style(".layer", {
        "margin-bottom": "0.3em",
      }),

      element.style(".up-layer, .layer", {
        "position": "relative",
      }),

    ])

    var levels = [0,1,2,3,4,5]
    var maxDepth = levels.length - 1
    var stylesheets = [stylesheet]

    function levelStyles(generator) {
      var styles = []

      levels.forEach(function(depth) {
        var height = maxDepth - depth
        var out = generator(depth, height)
        if (Array.isArray(out)) {
          styles = styles.concat(out)
        } else {
          styles.push(out)
        }
      })

      stylesheets.push(
        element.stylesheet(styles))
    }

    levelStyles(function(depth) {
      var x = depth * 30
      var y = depth * 2
      return element.style(".layer"+depth, {
        "transform": "translate("+x+"px, "+y+"px)",
      })
    })

    levelStyles(function(depth, height) {
      var top = (height - 1) * 5

      return element.style(".layer"+depth+"-up", {
        "top": top+"px",
      })
    })

    levelStyles(function(depth, height) {
      var fontSize = f(1 + height * 0.05)

      return element.style(".layer"+depth+", .layer"+depth+"-up", {
        "font-size": fontSize+"em",
      })
    })

    function f(x) {
      return x.toFixed(2)
    }

    levelStyles(function(depth, height) {
      var left = f(-0.05 * height)
      var top = f(0.15 * height)
      var fuzz = f(0.01 * height)

      return [
        element.style(".layer"+depth, {
          "text-shadow": left+"em "+top+"em "+fuzz+"em rgba(0,0,0,0.04)"
        }),
        element.style(".layer"+depth+"-up .symbol", {
          "text-shadow": left+"em "+top+"em "+fuzz+"em rgba(0,0,0,0.04)"
        }),        
        element.style(".layer"+depth+" .symbol", {
          "box-shadow": left+"em "+top+"em "+fuzz+"em rgba(0,50,100, 0.01)",
        }),
        element.style(".layer"+depth+" .text-symbol", {
          "text-shadow": "none",
          "box-shadow": left+"em "+top+"em "+fuzz+"em rgba(0,50,100, 0.01)",
        }),
      ]
    })

    levelStyles(function(depth, height) {
      var opacity = f(0.4 + height * 0.1)
      return element.style(".layer"+depth+" .text", {
         "color": "rgba(0,0,0,"+opacity+")",
      })
    })

    levelStyles(function(depth, height) {
      var opacity = f(0.6 + height * 0.1)
      return [
        element.style(".layer"+depth+" .symbol", {
          "color": "rgba(100,110,140, "+opacity+")",
        }),
        element.style(".layer"+depth+"-up .symbol", {
          "color": "rgba(100,110,140, "+opacity+") !important",
        }),
      ]        
    })

    levelStyles(function(depth, height) {
      var opacity = f(0.12 + 0.03 * depth)
      return element.style(".layer"+depth+" .text.empty", { 
        "background-color": "rgba(0,0,0,"+opacity+")",
      })
    })

    function symbolEl(symbol) {
      var symbols = {
        "quote-open": "\"",
        "quote-close": "\"",
        "comma": ",",
        "left-paren": "(",
        "right-paren": ")", 
        "arguments-open": "(",
        "arguments-close": ")", 
        "curly-open": "{",
        "curly-close": "}",
        "left-brace": "[",
        "right-brace": "]",
      }

      var textSymbols = {
        "function": "function",
        "var": "var",
        "return": "return",
      }

      var content = symbols[symbol] || textSymbols[symbol]

      if (!content) {
        throw new Error("no symbol "+symbol)
      }
      var el = element(".symbol", content)

      if (textSymbols[symbol]) {
        el.addSelector(".text-symbol")
      }

      if (symbol == "quote-open") {
        el.addSelector(".opening-symbol")
      }

      if (symbol == "quote-close") {
        el.addSelector(".closing-symbol")
      }

      return el
    }

    function textEl(text) {
      if (text == empty) {
        return element(
          "span.text.empty",
          "&#x200b;")
      } else {
        return element(
          ".text",
          text)
      }
    }

    var logo = element(
      ".layer.layer0",
      element.style({
        "margin-top": "4em",
        "float": "right"}),
      element(
        "span.text-symbol.symbol.logo",
        "ezjs"))

    renderJavascript.prepareBridge = function(bridge) {
      stylesheets.forEach(bridge.addToHead.bind(bridge))
    }

    function renderJavascript(bridge, programBuilder) {

      var body = []

      function addLine(depth, opener, firstHalf, separator, secondHalf, closers) {

        var line = element(
          ".layer.layer"+depth)

        if (opener) {
          line.addChild(
            symbolEl(opener))
        }

        if (firstHalf) {
          line.addChild(
            textEl(firstHalf))
        }

        if (separator) {
          line.addChild(
            symbolEl(separator))
        }

        if (secondHalf) {
          line.addChild(
            textEl(secondHalf))
        }

        if (!closers) {
          closers = []
        }

        var closerDepth = depth;

        closers.forEach(function(closer) {
          var isOneLevelUp = closer == "right-paren" || closer == "curly-close"

          closerDepth--

          if (!isOneLevelUp) {
            line.addChild(
              symbolEl(closer))
            return
          }

          var downLayer = element(
            "span.up-layer.layer"+closerDepth+"-up",
            symbolEl(closer))

          line.addChild(
            downLayer)
        })

        body.push(line)
      }

      programBuilder(addLine)

      body.push(logo)

      bridge.send(body)
    }

    var empty = renderJavascript.empty = {}

    return renderJavascript
  }
)
