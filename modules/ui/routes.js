module.exports = function(app, kodrIO, ui){
    var fs = require("fs"),
        jade = require("jade");

    var loadWidgets = function(req, res, page){
        res.locals.widgets = ui.widgets[page];
        widgetOrder = [];
        widgetTemp = [];
        for(var widget in res.locals.widgets){
            var pluginName = res.locals.widgets[widget].pluginName;
            var pluginLocation = res.locals.widgets[widget].pluginLocation;
            var functionName = "_widget_"+page+"_"+widget
            var widgetData = kodrIO.plugins[pluginName][functionName](req.session); // Pass session and user variables to widget to allow for dynamic buildling.

            if (widgetData) {       // Widget may have returned false to not show.
                if(widgetData.priority === undefined) widgetData.priority = 99;
                if(widgetOrder[widgetData.priority] === undefined) widgetOrder[widgetData.priority] = [];
                widgetOrder[widgetData.priority].push(widget);

                if(widgetData.content.indexOf(".jade") !== -1){
                    var contents = fs.readFileSync(pluginLocation+"/views/"+widgetData.content, "utf8");
                    var locals = {};
                    if(widgetData.jadeLocals !== undefined){
                        locals = widgetData.jadeLocals;
                    }
                    delete widgetData.jadeLocals;
                    locals.widgetData = widgetData;
                    res.locals.widgets[widget].renderedContent = jade.render(contents, locals);
                }
            }
        }
        for(var priority in widgetOrder){
            for(var i in widgetOrder[priority]){
                var widgetName = widgetOrder[priority][i];
                widgetTemp[widgetName] = res.locals.widgets[widgetName];
            }
        }
        return widgetTemp;
    };

    app.get("/", function(req, res){
        res.locals.widgets = loadWidgets(req, res, "index");
        res.render("index", { session: req.session } );
    })

    app.get("/login", function(req, res){
        res.locals.widgets = loadWidgets(req, res, "login");
        res.render("login", { session: req.session } );
    })

    app.get("/configure", function(req, res){
        if(req.query.success){
            res.locals.hasSaved = true;
        }
        res.locals.configurations = [];
        for(var i in ui.configurations){
            res.locals.configurations.push({
                configurationID: i,
                pluginName: ui.configurations[i].pluginName,
                pluginEnabled: kodrIO.plugins[ui.configurations[i].pluginName].package.config.enabled,
                pluginConfiguration: ui.configurations[i].pluginPublicReference["_configuration"]()
            });
        }
        res.render("configure");
    });

    app.post("/configure", function(req, res){

        var validateRequirements = function(i, configuration){
            var valid = true;
            var configurationRequirements = ui.configurations[i].pluginPublicReference["_configuration"]();
            for(var key in configuration){
                if(
                    (configurationRequirements[key].required !== undefined && configurationRequirements[key].required) &&
                    configuration[key] === ""
                ){
                    configurationRequirements[key].errorText = "* required";
                    valid = false;
                }
            }
            if(!valid) return configurationRequirements;
            return true;
        };

        res.locals.configurations = [];
        for(var i in ui.configurations){
            res.locals.configurations.push({
                configurationID: i,
                pluginName: ui.configurations[i].pluginName,
                pluginEnabled: kodrIO.plugins[ui.configurations[i].pluginName].package.config.enabled,
                pluginConfiguration: ui.configurations[i].pluginPublicReference["_configuration"]()
            });
        }

        var toValidate = {};
        var valid = true;
        for(var i in req.body){
            var key = i.split("_");
            if(toValidate[key[0]] === undefined) toValidate[key[0]] = {};
            toValidate[key[0]][key[1]] = req.body[i];
        }
        for(i in toValidate){
            var result = validateRequirements(i, toValidate[i]);
            if(result !== true){
                valid = false;
                res.locals.configurations[i].pluginConfiguration = result;
            }else{
                res.locals.configurations[i].pluginConfiguration = ui.configurations[i].pluginPublicReference["_configuration"]();
            }
            for(var key in toValidate[i]){
                if(res.locals.configurations[i].pluginConfiguration[key].type !== "password"){
                    res.locals.configurations[i].pluginConfiguration[key].value = toValidate[i][key];
                }
            }
        }
        if(!valid){
            res.locals.hasErrors = true;
            res.render("configure");
        }else{
            // All configs are valid - Update them!
            for(i in toValidate){
                ui.configurations[i].pluginPublicReference["_updateConfiguration"](toValidate[i]);
            }
            res.redirect("/configure?success=true");
        }
    });

    app.get("/websockets", function(req, res){
        res.render('websockets');
    });

    app.get("/configure/:state/:plugin", function(req, res){
        console.log("setting "+req.params.plugin+" to "+req.params.state);
        res.redirect("/configure");
    });
}