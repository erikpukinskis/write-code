var library = require ("module-library")(require)

library.define(
  "boot-tree",[
  "a-wild-universe-appeared",
  "an-expression",
  "make-request"],
  function(aWildUniverseAppeared, anExpression, makeRequest) {

    function bootTree(name) {
      var tree = this.tree = anExpression.tree()
      var universe = aWildUniverseAppeared(
        "expression-tree", {
        anExpression: "an-expression"})

      // universe.mute()
      tree.logTo(universe, true)

      universe.onStatement(save.bind(null, name))

      return tree
    }

    function save(moduleIdentifier, functionName, args) {

      var data = {
        functionName: functionName,
        args: args,
      }

      var path = "/universes/expression-trees/"+moduleIdentifier

      makeRequest({
        method: "post",
        path: path,
        data: data })
    }

    return bootTree
  }
)

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

    site.addRoute(
      "get",
      "/write-code/:name",
      function(request, response) {

        var bridge = new BrowserBridge()
          .forResponse(response)

        var name = request.params.name

        var tree = bridge.defineSingleton(
          "treeSingleton",[
          bridgeModule(lib, "boot-tree", bridge),
          name],
          function(bootTree, name) {
            return bootTree(name)
          }
        )

        writeCode(bridge, tree)
      }
    )

    site.start(1413)

    // childProcess.exec("open http://localhost:1413/write-code/hello-world")
  }
)
