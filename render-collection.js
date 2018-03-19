var library = require("module-library")(require)

library.using(
  ["web-element", "web-site", "browser-bridge", "fs", "./render-javascript"],
  function(element, WebSite, BrowserBridge, fs, renderJavascript) {  

    var site = new WebSite()
    site.start(1413)

    var baseBridge = new BrowserBridge()
    renderJavascript.prepareBridge(baseBridge)

    site.addRoute("get", "/", function(request, response) {

      var bridge = baseBridge.forResponse(response)

      var empty = renderJavascript.empty

      renderJavascript(bridge, function(addLine) {
        addLine(0, null, "module", null, null, ["left-paren"])
        addLine(1, "function", empty, "arguments-open", empty, ["arguments-close", "curly-open"])
        addLine(2, "return", "call", null, null, ["left-paren"])
        addLine(3, "quote-open", "thing", null, null, ["quote-close", "comma"])
        addLine(3, "function", "after", "arguments-open", empty, ["arguments-close", "curly-open"])
        addLine(4, "return", "call2", null, null, ["left-paren"])
        addLine(5, null, empty, null, null, ["arguments-close", "curly-close", "right-paren", "curly-close", "right-paren"])
      })
    })
  }
)
