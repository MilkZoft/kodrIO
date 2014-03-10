module.exports = function(kodrIO){
    var pluginManager = {
            pluginDir: kodrIO.root+"/plugins/",
            pluginLocations: []
        },
        fs = require("fs"),
        npm = require("npm"),
        debug = require('debug')('pluginManager'),
        exec = require('child_process').exec;

    pluginManager.initialize = function(){
        kodrIO.utils.consoleOutput("Starting PluginManager...");
        this.loadPlugins();
        for(var i in this.pluginLocations){
            this.registerPlugin(this.pluginDir+this.pluginLocations[i]);
        }
    }

    pluginManager.loadPlugins = function(){
        kodrIO.utils.consoleOutput("Looking for plugins in '"+this.pluginDir+"'...");
        if(!fs.existsSync(this.pluginDir)){
            kodrIO.utils.consoleOutput("ERROR: No plugin dir found '"+this.pluginDir+"'");
            return false;
        }
        this.pluginLocations = fs.readdirSync(this.pluginDir);
        kodrIO.utils.consoleOutput("Found "+this.pluginLocations.length+" Plugin(s)!");
    }

    pluginManager.registerPlugin = function(pluginLocation){
        if(!fs.existsSync(pluginLocation+"/package.json")){
            kodrIO.utils.consoleOutput("ERROR: No package.json found in '"+pluginLocation+"'");
            return false;
        }
        var pluginInfo = require(pluginLocation+"/package.json");
        if (pluginInfo.config === undefined) pluginInfo.config = { enabled: true };
        if (pluginInfo.config.enabled === undefined) pluginInfo.config.enabled = true;
        if(!pluginInfo.config.enabled){
            kodrIO.utils.consoleOutput("skipping "+pluginInfo.name);
            return false;
        }
        kodrIO.utils.consoleOutput("registering "+pluginInfo.name);
        var plugin = require(pluginLocation+"/")(kodrIO);
        if(plugin.initialize === undefined){
            kodrIO.utils.consoleOutput("ERROR: Plugin '"+pluginInfo.name+"' does not have an 'initialize' method");
            return false;
        }
        kodrIO.plugins[pluginInfo.name] = {};
        if(plugin.public !== undefined){
            kodrIO.plugins[pluginInfo.name] = plugin.public;
        }
        var finishedNPM = function(){
            kodrIO.utils.consoleOutput("initializing "+pluginInfo.name);
            plugin.initialize();
            for(var i in plugin){
                if(i.indexOf("_pages") !== -1){
                    kodrIO.plugins[pluginInfo.name][i] = plugin[i];
                    kodrIO.ui.registerPage(i, pluginInfo.name, pluginLocation, kodrIO.plugins[pluginInfo.name]);
                }
                if(i.indexOf("_widget") !== -1){
                    kodrIO.plugins[pluginInfo.name][i] = plugin[i];
                    kodrIO.ui.registerWidget(i, pluginInfo.name, pluginLocation);
                }
                if(i.indexOf("_configuration") !== -1){
                    if(plugin._updateConfiguration === undefined){
                        throw new Error("ERROR: Plugin '"+pluginInfo.name+"' does not have a '_updateConfiguration' method but has '_configuration'");
                    }else{
                        kodrIO.plugins[pluginInfo.name][i] = plugin[i];
                        kodrIO.plugins[pluginInfo.name]["_updateConfiguration"] = plugin["_updateConfiguration"];
                        kodrIO.plugins[pluginInfo.name]["package"] = pluginInfo;
                        kodrIO.ui.registerConfiguration(pluginInfo.name, kodrIO.plugins[pluginInfo.name]);
                    }
                }
            }
            kodrIO.eventManager.triggerEvent("plugin_registered", pluginInfo);
        }
        exec("cd "+pluginLocation+"; npm install", finishedNPM);
    }

    kodrIO.pluginManager = pluginManager;
    kodrIO.plugins = {};
};