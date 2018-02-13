var WebSite = require("web-site")
var childProcess = require("child_process")
var writeCode = require("./")
var BrowserBridge = require("browser-bridge")

var site = new WebSite()

writeCode.prepareSite(site)

site.addRoute(
  "get",
  "/",
  function(request, response) {
    var bridge = new BrowserBridge()
      .forResponse(response)

    writeCode(bridge, "demo")
  }
)

site.start(1413)

// childProcess.exec("open http://localhost:1413")
