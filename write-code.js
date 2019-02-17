var library = require("module-library")(require)

library.using([
  library.ref(),
  "./render-code",
  "web-site",
  "browser-bridge",
  "web-element",
  "bridge-module",
  "./edit-loop",
  "a-wild-universe-appeared",
  "an-expression",
  "./editor"],
  function(lib, renderCode, WebSite, BrowserBridge, element, bridgeModule, xxx, aWildUniverseAppeared, anExpression, Editor) {

    var stylesheet = [
      "dogs.do(",
      "  \"laugh\",[",
      "  \"one\",",
      "  \"two. two Two they function they drop a line or two\"],",
      "  // wasn't that a long string?",
      "  function*(this, that, theOther) {",
      "    var bone = new Treat(",
      "      *)",
      "    dogs.start(",
      "      3433,{",
      "      \"go\":\"go go\"},",
      "      browserBridge(",
      "        ).forResponse(",
      "          response))})",
      "  // ezjs",
    ]

    // var basicSite = [
    //   "library.define(",
    //   "  \"hello world\",[",
    //   "  \"web-site\",",
    //   "  \"web-element\",",
    //   "  \"browser-bridge\"],",
    //   "  function*(WebSite, element, BrowserBridge) {",
    //   "    var site =newWebSite(",
    //   "      *)",
    //   "    site.start(",
    //   "      3444)",
    //   "    var page = element(",
    //   "      \"hello world\")",
    //   "    site.addRoute(",
    //   "      \"get\",",
    //   "      \"/\",",
    //   "      function*(_, response) {",
    //   "        var bridge =newBrowserBridge(",
    //   "          ).forResponse(",
    //   "            response)",
    //   "        bridge.send(",
    //   "          page)})})",
    //   "          ezjs",
    // ]

    var empty = ["hello world"]
    var baseBridge = new BrowserBridge()

    var universe = aWildUniverseAppeared(
      "just-this-one",{
      anExpression: anExpression})

    var tree = anExpression.tree()
    tree.logTo(universe, true)
    var editor = new Editor(tree)
    editor.importLines(empty)

    var editorBinding = baseBridge.defineSingleton(
      "editor",[
      bridgeModule(lib, "./editor", baseBridge),
      bridgeModule(lib, "./boot-tree", baseBridge),
      universe.builder(),
      tree.id,
      "whatever"],
      function(Editor, bootTree, baseLog, treeId, moduleName) {
        var tree = bootTree(treeId, moduleName, baseLog)
        return new Editor(tree)
      }
    )

    var editLoop = bridgeModule(lib, "edit-loop", baseBridge).withArgs(editorBinding, baseBridge.event)

    var site = new WebSite()
    site.start(1110)
    site.addRoute(
      "get",
      "/",
      function(request, response) {
        var bridge = baseBridge.forResponse(response)

        bridge.domReady(
          function() {
            document.querySelector(".editable").focus()
            console.log("ya!")
          })

        var left = bridge.partial()

        // renderCode(left, empty, editLoop)

        renderCode(left, stylesheet, editLoop)
        // renderCode(right, basicSite, editLoop)

        left = element(element.style({
          "margin-right": "100px",
        }), left)

        var page = element(
          element.style({
            "display": "flex",
          }),[
          left,
          // right,
          ])

        bridge.send(page)
      }
    )

  }
)
