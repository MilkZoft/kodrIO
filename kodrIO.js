var kodrIO = {};
kodrIO.root = require('path').dirname(require.main.filename);
kodrIO.package = require(kodrIO.root+"/package.json");
require("./modules/core/utilities")(kodrIO);
require("./modules/core/core")(kodrIO);

// Initialize kodrIO
kodrIO.core.initialize();