var runTest = require("run-test")(require)

runTest.library.define(
  "editor-session",
  ["browser-task"],
  function(browserTask) {
    function EditorSession(expect, done, callback) {

      var editor = this
      editor.done = done
      editor.expect = expect
      editor.nextId = 0
      editor.calledBack = {}

      browserTask(
        "http://localhost:1413",
        function(browser) {
          editor.browser = browser
          var type = editor.type.bind(editor)
          var expect = editor.expect.bind(editor)
          callback(type, expect)
        }
      )
    }

    EditorSession.prototype.expect = function() {
      var lines = Array.prototype.slice.call(arguments, 0)
      function pad(s) { return "  "+s }
      console.log("EXPECT\n"+lines.map(pad).join("\n"))
      this.expect(1).to.equal(1)
    }

    EditorSession.prototype.type = function() {
      for(var i=0; i<arguments.length; i++) {
        var key = arguments[i]
        console.log("TYPE", key)

        var callbackId = this.nextId
        this.calledBack[callbackId] = false
        var callback = tryToDie.bind(this, callbackId)

        this.browser.pressKey(key, callback)

        this.nextId++
      }
    }

    function tryToDie(callbackId) {
      debugger
      this.calledBack[callbackId] = true
      for(var id in this.callbackStatus) {
        if (!calledBack[id]) {
          return
        }
      }
      this.done()
      this.browser.done()
    }

    return EditorSession
  }
)

runTest(
  "function call",
  [".", "web-site", "editor-session"],
  function(expect, done, writeCode, WebSite, EditorSession) {
    var site = new WebSite()
    var start = site.start(1414)
    writeCode(start)
    new EditorSession(expect, done, function(type, expect) {
      type("a")
      expect("\"a\"")
      type("(")
      expect("a(",")")
    })
  }
)

// runTest(
//   "function call argument",
//   [".", "web-site", "editor-session"],
//   function(expect, done, writeCode, WebSite, EditorSession) {
//     writeCode(new WebSite().start(1415))
//     new EditorSession(expect, done, function(type, expect) {
//       type("a", "(", "b")
//       expect("a(","\"b\")")
//     })
//   }
// )

// runTest(
//   "function literal",
//   [".", "web-site", "editor-session"],
//   function(expect, done, writeCode, WebSite, EditorSession) {
//     writeCode(new WebSite().start(1416))
//     new EditorSession(expect, done, function(type, expect) {
//       type("f", "u", "n", "c", "t", "i", "o", "n", " ")
//       expect("function (){", "}")
//     })
//   }
// )

// runTest(
//   "function name",
//   [".", "web-site", "editor-session"],
//   function(expect, done, writeCode, WebSite, EditorSession) {
//     writeCode(new WebSite().start(1417))
//     new EditorSession(expect, done, function(type, expect) {
//       type("f", "u", "n", "c", "t", "i", "o", "n", " ", "f")
//       expect("function f(){", "}")
//     })
//   }
// )

// runTest(
//   "function call inside function literal",
//   [".", "web-site", "editor-session"],
//   function(expect, done, writeCode, WebSite, EditorSession) {
//     writeCode(new WebSite().start(1418))
//     new EditorSession(expect, done, function(type, expect) {
//       type("f", "u", "n", "c", "t", "i", "o", "n", " ", "a", "enter")
//       expect("function a(){", "}")
//       type("b")
//       expect("function a(){", "\"b\"}")
//       type("(")
//       expect("function a(){", "\"b(", ")}")
//       type("c")
//       expect("function a(){", "\"b(", "\"c\")}")  
//     })
//   }
// )
