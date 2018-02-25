var runTest = require("run-test")(require)


runTest(
  "parsing",
  ["./editor"],
  function(expect, done, Editor) {
    var editor = new Editor()

    var segments = editor.parse("\"browser-bridge\"")
    expect(segments.outro).to.equal("\"")
    done.ish("quotes parse")

    segments = editor.parse("a")
    segments = editor.parse("\"ap\"")
    segments = editor.parse("\"appearedAWild(\"")
    segments = editor.parse("b)")
    segments = editor.parse("\"browser-bridge\")")
    segments = editor.parse("f)")

    segments = editor.parse("\"function \")")
    expect(segments.intro).to.equal("\"function ")
    done.ish("function literal symbol parses")

    segments = editor.parse("function s(){")
    segments = editor.parse("b})")
    segments = editor.parse("\"b(\"})")
    segments = editor.parse("hi)})")

    segments = editor.parse("do.dee.dum(")
    expect(segments.identifierIsh).to.equal("do.dee.dum")
    done.ish("methods parse")

    segments = editor.parse("\"function \"")
    expect(segments.intro).to.match(/function/)
    done.ish("function literal without closers parses")

    done()
  }
)

runTest(
  "updating from source",
  ["./editor"],
  function(expect, done, Editor) {

    var editor = new Editor()
    editor.text = function(line, text) {
      Editor.prototype.text.call(editor, line, text)
      Editor.prototype.text.call(editor, line, text)
    }

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
      // expect(editor.cursorColumn()).to.equal(column, "Expected cursor to be at column "+column+" but it was on "+editor.cursor())
    }

    // editor.text(0, "\"hi (\"")
    // expectSymbols(0, ["quote"], ["quote"])
    // expectText(0, "hi (")
    // done.ish("can use parentheticals in quotes")

    // editor.text(0, "\"hi,"")
    // expectSymbols(0, ["quote"], ["quote"])
    // expectText(0, "hi,")
    // done.ish("can use commas in quotes")

    editor.text(0, "")
    expectSymbols(0, [], [])
    expectText(0, Editor.EMPTY)
    done.ish("empty text is empty")

    editor.text(0, "\""+Editor.EMPTY)
    expectSymbols(0, [], [])
    expectText(0, Editor.EMPTY)
    done.ish("single quote is empty")

    editor.text(0, "\"\"")
    expectSymbols(0, ["quote"], ["quote"])
    expectText(0, "")
    done.ish("empty string is string")

    editor.text(0, "\""+Editor.EMPTY+"\"")
    expectSymbols(0, ["quote"], ["quote"])
    expectText(0, Editor.EMPTY)
    done.ish("empty string with nonprinting space is string")

    editor.text(0, "a"+Editor.EMPTY)
    expectSymbols(0, ["quote"], ["quote"])
    expectText(0, "a")
    done.ish("strip nonprinting character from strings with printing characters")

    editor.text(0, "\"browser-bridge\"")
    expectSymbols(0, ["quote"], ["quote"])
    done.ish("quotes get recognized")
    expectText(0, "browser-bridge")
    done.ish("strings can be unlike symbols")

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
    expectSymbols(1, [], ["right-paren"])
    done.ish("function calls recognized")
    done.ish("next line gets function call closer")
    expectText(0, "appearedAWild")
    done.ish("function name gets split out")
    // expectCursor(1,0)
    // done.ish("cursor drops to first arg")
    expectText(1, Editor.EMPTY)
    done.ish("first arg is empty")

    editor.text(1, "b)")
    expectSymbols(1, ["quote"], ["quote", "right-paren"])
    done.ish("arg can be quoted")
    expectText(1, "b")

    editor.text(1, "\"browser-bridge\")")
    expectSymbols(1, ["quote"], ["quote", "right-paren"])
    expectText(1, "browser-bridge")
    done.ish("string args stay quoted")

    editor.pressEnter(1)
    expectSymbols(1, ["quote"], ["quote", "comma"])

    done.ish("arg separator")
    expectSymbols(2, [], ["right-paren"])
    done.ish("closing symbols go to last arg")
    // expectCursor(2,1)
    expectText(2, Editor.EMPTY)
    done.ish("new args are empty")

    editor.text(2, "f)")
    expectSymbols(2, ["quote"], ["quote", "right-paren"])
    expectText(2, "f")
    done.ish("additonal args get quoted")
    // expectCursor(2, 1)

    editor.text(2, "\"function \")")
    expectSymbols(2, ["function"], ["arguments-open", "arguments-close", "curly-open"])
    done.ish("function literals get recognized")
    expectSymbols(3, [], ["curly-close", "right-paren"])
    done.ish("function literals get closed")
    expectText(2, " ")
    done.ish("function literal name is a space")
    // expectCursor(2, 1)
    expectText(3, Editor.EMPTY)
    done.ish("first line is empty")

    editor.text(2, "function(){")
    expectSymbols(2, ["quote"], ["quote"])
    expectText(2, "function")
    done.ish("messed up function literals don't get mistaken for function calls")
    
    editor.text(2, "function s(){")
    expectSymbols(2, ["function"], ["arguments-open", "arguments-close", "curly-open"])
    expectText(2, " s")
    done.ish("functions have names")
    // expectCursor(2, 1)

    editor.pressEnter(2)
    expectText(3, Editor.EMPTY)
    expectText(4, undefined)
    done.ish("don't add extra lines if there's already an empty one")
    // expectCursor(3, 1)

    editor.text(3, "b})")
    expectSymbols(3, ["quote"], ["quote", "curly-close", "right-paren"])
    done.ish("string lines inside function literals get symbols")
    expectText(3, "b")

    editor.text(3, "\"b(\"})")
    expectSymbols(3, [], ["left-paren"])
    expectText(3, "b")
    done.ish("function call inside a function literal")
    expectText(4, Editor.EMPTY)
    done.ish("call inside function gets empty arg")
    expectSymbols(4, [], ["right-paren", "curly-close", "right-paren"])
    done.ish("call inside literal inside call closes properly")

    editor.text(4, "hi)})")
    expectSymbols(4, ["quote"], ["quote", "right-paren", "curly-close", "right-paren"])
    done.ish("quote string four levels deep")

    done()
  }
)
