var library = require ("module-library")(require)

library.using([
  library.ref(),
  "web-site",
  "child_process",
  "./",
  "browser-bridge",
  "make-request",
  "a-wild-universe-appeared",
  "an-expression",
  "bridge-module"],
  function(lib, WebSite, childProcess, writeCode, BrowserBridge, makeRequest, aWildUniverseAppeared, anExpression, bridgeModule) {

    var site = new WebSite()

    writeCode.prepareSite(site)

    var programs = aWildUniverseAppeared(
      "programs", {
      anExpression: "an-expression"})

    var tree = anExpression.tree()
    tree.logTo(programs, true)

    tree.addExpressionAt(
      tree.reservePosition(),
      anExpression.functionLiteral())

    site.addRoute(
      "get",
      "/write-code/:name",
      function(request, response) {

        var bridge = new BrowserBridge()
          .forResponse(response)

        var name = request.params.name

        writeCode(bridge, programs, tree.id, name)
      }
    )

    site.start(1413)

    // childProcess.exec("open http://localhost:1413/write-code/hello-world")
  }
)
