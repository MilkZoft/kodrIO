var kodrIO = {};
kodrIO.package = require("../package.json");
require("../modules/core/utilities")(kodrIO);
require("../modules/core/core")(kodrIO);

// Initialize kodrIO
kodrIO.core.initialize();