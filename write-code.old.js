var library = require("module-library")(require)


module.exports = library.export(
  "write-code",
  [library.ref(), "web-element", "bridge-module", "./edit-loop", "./editor", "an-expression", "./render-javascript"],
  function(lib, element, bridgeModule, editLoopXXXX, Editor, anExpression, renderJavascript) {

    function prepareBridge(bridge) {

      if (bridge.remember("write-code")) {
        return }

      bridge.see("write-code", true)

      var focus = element.style(
        ".editable:focus", {
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
          document.querySelector(".editable").focus()
        })

      var body = element.style(
        "body",{
        "font-family": "sans-serif", //"Georgia, serif",
        "max-width": "30em",
        // "background": "url(/lightpaperfibers.png)",
        "opacity": "0.8"})

      bridge.addToHead(
        element.stylesheet(
          body,
          editable,
          token,
          focus))
    }



    var editable = element.template(
      ".editable" , {
      "contenteditable": "true"},
      element.style({
        "margin-left": "1em",
        "font-size": "30px"}),
      function(bridge, editLoop, lines) {
        this.addAttributes({
          "onkeydown": editLoop.evalable()})
        this.addChild(
          lines)
     })

    var programUniverses = {}

    function prepareSite(site, universe, name) {
      programUniverses[name] = universe

      if (site.remember("write-code")) {
        return
      }

      site.addRoute(
        "post",
        "/universes/expression-trees/:name",
        function(request, response) {
          var moduleName = request.params.name
          var statement = request.body

          var doArgs = [statement.functionName].concat(statement.args)

          var universe = programUniverses[name]

          universe.do.apply(universe, doArgs)

          response.send({ok: true})
        }
      )

      site.see("write-code", true);
    }

    var logo = element(
      ".layer.layer0",
      element.style({
        "margin-top": "4em",
        "float": "right"}),
      element(
        "span.text-symbol.symbol.logo",
        "ezjs"))

    function writeCode(bridge, universe, treeId, moduleName) {

      prepareBridge(bridge)

      var editorBinding = bridge.defineSingleton(
        "editor",[
        bridgeModule(lib, "./editor", bridge),
        bridgeModule(lib, "./boot-tree", bridge),
        universe.builder(),
        treeId,
        moduleName],
        function(Editor, bootTree, baseLog, treeId, moduleName) {
          var tree = bootTree(treeId, moduleName, baseLog)
          return new Editor(tree)
        }
      )

      var editLoop = bridgeModule(
        lib,
        "./edit-loop",
        bridge)
      .withArgs(
        editorBinding,
        bridge.event)

      var tree = anExpression.getTree(treeId)
      var editor = new Editor(tree)

      var lines = bridge.partial()

      renderJavascript.prepareBridge(bridge)

      renderJavascript(lines, function(addLine) {
        editor.lineIds.forEach(
          function(lineId, lineNumber) {
            addLine(
              editor.depthOf(lineId),
              editor.intros[lineId],
              editor.firstHalves[lineId],
              editor.separators[lineId],
              editor.secondHalves[lineId],
              editor.outros[lineId])
          })})


      var page = [
        editable(bridge, editLoop, lines),
        logo
      ]

      bridge.send(page)
    }

    writeCode.prepareBridge = prepareBridge

    writeCode.prepareSite = prepareSite

    return writeCode
  }
)

