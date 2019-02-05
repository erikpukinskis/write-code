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
  "an-expression"],
  function(lib, renderCode, WebSite, BrowserBridge, element, bridgeModule, xxx, aWildUniverseAppeared, anExpression) {

    var stylesheet = [
      "dogs.do(",
      "  \"laugh\",[",
      "  \"one\",",
      "  \"two. two Two they function they drop a line or two\"],",
      "  function*(this, that, theOther) {",
      "    var bone =newTreat(",
      "      *)",
      "    dogs.start(",
      "      3433,{",
      "      \"go\":\"go go\"},",
      "      browserBridge(",
      "        ).forResponse(",
      "          response))})",
      "          ezjs",
    ]

    var basicSite = [
      "library.define(",
      "  \"hello world\",[",
      "  \"web-site\",",
      "  \"web-element\",",
      "  \"browser-bridge\"],",
      "  function*(WebSite, element, BrowserBridge) {",
      "    var site =newWebSite(",
      "      *)",
      "    site.start(",
      "      3444)",
      "    var page = element(",
      "      \"hello world\")",
      "    site.addRoute(",
      "      \"get\",",
      "      \"/\",",
      "      function*(_, response) {",
      "        var bridge =newBrowserBridge(",
      "          ).forResponse(",
      "            response)",
      "        bridge.send(",
      "          page)})})",
      "          ezjs",
    ]

    var baseBridge = new BrowserBridge()

    var universe = aWildUniverseAppeared()

    var tree = anExpression.tree()

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

    var editLoop = bridgeModule(lib, "edit-loop", baseBridge).withArgs(baseBridge.event)

    var site = new WebSite()
    site.start(1110)
    site.addRoute(
      "get",
      "/",
      function(request, response) {
        var bridge = baseBridge.forResponse(response)

        var left = bridge.partial()
        var right = bridge.partial()
        renderCode(left, stylesheet, editLoop)
        renderCode(right, basicSite, editLoop)

        left = element(element.style({
          "margin-right": "100px",
        }), left)

        var page = element(
          element.style({
            "display": "flex",
          }),[
          left,
          right])

        bridge.send(page)
      }
    )

  }
)
