module.exports = function(kodrIO){
    var eventManager = {
            handlers: {},
            lowestPriority: 99,
            currentPriority: 0,
            currentEvent: 0
        },
        debug = require('debug')('eventManager'),
        q = require("q");

    eventManager.initialize = function(){
        kodrIO.utils.consoleOutput("Starting EventManager...");
    }

    eventManager.registerHandler = function(event, handler, priority){
        if(this.handlers[event] === undefined){
            this.setupEventListner(event);
        }
        if(priority > this.lowestPriority || this.lowestPriority < 0) throw new Error("Priority must be 0-99");
        if(priority === undefined) priority = this.lowestPriority;
        this.handlers[event][priority].push(handler);
    }

    eventManager.setupEventListner = function(event){
        this.handlers[event] = [];
        while(this.handlers[event].length != (this.lowestPriority + 1)){
            this.handlers[event][this.handlers[event].length] = [];
        }
    }

    eventManager.triggerEvent = function(event){
        var deferred = q.defer();
        eventManager.triggerManager.start(deferred, event, arguments);

        return deferred.promise;
    }

    eventManager.triggerManager = {
        start: function(deferred, event, args){
            tracking = {};
            tracking.return = [];
            tracking.currentPriority = 0;
            tracking.currentEvent = 0;
            if(eventManager.handlers[event] === undefined) return deferred.resolve({});
            this.runNext(deferred, event, args, tracking);
        },
        runNext: function(deferred, event, args, tracking){
            var runNext = true;
            if(eventManager.handlers[event][tracking.currentPriority][tracking.currentEvent] !== undefined){
                var value = eventManager.handlers[event][tracking.currentPriority][tracking.currentEvent].apply(null, Array.prototype.slice.call(args, 1));
                if(value !== undefined){
                    if(value.toString() === "[object Promise]"){
                        // A promise was returned!
                        runNext = false;
                        value.then(function(data){
                            tracking.return.push({
                                event: event,
                                priority: tracking.currentPriority,
                                eventID: tracking.currentEvent,
                                data: data
                            });
                            eventManager.triggerManager.determineNext(deferred, event, args, tracking);
                        }).fail(kodrIO.utils.handlePromiseError);
                    }
                }
                tracking.currentEvent++;
            }else{
                tracking.currentPriority++;
                tracking.currentEvent = 0;
            }
            if(runNext){
                this.determineNext(deferred, event, args, tracking);
            }
        },
        determineNext: function(deferred, event, args, tracking){
            //if (event!=='websocket_output') { console.log(eventManager.handlers[event].length + " > "); console.log(tracking); }
            if(eventManager.handlers[event].length === tracking.currentPriority){
                //if (event!=='websocket_output') console.log(event + " finished");
                this.done(deferred, event, args, tracking);
            }else{
                //if (event!=='websocket_output') console.log(event + " runNext");
                this.runNext(deferred, event, args, tracking);
            }
        },
        done: function(deferred, event, args, tracking){
            deferred.resolve(tracking.return);
            args[0] += "_finished";
            eventManager.triggerEvent.apply(null, args);
        }
    }

    kodrIO.eventManager = eventManager;
};