var runTest = require("run-test")(require)

runTest.only(
  "updating from source")

runTest(
  "remainder from string expression is nothing",[
  "./editor"],
  function(expect, done, Editor) {
    var editor = new Editor()
    var lineNumber = editor.text(0, 
      "\"hi\"")
    expect(lineNumber).to.equal(0)
    done()
  })


runTest(
  "import function call",
  ["./editor", "an-expression"],
  function(expect, done, Editor, anExpression) {
    var tree = anExpression.tree()

    tree.addExpressionAt(
      0,{
      "kind": "function call",
      "functionName": "go",
      id: "exp-call1"})

    tree.addToParent(
      "exp-call1",{
      "kind": "string literal",
      "string": "blast",
      id: "exp-string1"})

    tree.addToParent(
      "exp-call1",{
      "kind": "string literal",
      "string": "off",
      id: "exp-string2"})

    var editor = new Editor(tree)

    expect(editor.lineIds.length).to.equal(3)

    expect(editor.firstHalves["exp-call1"]).to.equal("go")
    done.ish("import function call name")

    expect(editor.outros["exp-call1"]).to.deep.equal(["left-paren"])
    done.ish("import function call outro")

    expect(editor.firstHalves["exp-string1"]).to.equal("blast")
    expect(editor.parents["exp-string1"]).to.equal("exp-call1")
    expect(editor.parents["exp-string2"]).to.equal("exp-call1")
    done.ish("imported call args have a parent")

    expect(editor.outros["exp-string1"]).to.deep.equal(["quote", "comma"])
    done.ish("multiple imported args get comma")

    expect(editor.linesClosedOn["exp-string2"]).to.deep.equal(["exp-call1"])
    done.ish("last call arg closes line")

    expect(editor.outros["exp-string2"]).to.deep.equal(["quote", "right-paren"])
    done.ish("last call arg gets paren in outro")

    done()
  }
)

runTest(
  "import function literal",
  ["./editor", "an-expression"],
  function(expect, done, Editor, anExpression) {
    var tree = anExpression.tree()

    tree.addExpressionAt(
      0,{
      "kind": "function literal",
      "functionName": "myFunc",
      "argumentNames": ["blee", "bloop"],
      id: anExpression.id()})

    var editor = new Editor(tree)
    var lineId = editor.lineIds.get(0)

    expect(editor.firstHalves[lineId]).to.equal("myFunc")
    done.ish("import function names")

    expect(editor.intros[lineId]).to.equal("function")
    done.ish("import function intro")

    expect(editor.separators[lineId]).to.equal("arguments-open")
    done.ish("import function separator")

    expect(editor.secondHalves[lineId]).to.equal("blee, bloop")
    done.ish("import function argument signature")

    expect(editor.outros[lineId]).to.deep.equal(["arguments-close", "curly-open"])
    done.ish("import function outro")

    done()
  }
)

    // function literals get symbol
    // function literal outro
    // function literal args
    // function call outro
    // call parent
    // call arg closes right line


runTest(
  "import string",
  ["./editor", "an-expression"],
  function(expect, done, Editor, anExpression) {
    var tree = anExpression.tree()

    tree.addExpressionAt(
      0,{
      "kind": "string literal",
      "string": "blah",
      id: anExpression.id()})

    var editor = new Editor(tree)

    expect(editor.lineIds.length).to.equal(1)
    done.ish("import tree ids")
    var lineId = editor.lineIds.get(0)

    expect(editor.firstHalves[lineId]).to.equal("blah")
    done.ish("import string bodies")

    expect(editor.intros[lineId]).to.equal("quote")
    expect(editor.outros[lineId]).to.deep.equal(["quote"])
    done.ish("import intro and outro quotes")

    done()
  }
)

runTest(
  "get some lines",
  ["./editor", "an-expression", "a-wild-universe-appeared"],
  function(expect, done, Editor, anExpression, aWildUniverseAppeared) {

    var tree = anExpression.tree()

    var universe = aWildUniverseAppeared("lines", {anExpression: "an-expression"})
    universe.mute()

    var count = 0
    var functionLiteralId
    var callId

    universe.onStatement(function(call, args) {

      if (count == 0) {
        expect(call).to.equal("anExpression.tree")
        done.ish("initialized tree in log")

      } else if (count == 1) {
        expect(call).to.equal("anExpression.addToTree")
        var index = args[1]
        var attributes = args[2]
        expect(attributes.kind).to.equal("function literal")
        done.ish("function literal in log")
        expect(index).to.equal(0)
        done.ish("first expression indexed in log")
        functionLiteralId = attributes.id
        done.ish("initialized function literal in log")

      } else if (count == 2) {
        expect(call).to.equal("anExpression.addToParent")
        var parentId = args[1]
        var attributes = args[2]
        expect(attributes.kind).to.equal("string literal")
        done.ish("string literal in log")
        expect(args[1]).to.equal(functionLiteralId)
        done.ish("string added to function in log")

      } else if (count == 3) {
        expect(call).to.equal("anExpression.setAttribute")
        done.ish("updated attribute in log")

      } else if (count == 4) {
        expect(call).to.equal("anExpression.insertExpression")
        var attributes = args[1]
        callId = attributes.id
        done.ish("change line type in log")

      } else if (count == 5) {
        expect(call).to.equal("anExpression.addToParent")
        var parentId = args[1]
        var attributes = args[2]
        expect(parentId).to.equal(callId)
        done()
      }

      count++
    })

    tree.logTo(universe, true)

    var editor = new Editor(tree)

    editor.text(0, "h")
    editor.text(0, "\"hi\"")
    editor.text(0, "\"hi(\"")
    editor.text(1, "foo")
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

    function expectSymbols(line, expectedIntro, expectedSeparator, expectedOutro) {

      var intro = editor.getIntroSymbol(line)
      var message = "expected intro symbol "+JSON.stringify(expectedIntro)+" on line "+line+" but editor thinks it is "+JSON.stringify(intro)
      expect(expectedIntro).to.equal(intro, message)

      var separator = editor.getSeparator(line)
      var message = "expected separator "+JSON.stringify(expectedSeparator)+" on line "+line+" but editor thinks it is "+JSON.stringify(separator)
      expect(expectedSeparator).to.equal(separator, message)

      var outro = editor.getOutroSymbols(line)
      var otherMessage = "expected outro symbols "+JSON.stringify(expectedOutro)+" on line "+line+" but editor thinks they are "+JSON.stringify(outro)
      expect(expectedOutro).to.deep.equal(outro, otherMessage)
    }

    function expectText(line, firstHalf, secondHalf) {
      var message = "expected first half of line "+line+" to be "+JSON.stringify(firstHalf)
      expect(editor.getFirstHalf(line)).to.equal(firstHalf, message)

      message = "expected second half of line "+line+" to be "+JSON.stringify(secondHalf)
      expect(editor.getSecondHalf(line)).to.equal(secondHalf, message)
    }

    function expectCursor(line, column) {
      expect(editor.cursorLine()).to.equal(line, "Expected cursor to be on line "+line+" but it was on "+editor.cursorLine())
      // expect(editor.cursorColumn()).to.equal(column, "Expected cursor to be at column "+column+" but it was on "+editor.cursor())
    }

    // editor.text(0, "\"hi (\"")
    // expectSymbols(0, "quote", undefined, ["quote"])
    // expectText(0, "hi (")
    // done.ish("can use parentheticals in quotes")

    // editor.text(0, "\"hi,"")
    // expectSymbols(0, "quote", undefined, ["quote"])
    // expectText(0, "hi,")
    // done.ish("can use commas in quotes")

    editor.text(0, "")
    var lineId = editor.lineIds.get(0)
    expect(editor.parents[lineId]).to.exist
    done.ish("empty expression gets parented")
    expectSymbols(0, undefined, undefined, [])
    expectText(0, Editor.EMPTY)
    done.ish("empty text is empty")

    editor.text(0, "\""+Editor.EMPTY)
    expectSymbols(0, undefined, undefined, [])
    expectText(0, Editor.EMPTY)
    done.ish("single quote is empty")

    editor.text(0, "\"\"")
    expectSymbols(0, "quote", undefined, ["quote"])
    expectText(0, "")
    done.ish("empty string is string")

    editor.text(0, "\""+Editor.EMPTY+"\"")
    expectSymbols(0, "quote", undefined, ["quote"])
    expectText(0, Editor.EMPTY)
    done.ish("empty string with nonprinting space is string")

    editor.text(0, "a"+Editor.EMPTY)
    expectSymbols(0, "quote", undefined, ["quote"])
    expectText(0, "a")
    done.ish("strip nonprinting character from strings with printing characters")

    editor.text(0, "\"browser-bridge\"")
    expectSymbols(0, "quote", undefined, ["quote"])
    done.ish("quotes get recognized")
    expectText(0, "browser-bridge")
    done.ish("strings can be unlike symbols")

    editor.text(0, "a")
    expectSymbols(0, "quote", undefined, ["quote"])
    done.ish("string gets quoted!")
    expectText(0, "a")
    done.ish("string gets identified out")

    editor.text(0, "\"ap\"")
    expectSymbols(0, "quote", undefined, ["quote"])
    done.ish("quotes are ok after editing string")
    expectText(0, "ap")
    done.ish("string still separate")

    editor.text(0, "\"appearedAWild(\"")
    expectSymbols(0, undefined, undefined, ["left-paren"])
    expectSymbols(1, undefined,undefined, ["right-paren"])
    done.ish("function calls recognized")
    done.ish("next line gets function call closer")
    expectText(0, "appearedAWild")
    done.ish("function name gets split out")
    // expectCursor(1,0)
    // done.ish("cursor drops to first arg")
    expectText(1, Editor.EMPTY)
    done.ish("first arg is empty")

    debugger
    editor.text(1, "b)")
    expectSymbols(1, "quote", undefined, ["quote", "right-paren"])
    done.ish("arg can be quoted")
    expectText(1, "b")
    done.ish("variable param gets correct text")
    var firstLineId = editor.lineIds.get(0)
    var secondLineId = editor.lineIds.get(1)
    expect(editor.linesClosedOn[secondLineId]).to.include(firstLineId)
    done.ish("call gets closed")

    editor.text(1, "\"browser-bridge\")")
    expectSymbols(1, "quote", undefined, ["quote", "right-paren"])
    expectText(1, "browser-bridge")
    done.ish("string args stay quoted")

    editor.pressEnter(1)
    expectSymbols(1, "quote", undefined, ["quote", "comma"])

    done.ish("arg separator")
    expectSymbols(2, undefined, undefined, ["right-paren"])
    done.ish("closing symbols go to last arg")
    // expectCursor(2,1)
    expectText(2, Editor.EMPTY)
    done.ish("new args are empty")

    editor.text(2, "f)")
    expectSymbols(2, "quote", undefined, ["quote", "right-paren"])
    expectText(2, "f")
    done.ish("additonal args get quoted")
    // expectCursor(2, 1)

    editor.text(2, "\"function \")", Editor.EMPTY)

    expectSymbols(2, "function", "arguments-open", ["arguments-close", "curly-open"])
    done.ish("function literals get recognized")

    expectSymbols(3, undefined, undefined, ["curly-close", "right-paren"])
    done.ish("function literals get closed")
    expectText(2, " ", Editor.EMPTY)
    done.ish("function literal name is a space and argument signature is empty")
    // expectCursor(2, 1)
    expectText(3, Editor.EMPTY)
    done.ish("first line is empty")

    editor.text(2, "function(){")
    expectSymbols(2, "quote", undefined, ["quote"])
    expectText(2, "function")
    done.ish("messed up function literals don't get mistaken for function calls")
    
    editor.text(2, "function s(){")
    expectSymbols(2, "function", "arguments-open", ["arguments-close", "curly-open"])
    expectText(2, " s", Editor.EMPTY)
    done.ish("functions have names")
    // expectCursor(2, 1)

    editor.text(2, "function s(boofer, doofer){")
    expectSymbols(2, "function", "arguments-open", ["arguments-close", "curly-open"])
    expectText(2, " s", "boofer, doofer")
    done.ish("functions have signatures")

    editor.pressEnter(2)
    expectText(3, Editor.EMPTY)
    expectText(4, undefined)
    done.ish("don't add extra lines if there's already an empty one")
    // expectCursor(3, 1)

    editor.text(3, "b})")
    expectSymbols(3, "quote", undefined, ["quote", "curly-close", "right-paren"])
    done.ish("string lines inside function literals get symbols")
    expectText(3, "b")

    editor.text(3, "\"b(\"})")
    expectSymbols(3, undefined, undefined, ["left-paren"])
    expectText(3, "b")
    done.ish("function call inside a function literal")
    expectText(4, Editor.EMPTY)
    done.ish("call inside function gets empty arg")
    expectSymbols(4, undefined, undefined, ["right-paren", "curly-close", "right-paren"])
    done.ish("call inside literal inside call closes properly")

    editor.text(4, "hi)})")
    editor.dump()
    expectSymbols(4, "quote", undefined, ["quote", "right-paren", "curly-close", "right-paren"])
    done.ish("quote string four levels deep")

    done()
  }
)
