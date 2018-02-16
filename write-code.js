var library = require("module-library")(require)

// Todo:   capture enter keypress and start new string literal

module.exports = library.export(
  "write-code",
  [library.ref(), "browser-bridge", "web-element", "add-html", "bridge-module", "./edit-render-loop", "a-wild-universe-appeared"],
  function(lib, BrowserBridge, element, addHtml, bridgeModule, editRenderLoop, aWildUniverseAppeared) {

    function prepareBridge(bridge) {

      if (bridge.remember("write-code/editRenderLoop")) {
        return }

      bridge.see(
        "write-code/edit-render-loop",
        bridgeModule(lib, "./edit-render-loop", bridge))

      bridge.see(
        "write-code/lines",
        bridgeModule(lib, "./lines", bridge))

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
        "background": "url(/lightpaperfibers.png)",
        "opacity": "0.8"})

      bridge.addToHead(
        element.stylesheet(
          body,
          line,
          token,
          focus))
    }


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

    var editor = element.template(
      ".editor" , {
      "contenteditable": "true"},
      line(0),
      function(bridge, name) {

        bridge.asap(
          [bridge.remember("write-code/lines"), name],
          function(lines, name) {
            lines.setIdentifier(name)
          }
        )

        var render = bridge.remember("write-code/edit-render-loop").withArgs(bridge.event).evalable()

        this.addAttributes({
          "onkeydown": render,
          "onkeyup": render})
     })

    function prepareSite(site) {
      var programs = aWildUniverseAppeared(
        "programs", {
        anExpression: "an-expression"})

      site.addRoute(
        "get",
        "/lightpaperfibers.png",
        // Thanks Atle Mo of http://atle.co
        site.sendFile(__dirname, "lightpaperfibers.png"))

      site.addRoute(
        "post",
        "/universes/write-code/:name",
        function(request, response) {
          var moduleName = request.params.name
          var statement = request.body

          var doArgs = [statement.functionName].concat(statement.args)

          programs.do.apply(programs, doArgs)

          response.send({ok: true})
        }
      )
    }

    function writeCode(bridge, name) {
      if (!name) {
        name = "undefined"
      }

      prepareBridge(bridge)

      var page = [
        element("h1", "ezjs"),
        editor(bridge, name),
      ]

      bridge.send(page)
    }

    writeCode.prepareBridge = prepareBridge

    writeCode.prepareSite = prepareSite

    return writeCode
  }
)

