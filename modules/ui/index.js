module.exports = function(kodrIO){
    var ui = {
            widgets: [],
            configurations: [],
            pages: [],
            pageData: [],
            io: {}
        },
        ansiToHtml= require('ansi-to-html'),
        debug = require('debug')('ui'),
        passport = require('passport'),
        convert = new ansiToHtml({newline: true});

    ui.populatePageData = function(){
        ui.pageData = [];
        for(var i in ui.pages){
            var pageInfo = ui.pages[i].pluginPublicReference[ui.pages[i].methodName]();
            ui.pageData = ui.pageData.concat(pageInfo);
        }
    }

    ui.initialize = function(){
        var express = require('express');

        var app = express();
        ui.app = app;
        app.use(express.json());
        app.use(express.urlencoded());
        app.set('view engine', 'jade');
        app.set('views', __dirname + '/views');
        app.use(express.static(__dirname + '/public'));
        app.use(express.cookieParser());
        app.use(express.session({ secret: 'keyboard cat' }));
        app.use(express.methodOverride());

        app.use(function(req, res, next){
            // Allow the jade templates access to kodrIO
            res.locals.kodrIO = kodrIO;
            // Work on navigation from pages
            ui.populatePageData();
            res.locals.navigation = [];
            for(i in ui.pageData){
                if(ui.pageData[i].showInNav(req.session)){
                    res.locals.navigation.push({
                        title: ui.pageData[i].title,
                        url: ui.pageData[i].url,
                        icon: ui.pageData[i].icon
                    })
                }
            }
            next();
        });

        // Have to load this before app.router, otherwise, you cannot properly use passport middleware.
        passport.serializeUser(function(user, done) {
          done(null, user);
        });

        passport.deserializeUser(function(user, done) {
          done(null, user);
        });

        app.use(passport.initialize());
        app.use(passport.session());

        app.locals.moment = require("moment");

        app.use(app.router);

        require("./routes.js")(app, kodrIO, ui);

        var server = app.listen(3000);
        ui.io = require('socket.io').listen(server, { log: false });
        kodrIO.utils.consoleOutput("UI on Port 3000");
        kodrIO.eventManager.registerHandler("websocket_output", ui.websocket_output,10);
    }

    ui.registerWidget = function(widgetRaw, pluginName, pluginLocation){
        widgetRaw = widgetRaw.split("_");
        var page = widgetRaw[2];
        if(this.widgets[page] === undefined){
            this.widgets[page] = {};
        }
        var widgetKey = widgetRaw[3];
        if(this.widgets[page][widgetKey] !== undefined){
            throw new Error("Another plugin is already using widgetKey '"+widgetKey+"'");
        }
        this.widgets[page][widgetKey] = {pluginName: pluginName, pluginLocation: pluginLocation};
    }

    ui.registerPage = function(pageMethodName, pluginName, pluginLocation, pluginPublicReference){
        var pageMethodNameSplit = pageMethodName.split("_");
        var pageName = pageMethodNameSplit[2];
        if (pageName === undefined) pageName = pluginName; // Account for each plugin having plugin._pages
        if(this.pages[pageName] !== undefined){
            throw new Error("Another plugin is already using page name '"+pageName+"'");
        }
        this.pages[pageName] = {
            methodName: pageMethodName,
            pluginName: pluginName,
            pluginLocation: pluginLocation,
            pluginPublicReference: pluginPublicReference
        };

        var pageData = pluginPublicReference[pageMethodName]();
        for(var i in pageData){
            pageData[i].middlewareHandler = (pageData[i].middlewareHandler !== undefined ? pageData[i].middlewareHandler : function(req, res, next) { return next(); } );   // Kody will hate this.
            if(pageData[i].routeHandler === undefined){
                throw new Error("Route handler for '"+pageData[i].title+"' page not defined!");
            }
            //ui.app[pageData[i].method](pageData[i].url, pageData[i].routeHandler);
            ui.app[pageData[i].method](pageData[i].url, pageData[i].middlewareHandler, pageData[i].routeHandler);
        }
    }

    ui.registerConfiguration = function(pluginName, pluginPublicReference){
        this.configurations.push({pluginName: pluginName, pluginPublicReference: pluginPublicReference});
    }

    ui.websocket_output = function(data) {
        // debug(data);
        ui.io.sockets.emit('data', convert.toHtml(data, true));
    };

    kodrIO.ui = ui;
};
