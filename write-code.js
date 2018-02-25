var library = require("module-library")(require)

// Todo:   capture enter keypress and start new string literal

module.exports = library.export(
  "write-code",
  [library.ref(), "browser-bridge", "web-element", "bridge-module", "./edit-loop", "./editor", "a-wild-universe-appeared"],
  function(lib, BrowserBridge, element, bridgeModule, editLoopXXXX, LinesXXXX, aWildUniverseAppeared) {

    function prepareBridge(bridge) {

      if (bridge.remember("write-code")) {
        return }

      bridge.see("write-code", true)

      var focus = element.style(
        ".lines:focus", {
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
          "width": "0.6em",
          "text-align": "center",

          ".function": {
            "width": "auto",
          },

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
          document.querySelector(".lines").focus()
        })

      var body = element.style(
        "body",{
        "font-family": "sans-serif", //"Georgia, serif",
        "max-width": "30em",
        "margin": "0 auto",
        // "background": "url(/lightpaperfibers.png)",
        "opacity": "0.8"})

      bridge.addToHead(
        element.stylesheet(
          body,
          line,
          lines,
          token,
          focus))
    }


    var line = element.template(
      ".line",
      element.style({
        "margin-top": "0.5em",
        "min-height": "1em" }))

    var lines = element.template(
      ".lines" , {
      "contenteditable": "true"},
      element.style({
        "margin-left": "1em",
        "font-size": "30px"}),
      function(bridge, editLoop) {
        this.addAttributes({
          "onkeydown": editLoop.evalable()})
     })

    function prepareSite(site) {
      site.addRoute(
        "get",
        "/lightpaperfibers.png",
        // Thanks Atle Mo of http://atle.co
        site.sendFile(__dirname, "lightpaperfibers.png"))
    }

    function writeCode(bridge, treeBinding) {

      prepareBridge(bridge)

      var editor = bridge.defineSingleton(
        "editor",[
        bridgeModule(lib, "./editor", bridge),
        treeBinding],
        function(Editor, tree) {
          return new Editor(tree)
        }
      )

      var editLoop = bridgeModule(lib, "./edit-loop", bridge)

      var page = [
        element("h1", "ezjs"),
        lines(bridge, editLoop.withArgs(editor, bridge.event)),
      ]

      bridge.send(page)
    }

    writeCode.prepareBridge = prepareBridge

    writeCode.prepareSite = prepareSite

    return writeCode
  }
)

