
// codeLibrary.add(
//   "hello world",
//   ["appeared-a-wild", "web-element"],

function(appearedAWild, webElement) {
  appearedAWild(
    "browser-bridge",
    function(bridge) {
      bridge.send(
        webElement(
        "hello, world"))}

// )


library.using([
  "issueBond",
  "accountability"],
  function(issueBond, accountability) {
    issueBond.lineItem (
      "workshop" ,
      "jan-7-2108@bobby" ,
      "build roof, 6 hours" ,
      6 * 1500 )
    accountability()})


library.define(
  "a-panel-bond",[
  "issue-bond",
  "inches",
  "sell-bond"],
  function(issueBond, inches, sellBond) {
    issueBond(
      "a-panel",
      "Wall panel A",
      "Erik Pukinskis")
    var wallHeight = 88
    issueBond.tasks("a-panel",[
      "reserve a truck",
      "buy materials",
      "cut 4 steel studs to "+
      inches(
        wallHeight)])
    sellBond(
      "a-panel")})
