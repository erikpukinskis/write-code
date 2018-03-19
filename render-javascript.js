var library = require("module-library")(require)

library.using(
  ["web-element", "web-site", "browser-bridge", "fs"],
  function(element, WebSite, BrowserBridge, fs) {  

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

      element.style(".layer0", {
        "transform": "translate(0, 0)",
        /*" z-index": "500 */
      }),

      element.style(".layer1", {
        "transform": "translate(30px, 2px)",
        /*" z-index": "400", */
      }),

      element.style(".layer2", {
        "transform": "translate(60px, 4px)",
        /*" z-index": "300", */
      }),

      element.style(".layer3", {
        "transform": "translate(90px, 6px)",
        /*" z-index": "200", */
      }),

      element.style(".layer4", {
        "transform": "translate(120px, 8px)",
        /*" z-index": "100", */
      }),

      element.style(".down-layer, .layer", {
        "position": "relative",
      }),

      element.style(".layer3-down", {
        "top": "5px",
      }),

      element.style(".layer2-down", {
        "top": "10px",
      }),

      element.style(".layer1-down", {
        "top": "15px",
      }),

      element.style(".layer0-down", {
        "top": "20px",
      }),

      element.style(".layer0, .layer0-down", {
        "font-size": "1.2em",
      }),

      element.style(".layer1, .layer1-down", {
        "font-size": "1.15em",
      }),

      element.style(".layer2, .layer2-down", {
        "font-size": "1.1em",
      }),

      element.style(".layer3, .layer3-down", {
        "font-size": "1.05em",
      }),

      element.style(".layer0, .layer0-down", {
        "text-shadow": "-0.2em 0.8em 0.05em rgba(0,0,0,0.02)"
      }),
      element.style(".layer0 .symbol", {
        "text-shadow": "none",
        "box-shadow": "-0.2em 0.8em 0.05em rgba(0,50,100, 0.01)",
      }),

      element.style(".layer1, .layer1-down", {
        "text-shadow": "-0.15em 0.6em 0.04em rgba(0,0,0,0.04)"
      }),
      element.style(".layer1 .symbol", {
        "text-shadow": "none",
        "box-shadow": "-0.15em 0.6em 0.04em rgba(0,50,100, 0.01)",
      }),

      element.style(".layer2, .layer2-down", {
        "text-shadow": "-0.1em 0.4em 0.04em rgba(0,0,0,0.04)"
      }),

      element.style(".layer2 .symbol", {
        "text-shadow": "none",
        "box-shadow": "-0.1em 0.4em 0.04em rgba(0,50,100, 0.01)",
      }),

      element.style(".layer3, .layer3-down", {
        "text-shadow": "-0.05em 0.2em 0.02em rgba(0,0,0,0.04)"
      }),

      element.style(".layer3 .symbol", {
        "text-shadow": "none",
        "box-shadow": "-0.05em 0.2em 0.02em rgba(0,50,255, 0.01)",
      }),

      element.style(".layer0 .text", {
         "color": "rgba(0,0,0,0.8)",
      }),
      element.style(".layer1 .text", { 
        "color": "rgba(0,0,0,0.7)",
      }),
      element.style(".layer2 .text", { 
        "color": "rgba(0,0,0,0.6)",
      }),
      element.style(".layer3 .text", { 
        "color": "rgba(0,0,0,0.5)",
      }),
      element.style(".layer4 .text", { 
        "color": "rgba(0,0,0,0.4)",
      }),

      element.style(".layer0 .text.empty", { 
        "background-color": "rgba(0,0,0,0.24)",
      }),
      element.style(".layer1 .text.empty", { 
        "background-color": "rgba(0,0,0,0.21)",
      }),
      element.style(".layer2 .text.empty", { 
        "background-color": "rgba(0,0,0,0.18)",
      }),

      element.style(".layer3 .text.empty", {
        "background-color": "rgba(0,0,0,0.15)",
      }),

      element.style(".layer4 .text.empty", { 
        "background-color": "rgba(0,0,0,0.12)",
      }),

      element.style(".layer0 .symbol", {
        "color": "rgba(100,110,140, 1)",
      }),
      element.style(".layer1 .symbol", {
        "color": "rgba(100,110,140, 0.9)",
      }),
      element.style(".layer2 .symbol", {
        "color": "rgba(100,110,140, 0.8)",
      }),
      element.style(".layer3 .symbol", {
        "color": "rgba(100,110,140, 0.7)",
      }),
      element.style(".layer4 .symbol", {
        "color": "rgba(100,110,140, 0.6)",
      }),

      element.style(".layer0-down .symbol", {
        "color": "rgba(100,110,140,1) !important",
      }),
      element.style(".layer1-down .symbol", {
        "color": "rgba(100,110,140,0.9) !important",
      }),
      element.style(".layer2-down .symbol", {
        "color": "rgba(100,110,140,0.8) !important",
      }),
      element.style(".layer3-down .symbol", {
        "color": "rgba(100,110,140,0.7) !important",
      }),
      element.style(".layer4-down .symbol", {
        "color": "rgba(100,110,140,0.6) !important",
      }),

      element.style(".layer3.layer3-1", {
        "z-index": "199",
      }),

      element.style(".layer3.layer4-1", { 
        "z-index": "99",
      }),

    ])

    var site = new WebSite()
    site.start(1413)

    var baseBridge = new BrowserBridge()
    baseBridge.addToHead(stylesheet)

    site.addRoute("get", "/", function(request, response) {
      var bridge = baseBridge.forResponse(response)

      var empty = {}

      var logo = element(
        ".layer.layer0",
        element.style({
          "margin-top": "4em",
          "float": "right"}),
        element(
          "span.text-symbol.symbol.logo",
          "ezjs"))

      var body = []

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

          if (!isOneLevelUp) {
            line.addChild(
              symbolEl(closer))
            return
          }

          closerDepth--

          var downLayer = element(
            "span.down-layer.layer"+closerDepth+"-down",
            symbolEl(closer))

          line.addChild(
            downLayer)
        })


        body.push(line)
      }

      addLine(0, null, "module", null, null, ["left-paren"])
      addLine(1, "function", empty, "arguments-open", empty, ["arguments-close", "curly-open"])
      addLine(2, "return", "call", null, null, ["left-paren"])
      addLine(3, "quote-open", "thing", null, null, ["quote-close", "comma"])
      addLine(3, "function", "after", "arguments-open", empty, ["arguments-close", "curly-open"])
      addLine(4, "return", "call2", null, null, ["left-paren"])
      addLine(5, null, empty, null, null, ["right-paren", "curly-close", "right-paren", "curly-close", "right-paren"])

      body.push(logo)

      bridge.send(body)
    })

  }
)
