var runTest = require("run-test")(require)

runTest(
  "works",
  ["./editor"],
  function(expect, done, Editor) {

    var editor = new Editor()

    function expectSymbols(line, intro, outro) {
      expect(editor.getIntroSymbols(line)).to.deep.equal(intro)
      expect(editor.getOutroSymbols(line)).to.deep.equal(outro)
    }

    function expectText(line, text) {
    }

    function expectCursor(line, column) {
    }

    editor.type("a")
    expectSymbols(0, ["quote"], ["quote"])
    expectText(0, "a")

    editor.type("p")
    expectSymbols(0, ["quote"], ["quote"])
    expectText(0, "ap")

    editor.type("earedAWild(")
    expectSymbols(0, [], ["left-paren"])
    expectSymbols(1, [], ["right-paren"])
    expectText(0, "appearedAWild")
    expectCursor(1,0)

    editor.type("browser-bridge")
    expectSymbols(1, ["quote"], ["quote", "right-paren"])
    expectText(1, "browser-bridge")

    editor.pressEnter()
    expectSymbols(1, ["quote"], ["quote", "comma"])
    expectSymbols(2, [], ["right-paren"])
    expectCursor(2,0)

    editor.type("f")
    expectSymbols(2, ["quote"], ["quote", "right-paren"])
    expectText(2, "f")

    editor.type("function ")
    expectSymbols(2, ["function"], ["arguments-open", "arguments-close", "curly-open"])
    expectSymbols(3, ["curly-close", "right-paren"])

    done()
  }
)
