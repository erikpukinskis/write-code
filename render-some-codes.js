var library = require("module-library")(require)

library.using([
  "./render-code",
  "web-site",
  "browser-bridge",
  "web-element"],
  function(renderCode, WebSite, BrowserBridge, element) {

    var stylesheet = [
      "dogs.do(",
      "  \"laugh\",[",
      "  \"one\",",
      "  \"two. two Two they function they drop a line or two\"],",
      "  function*(this, that, theOther) {",
      "    var bone =newTreat(",
      "      *)",
      "    dogs.start(",
      "      3433,{",
      "      \"go\":\"go go\"})",
      "     browserBridge(",
      "       ).forResponse(",
      "         response)})",
      "         ezjs",
    ]

    var basicSite = [
      "library.define(",
      "  \"hello world\",[",
      "  \"web-site\",",
      "  \"web-element\",",
      "  \"browser-bridge\"],",
      "  function*(WebSite, element, BrowserBridge) {",
      "    var site =newWebSite(",
      "      *)",
      "    site.start(",
      "      3444)",
      "    var page = element(",
      "      \"hello world\")",
      "    site.addRoute(",
      "      \"get\",",
      "      \"/\",",
      "      function*(_, response) {",
      "        var bridge =newBrowserBridge(",
      "          ).forResponse(",
      "            response)",
      "        bridge.send(",
      "          page)})})",
      "          *",
      "          ezjs",
    ]

    var baseBridge = new BrowserBridge()

    var site = new WebSite()
    site.start(1110)
    site.addRoute(
      "get",
      "/",
      function(request, response) {
        var bridge = baseBridge.forResponse(response)

        var left = bridge.partial()
        var right = bridge.partial()
        renderCode(left, stylesheet)
        renderCode(right, basicSite)

        left = element(element.style({
          "margin-right": "100px",
        }), left)

        var page = element(
          element.style({
            "display": "flex",
          }),[
          left,
          right])

        bridge.send(page)
      }
    )

  }
)
