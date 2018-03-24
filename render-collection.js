var library = require("module-library")(require)

library.using(
  ["web-element", "web-site", "browser-bridge", "fs", "./render-javascript", "esprima", "event-stream", "./editor", "an-expression", "a-wild-universe-appeared"],
  function(element, WebSite, BrowserBridge, fs, renderJavascript, esprima, eventStream, Editor, anExpression,aWildUniverseAppeared) {  

    var site = new WebSite()
    site.start(1413)

    var baseBridge = new BrowserBridge()
    renderJavascript.prepareBridge(baseBridge)

    baseBridge.addToHead(
      element.stylesheet([
        element.style(".columns", {
          "display": "flex",
        }),
        element.style(".column", {
          "width": "20em",
          "flex-shrink": "0",
        }),
      ])
    )

    var tree = anExpression.tree()

    var universe = aWildUniverseAppeared("lines", {anExpression: "an-expression"})

    tree.logTo(universe, true)

    var editor = new Editor(tree)

    var stream = fs.createReadStream('render-javascript.js')
        .pipe(eventStream.split())
        .pipe(eventStream.mapSync(addLine.bind(null, stream))
        .on('error', function(err){
            console.log('Error while reading file.', err);
        })
        .on('end', function(){
            console.log('Read entire file.')
        })
    )

    var lineNumber = 0
    var LIBRARY_DEFINITION = "var library = require(\"module-library\")(module)"

    function addLine(strea, text) {
      stream.pause()

      var isLibrary = text == LIBRARY_DEFINITION

      var hasText = text.match(/[a-zA-Z]/)

      if (hasText && !isLibrary) {
        lineNumber = editor.text(lineNumber, text)
        lineNumber += 1
      }

      if (lineNumber == 2) {
        return
      }

      stream.resume()
    }      

    var empty = renderJavascript.empty

    var logo = element(
      ".layer.layer0",
      element.style({
        "margin-top": "4em",
        "float": "right"}),
      element(
        "span.text-symbol.symbol.logo",
        "ezjs"))

    site.addRoute("get", "/", function(request, response) {

      var bridge = baseBridge.forResponse(response)

      var demo = bridge.partial()

      renderJavascript(demo, function(addLine) {
        addLine(0, null, "module", null, null, ["left-paren"])
        addLine(1, "function", empty, "arguments-open", empty, ["arguments-close", "curly-open"])
        addLine(2, "return", "call", null, null, ["left-paren"])
        addLine(3, "quote-open", "thing", null, null, ["quote-close", "comma"])
        addLine(3, "function", "after", "arguments-open", empty, ["arguments-close", "curly-open"])
        addLine(4, "return", "call2", null, null, ["left-paren"])
        addLine(5, null, empty, null, null, ["arguments-close", "curly-close", "right-paren", "curly-close", "right-paren"])
      })

      var demo2 = bridge.partial()

      renderJavascript(demo2, function(addLine) {
        addLine(0, null, "module", null, null, ["left-paren"])
        addLine(1, "function", empty, "arguments-open", empty, ["arguments-close", "curly-open"])
        addLine(2, "return", "call", null, null, ["left-paren"])
        addLine(3, "quote-open", "thing", null, null, ["quote-close", "comma"])
        addLine(3, "function", "after", "arguments-open", empty, ["arguments-close", "curly-open"])
        addLine(4, "return", "call2", null, null, ["left-paren"])
        addLine(5, null, empty, null, null, ["arguments-close", "curly-close", "right-paren", "curly-close", "right-paren"])
      })

      bridge.send(
        element(
          ".columns",[
          element(".column", demo, logo),
          element(".column", demo2)
        ])
      )
    })
  }
)
