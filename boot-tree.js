var library = require("module-library")(require)

module.exports = library.export(
  "boot-tree",[
  "a-wild-universe-appeared",
  "an-expression",
  "make-request"],
  function(aWildUniverseAppeared, anExpression, makeRequest) {

    // this is the old one that had id rewriting working
    
    function bootTree(treeId, moduleName, baseLog) {

      var universe = aWildUniverseAppeared(
        "expression-tree", {
        anExpression: "an-expression"}, baseLog)

      universe.mirrorTo({
        "an-expression": anExpression})

      universe.playItBack()

      var tree = anExpression.getTree(treeId)

      return tree

      // universe.mute()
      tree.logTo(universe, true)

      var rewrite = rewriteIds.bind(null, tree, universe)

      var save = saveUniverse.bind(null, universe, programName)

      tree.save = sequence.bind(
        null,[
        rewrite,
        save,
        reload])

      return tree
    }


    function saveUniverse(universe, name, callback) {
      var statements = []

      var fromMark = universe.getLastSyncMark()
      var toMark = universe.mark()
      var statements = universe.getStatements(fromMark, toMark)

      makeRequest({
        method: "post",
        path: "/universes/expression-trees/"+name,
        data: {
          mark: fromMark,
          statements: statements}},
        function(response) {
          var success = response && response.status == 200
          if (success) {
            universe.markSynced(toMark, response.mark)
          }
          callback(success)
        }
      )
    }

    function rewriteIds(tree, universe, callback) {

      var forkIds = tree.getLocalTreeIds()
      var path = "/an-expression/reserve-tree-ids/"+forkIds.length+"?not="+forkIds.join(",")

      if (forkIds.length == 0) {
        return callback()
      }

      makeRequest({
        method: "post",
        path: path},
        function(ids) {
          var globalIds = keysWithValues(forkIds, ids)

          tree.swapInGlobalTreeIds(globalIds)

          universe.rewriteArguments(
            "anExpression.*",
            0,
            globalIds
          )

          callback()
        }
      )
    }

    function keysWithValues(keys, values) {
      var object = {}
      keys.forEach(function(key, i) {
        object[key] = values[i]
      })
      return object
    }

    function sequence(callbacks, completed) {
      if (!completed) {
        completed = 0
      }
      var next = sequence.bind(null, callbacks, completed+1)
      if (!callbacks[completed]) {
        return
      }
      callbacks[completed].call(null, next)
    }

    return bootTree
  }
)
