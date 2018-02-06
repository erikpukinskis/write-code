var WebSite = require("web-site")
var childProcess = require("child_process")
var writeCode = require("./")

var site = new WebSite()

writeCode(site)

site.start(1413)

childProcess.exec("open http://localhost:1413")
