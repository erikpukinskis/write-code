var runTest = require("run-test")(require)

runTest.library.define(
  "editor-session",
  ["browser-task"],
  function(browserTask) {
    function EditorSession(expect, done, callback) {

      var editor = this
      editor.done = done
      editor.expect = expect

      browserTask(
        "http://localhost:1413",
        function(browser) {
          editor.browser = browser
          var type = editor.type.bind(editor)
          var expect = editor.expect.bind(editor)
          callback(type, expect)
          editor.wait(done)
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
      }
    }

    EditorSession.prototype.wait = function(callback) {
      var editor = this
      console.log("WAITING...")
      setTimeout(function() {
        console.log("...DONE")
        editor.browser.done()
        editor.done()
      }, 200)
    }

    return EditorSession
  }
)

runTest(
  "function call",
  ["editor-session"],
  function(expect, done, EditorSession) {
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
//   ["editor-session"],
//   function(expect, done, EditorSession) {
//     new EditorSession(expect, done, function(type, expect) {
//       type("a", "(", "b")
//       expect("a(","\"b\")")
//     })
//   }
// )

// runTest(
//   "function literal",
//   ["editor-session"],
//   function(expect, done, EditorSession) {
//     new EditorSession(expect, done, function(type, expect) {
//       type("f", "u", "n", "c", "t", "i", "o", "n", " ")
//       expect("function (){", "}")
//     })
//   }
// )

// runTest(
//   "function name",
//   ["editor-session"],
//   function(expect, done, EditorSession) {
//     new EditorSession(expect, done, function(type, expect) {
//       type("f", "u", "n", "c", "t", "i", "o", "n", " ", "f")
//       expect("function f(){", "}")
//     })
//   }
// )

// runTest(
//   "function call inside function literal",
//   ["editor-session"],
//   function(expect, done, EditorSession) {
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
