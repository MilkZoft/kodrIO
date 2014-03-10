module.exports = function(kodrIO){
    var utils = {},
        path = require('path'),
        fs = require("fs");

    utils.console = {};

    utils.handlePromiseError = function(error){
        this.console.logLine();
        console.log(error.stack)
        this.console.logLine();
    };

    utils.console.logLine = function(){
        var line = "";
        if (!process.stdout.isTTY) {
            process.stdout.columns = 70;
        }
        while(line.length < process.stdout.columns){
            line += "#";
        }
        console.log(line);
    }

    utils.console.logLeft = function(whatToLog, outSideEdge){
        var emptyNeeded = (process.stdout.columns - (whatToLog.length + 1));

        if(outSideEdge) emptyNeeded += 2;
        var line = "";
        while(line.length < emptyNeeded){
            line += " ";
        }
        var output = whatToLog+line;
        if(outSideEdge) output = "# "+output+"#"
        console.log(output);
    }

    utils.console.logCenter = function(whatToLog, outSideEdge){
        if(outSideEdge){
            var emptyNeeded = ((process.stdout.columns - (whatToLog.length + 2)) / 2);
        }else{
            var emptyNeeded = ((process.stdout.columns - whatToLog.length) / 2);
        }
        var line = "";
        while(line.length < emptyNeeded){
            line += " ";
        }
        var output = line+whatToLog+line;
        if((output.length + 2) > process.stdout.columns){
            var output = line+whatToLog;
            line = line.substring(0, line.length - 1);
            output += line;
        }
        if(outSideEdge){
            output = "#"+output+"#";
        }
        console.log(output);
    }

    utils.consoleOutput = function(whatToOutput, textAlign, outSideEdge){
        if(whatToOutput === "line") return this.console.logLine();
        if(textAlign === undefined) textAlign = "Left";
        if(outSideEdge === undefined) outSideEdge = false;
        this.console["log"+textAlign](whatToOutput, outSideEdge);
    }

    utils.mkdir = function(dir) {
        if (path.relative(kodrIO.root, dir).substring(0,2) == ".." ) {
            throw new RangeError("Directory out of scope. '" + dir + "'");
            return false;
        }
        // TODO: Check the directory is within our scope.
        if ( !fs.existsSync(dir) ) {
            fs.mkdirSync(dir);
        }
    }

    utils.deleteFolderRecursive = function(dir) {
        if (path.relative(kodrIO.root, dir).substring(0,2) == ".." ) {
            throw new RangeError("Directory out of scope. '" + dir + "'");
            return false;
        }
        if( fs.existsSync(dir) ) {
            fs.readdirSync(dir).forEach(function(file,index) {
                var curDir = dir + "/" + file;
                if(fs.statSync(curDir).isDirectory()) { // recurse
                    kodrIO.utils.deleteFolderRecursive(curDir);
                } else { // delete file
                    fs.unlinkSync(curDir);
                }
            });
            fs.rmdirSync(dir);
        }
    }

    utils.customSort = function(array, field, direction) {
        if(direction === undefined) direction = "desc";
        array.sort(function(a, b) {
            if (a[field] === undefined || b[field] === undefined)
                throw new Error('Invalid field to sort on');
            if (a[field] > b[field])
                return -1;
            if (a[field] < b[field])
                return 1;
            return 0;
        });
        if(direction === "asc") array.reverse();
    };

    utils.epoch = function(){
        var date = new Date();
        return Math.floor(date.getTime() / 1000);
    }

    /** underscore.js functions **/
    var ArrayProto    = Array.prototype,
        nativeForEach = ArrayProto.forEach,
        nativeEvery   = ArrayProto.every;

    utils.isArray = function(obj) {
        return toString.call(obj) == '[object Array]';
    };

    utils.each = utils.forEach = function(obj, iterator, context) {
        if (obj == null) return obj;
        if (nativeForEach && obj.forEach === nativeForEach) {
            obj.forEach(iterator, context);
        } else if (obj.length === +obj.length) {
            for (var i = 0, length = obj.length; i < length; i++) {
                if (iterator.call(context, obj[i], i, obj) === breaker) return;
            }
        } else {
            var keys = _.keys(obj);
            for (var i = 0, length = keys.length; i < length; i++) {
                if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
            }
        }
        return obj;
    };

    utils.every = function(obj, predicate, context) {
        predicate || (predicate = _.identity);
        var result = true;
        if (obj == null) return result;
        if (nativeEvery && obj.every === nativeEvery) return obj.every(predicate, context);
        utils.each(obj, function(value, index, list) {
            if (!(result = result && predicate.call(context, value, index, list))) return breaker;
        });
        return !!result;
    };

    utils.flatten = function(input, shallow, output) {
        if (output === undefined) { output = []; }
        if (shallow && _.every(input, _.isArray)) {
            return concat.apply(output, input);
        }
        utils.each(input, function(value) {
            if (utils.isArray(value)) {
                shallow ? push.apply(output, value) : utils.flatten(value, shallow, output);
            } else {
                output.push(value);
            }
        });
        return output;
    };
    /** end underscore.js functions **/

    kodrIO.utils = utils;
};