module.exports = function(kodrIO){
    var core = {};

    core.initialize = function(){
        // Say hello to everyone!
        kodrIO.utils.consoleOutput("line");
        kodrIO.utils.consoleOutput(kodrIO.package.name, "Center", true);
        kodrIO.utils.consoleOutput("v"+kodrIO.package.version, "Center", true);
        if(kodrIO.package.description !== undefined){
            kodrIO.utils.consoleOutput(kodrIO.package.description, "Center", true);
        }
        kodrIO.utils.consoleOutput("line");
        // Start the initialization process
        kodrIO.utils.consoleOutput("Initializing...");
        // Initialize the event manager
        require("./eventManager")(kodrIO);
        kodrIO.eventManager.initialize();
        // Initialize the plugin manager
        require("./pluginManager")(kodrIO);
        kodrIO.pluginManager.initialize();
        // Initialize the ui
        require("../ui/")(kodrIO);
        kodrIO.ui.initialize();

        kodrIO.eventManager.registerHandler("build_finished", function(){
            // The build steps have finished
            console.log("Build Steps Finished");
        });
    }

    kodrIO.core = core;
};