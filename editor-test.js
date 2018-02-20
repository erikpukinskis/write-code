var runTest = require("run-test")(require)

runTest(
  "works",
  ["./editor"],
  function(expect, done, Editor) {

    var editor = new Editor()

    function expectSymbols(line, intro, outro) {
      var introSymbols = editor.getIntroSymbols(line)
      var outroSymbols = editor.getOutroSymbols(line)
      var message = "expected intro symbols "+JSON.stringify(intro)+" on line "+line+" but editor thinks they are "+JSON.stringify(introSymbols)
      expect(introSymbols).to.deep.equal(intro, message)
      var otherMessage = "expected outro symbols "+JSON.stringify(outro)+" on line "+line+" but editor thinks they are "+JSON.stringify(outroSymbols)
      expect(outroSymbols).to.deep.equal(outro, otherMessage)
    }

    function expectText(line, text) {
      expect(editor.getFirstEditable(line)).to.equal(text)
    }

    function expectCursor(line, column) {
      expect(editor.cursorLine()).to.equal(line, "Expected cursor to be on line "+line+" but it was on "+editor.cursorLine())
      expect(editor.cursorColumn()).to.equal(column, "Expected cursor to be at column "+column+" but it was on "+editor.cursorColumn())
    }

    editor.text(0, "a")
    expectSymbols(0, ["quote"], ["quote"])
    done.ish("string gets quoted!")
    expectText(0, "a")
    done.ish("string gets identified out")

    editor.text(0, "\"ap\"")
    expectSymbols(0, ["quote"], ["quote"])
    done.ish("quotes are ok after editing string")
    expectText(0, "ap")
    done.ish("string still separate")

    editor.text(0, "\"appearedAWild(\"")
    expectSymbols(0, [], ["left-paren"])
    done.ish("function calls recognized")
    expectSymbols(1, [], ["right-paren"])
    done.ish("next line gets function call closer")
    expectText(0, "appearedAWild")
    done.ish("function name gets split out")
    expectCursor(1,0)
    done.ish("cursor drops to first arg")
    expectText(1, Editor.EMPTY)
    done.ish("first arg is empty")

    editor.text(1, "b)")
    expectSymbols(1, ["quote"], ["quote", "right-paren"])
    done.ish("arg can be quoted")
    expectText(1, "b")

    editor.text(1, "\"browser-bridge\")")
    expectSymbols(1, ["quote"], ["quote", "right-paren"])
    expectText(1, "browser-bridge")

    editor.pressEnter()
    expectSymbols(1, ["quote"], ["quote", "comma"])
    expectSymbols(2, [], ["right-paren"])
    expectCursor(2,1)
    expectText(2, Editor.EMPTY)

    editor.text(2, "f)")
    expectSymbols(2, ["quote"], ["quote", "right-paren"])
    expectText(2, "f")
    expectCursor(2, 1)

    editor.text(2, "\"function \")")
    expectSymbols(2, ["function"], ["arguments-open", "arguments-close", "curly-open"])
    expectSymbols(3, [], ["curly-close", "right-paren"])
    expectText(2, Editor.EMPTY)
    expectCursor(2, 1)
    expectText(3, Editor.EMPTY)

    editor.text(2, "function s(){")
    expectSymbols(2, ["function"], ["arguments-open", "arguments-close", "curly-open"])
    expectText(2, "s")
    expectCursor(2, 1)

    editor.pressEnter()
    expectText(3, Editor.EMPTY)
    expectCursor(3, 1)

    editor.text(3, "b})")
    expectSymbols(3, ["quote"], ["quote", "curly-close", "right-paren"])
    expectText(3, "b")

    editor.text(3, "\"b(\"})")
    expectSymbols(3, [], ["left-paren"])
    expectText(3, "b")
    expectText(4, Editor.EMPTY)
    expectSymbols(4, [], ["right-paren", "curly-close", "right-paren"])

    editor.text(4, "hi)})")
    expectSymbols(4, ["quote"], ["quote", "right-paren", "curly-close", "right-paren"])

    done()
  }
)
