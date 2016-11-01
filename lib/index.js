"use strict";
/// <reference path="../node_modules/@types/colors/index.d.ts" />
/// <reference path="../typings/modules/lodash/index.d.ts" />
var colors = require('colors');
var tracelog;
(function (tracelog) {
    function print(o) {
        function handleStr(o) {
            return typeof o == 'string' ? "\"" + o + "\"" : o;
        }
        if (o === null) {
            return "null,";
        }
        var str = '';
        if (typeof o != 'object') {
            str += handleStr(o);
        }
        else if (o instanceof RegExp) {
            str += o;
        }
        else if (o instanceof Array) {
            str += '[';
            for (var _i = 0, o_1 = o; _i < o_1.length; _i++) {
                var i = o_1[_i];
                str += print(i);
            }
            str += ']';
        }
        else {
            str += '{';
            for (var i in o) {
                str += (typeof (i) == 'string' ? "\"" + i + "\"" : i) + ':' + print(o[i]);
            }
            return str + '},';
        }
        return str + ',';
    }
    tracelog.print = print;
    function extract(str) {
        try {
            str = str.match(/at ([^ ]+) \((.*)\)/);
            var list = str[2].split('/');
            return str[1] + '(' + list[list.length - 1] + ')';
        }
        catch (e) {
            return e.stack;
        }
    }
    // @ depth: trace depth
    // @ color: console log color
    // @ printfullstack: trace full information
    // @ disable: disable log
    // @ callback(logstr): for outer logger, write to file etc
    // @ printJSON: use JSON.stringify for logging
    function log(opt) {
        var defaultopt = { depth: 3, color: 'yellow', printfullstack: false, disable: false, callback: undefined, printJSON: false };
        for (var i in defaultopt) {
            if (opt[i] == null) {
                opt[i] = defaultopt[i];
            }
        }
        ;
        var stringify = print;
        if (opt['printJSON']) {
            stringify = JSON.stringify;
        }
        // @ sth real data
        // @ expect expected form
        // @ tmpopt local settings, can override opt
        return function (sth, expect, tmpopt) {
            if (opt['disable']) {
                return;
            }
            var color = function (str) {
                return colors ? colors[opt['color']](str) : str;
            };
            var options = function (attr) {
                return (tmpopt && attr in tmpopt) ? tmpopt[attr] : opt[attr];
            };
            if (expect == null) {
                return;
            }
            try {
                if (!compare2Objects(sth, expect)) {
                    throw new Error(sth);
                }
                else {
                    return true;
                }
            }
            catch (e) {
                if (options('printfullstack')) {
                    console.log(stringify(sth), 'expected:', stringify(expect), color(e.stack));
                    if (options('callback') != null) {
                        options('callback')(e.stack);
                    }
                    return false;
                }
                var errStr = e.stack.split('\n').slice(1);
                var arr = errStr.slice(1, options('depth'));
                console.log(stringify(sth), 'expected:', stringify(expect), color(arr.map(extract).join(' << ')));
                // console.log(JSON.stringify(sth), 'expected:', JSON.stringify(expect), color(arr.map(extract).join(' << ')));
                if (options('callback') != null) {
                    options('callback')([stringify(sth), 'expected:', stringify(expect), arr.map(extract).join(' << ')].join(' '));
                }
                return false;
            }
        };
    }
    tracelog.log = log;
    function compare2Objects(x, y) {
        var p;
        // remember that NaN === NaN returns false
        // and isNaN(undefined) returns true
        if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
            return true;
        }
        // Compare primitives and functions.     
        // Check if both arguments link to the same object.
        // Especially useful on the step where we compare prototypes
        if (x === y) {
            return true;
        }
        // console.log(x, y)
        // Works in case when functions are created in constructor.
        // Comparing dates is a common scenario. Another built-ins?
        // We can even handle functions passed across iframes
        if ((typeof x === 'function' && typeof y === 'function') ||
            (x instanceof Date && y instanceof Date) ||
            (x instanceof String && y instanceof String) ||
            (x instanceof Number && y instanceof Number) ||
            (typeof (x) !== 'object' && typeof (x) === typeof (y))) {
            return true;
        }
        if ((typeof x == 'string' && y instanceof RegExp)) {
            return y.test(x);
        }
        if (x instanceof Array && y instanceof Array) {
            if (x.length === 0 && y.length > 0) {
                console.log(colors.cyan('array content not specified'), x, y);
                return true;
            }
            else {
                for (var i = 0; i < Math.min(x.length, y.length); i++) {
                    if (!compare2Objects(x[i], y[i])) {
                        return false;
                    }
                }
            }
            return true;
        }
        // At last checking prototypes as good as we can
        if (!(x instanceof Object && y instanceof Object)) {
            return false;
        }
        if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
            return false;
        }
        if (x.constructor !== y.constructor) {
            return false;
        }
        if (x.prototype !== y.prototype) {
            return false;
        }
        // Quick checking of one object being a subset of another.
        // todo: cache the structure of arguments[0] for performance
        for (p in y) {
            if (!compare2Objects(y.hasOwnProperty(p), x.hasOwnProperty(p))) {
                return false;
            }
            else if (typeof y[p] !== typeof x[p]) {
                if (!(y[p] instanceof RegExp && typeof x[p] == 'string')) {
                    return false;
                }
            }
        }
        for (p in x) {
            if (!compare2Objects(y.hasOwnProperty(p), x.hasOwnProperty(p))) {
                return false;
            }
            else if (typeof y[p] !== typeof x[p]) {
                if (!(y[p] instanceof RegExp && typeof x[p] == 'string')) {
                    return false;
                }
            }
            if (!compare2Objects(x[p], y[p])) {
                return false;
            }
        }
        return true;
    }
})(tracelog = exports.tracelog || (exports.tracelog = {}));
