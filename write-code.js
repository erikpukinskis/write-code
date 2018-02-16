var library = require("module-library")(require)

// Todo:   capture enter keypress and start new string literal

module.exports = library.export(
  "write-code",
  [library.ref(), "browser-bridge", "web-element", "add-html", "bridge-module", "./edit-loop", "./lines", "a-wild-universe-appeared"],
  function(lib, BrowserBridge, element, addHtml, bridgeModule, editLoop, lines, aWildUniverseAppeared) {

    function prepareBridge(bridge) {

      if (bridge.remember("write-code/editRenderLoop")) {
        return }

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
      function(bridge, editLoop) {
        this.addAttributes({
          "onkeydown": editLoop.evalable(),
          "onkeypress": editLoop.evalable()})
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
        "/universes/expression-trees/:name",
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

      var save = bridge.defineFunction([
        bridgeModule(lib, "make-request", bridge),
        name],
        function save(makeRequest, moduleIdentifier, functionName, args) {

          var data = {
            functionName: functionName,
            args: args,
          }

          var path = "/universes/expression-trees/"+moduleIdentifier

          makeRequest({
            method: "post",
            path: path,
            data: data })})

      var lines = bridge.defineSingleton(
        "lines",[
        bridgeModule(lib, "./lines", bridge),
        bridgeModule(lib, "a-wild-universe-appeared", bridge),
        bridgeModule(lib, "an-expression", bridge)],
        function(Lines, aWildUniverseAppeared, anExpression) {

          var tree = anExpression.tree()
          var universe = aWildUniverseAppeared(
            "expression-tree", {
            anExpression: "an-expression"})

          universe.mute()
          tree.logTo(universe)

          tree.addExpressionAt(
            tree.reservePosition(),
            anExpression.functionLiteral())

          universe.onStatement(save)

          var lines = new Lines(tree)

          return lines
        })

      var editLoop = bridgeModule(lib, "./edit-loop", bridge).withArgs(lines, bridge.event)
      
      bridge.asap(
        [lines, name],
        function(lines, name) {
          lines.setIdentifier(name)
        }
      )

      var page = [
        element("h1", "ezjs"),
        editor(bridge, editLoop),
      ]

      bridge.send(page)
    }

    writeCode.prepareBridge = prepareBridge

    writeCode.prepareSite = prepareSite

    return writeCode
  }
)

