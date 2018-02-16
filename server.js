var WebSite = require("web-site")
var childProcess = require("child_process")
var writeCode = require("./")
var BrowserBridge = require("browser-bridge")
var makeRequest = require("make-request")
var aWildUniverseAppeared = require("a-wild-universe-appeared")
var anExpression = require("an-expression")
var bridgeModule = require("bridge-module")

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

    var tree = bridge.defineSingleton(
      "tree",[
      bridgeModule(lib, "a-wild-universe-appeared", bridge),
      bridgeModule(lib, "an-expression", bridge),
      save],
      function(aWildUniverseAppeared, anExpression, save) {

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

        return tree
      })

    writeCode(bridge, treeBinding)
  }
)

site.start(1413)

// childProcess.exec("open http://localhost:1413")
