"use strict";
var colors = require('colors');
var Mock = require('mockjs');
var tracelog;
(function (tracelog_1) {
    function print(o) {
        function handleStr(o) {
            return typeof o === 'string' ? "\"" + o + "\"" : o;
        }
        if (o === null) {
            return "null,";
        }
        var str = '';
        if (typeof o !== 'object') {
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
                str += (typeof (i) === 'string' ? "\"" + i + "\"" : i) + ':' + print(o[i]);
            }
            return str + '},';
        }
        return str + ',';
    }
    tracelog_1.print = print;
    function extract(str) {
        try {
            var tmpstr = str.match(/at ([^ ]+) \((.*)\)/);
            var list = tmpstr[2].split('/');
            return tmpstr[1] + '(' + list[list.length - 1] + ')';
        }
        catch (e) {
            try {
                str = str.match(/at ([^\n]+)/);
                return str[1];
            }
            catch (e2) {
                return e2.stack;
            }
        }
    }
    function tracelog(opt) {
        var defaultopt = {
            depth: 3,
            color: 'yellow',
            printfullstack: false,
            disable: false,
            useMockjs: false,
            callback: undefined,
            printJSON: false,
            customValid: undefined
        };
        if (opt == null) {
            opt = defaultopt;
        }
        else {
            for (var i in defaultopt) {
                if (opt[i] == null) {
                    opt[i] = defaultopt[i];
                }
            }
            ;
        }
        var stringify = print;
        if (opt.printJSON) {
            stringify = JSON.stringify;
        }
        return function (sth, expect, tmpopt) {
            var options = function (attr) {
                return (tmpopt && attr in tmpopt) ? tmpopt[attr] : opt[attr];
            };
            if (options('disable')) {
                return;
            }
            var color = function (str) {
                return colors ? colors[opt.color](str) : str;
            };
            if (expect == null) {
                return;
            }
            var compare2Objects = checkIfSame;
            if (options('useMockjs')) {
                compare2Objects = function () {
                    _a = [expect, sth], sth = _a[0], expect = _a[1];
                    return Mock.valid(sth, expect).length === 0;
                    var _a;
                };
            }
            else if (options('customValid')) {
                compare2Objects = options('customValid');
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
                if (options('callback') != null) {
                    options('callback')([stringify(sth), 'expected:', stringify(expect),
                        arr.map(extract).join(' << ')].join(' '));
                }
                return false;
            }
        };
    }
    tracelog_1.tracelog = tracelog;
    function checkIfSame(x, y) {
        var p;
        if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
            return true;
        }
        if (x === y) {
            return true;
        }
        if ((typeof x === 'function' && typeof y === 'function') ||
            (x instanceof Date && y instanceof Date) ||
            (x instanceof String && y instanceof String) ||
            (x instanceof Number && y instanceof Number) ||
            (typeof (x) !== 'object' && typeof (x) === typeof (y))) {
            return true;
        }
        if ((typeof x === 'string' && y instanceof RegExp)) {
            return y.test(x);
        }
        if (x instanceof Array && y instanceof Array) {
            if (x.length === 0 && y.length > 0) {
                console.log(colors.cyan('array content not specified'), x, y);
                return true;
            }
            else {
                for (var i = 0; i < Math.min(x.length, y.length); i++) {
                    if (!checkIfSame(x[i], y[i])) {
                        return false;
                    }
                }
            }
            return true;
        }
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
        for (p in y) {
            if (!checkIfSame(y.hasOwnProperty(p), x.hasOwnProperty(p))) {
                return false;
            }
            else if (typeof y[p] !== typeof x[p]) {
                if (!(y[p] instanceof RegExp && typeof x[p] == 'string')) {
                    return false;
                }
            }
        }
        for (p in x) {
            if (!checkIfSame(y.hasOwnProperty(p), x.hasOwnProperty(p))) {
                return false;
            }
            else if (typeof y[p] !== typeof x[p]) {
                if (!(y[p] instanceof RegExp && typeof x[p] === 'string')) {
                    return false;
                }
            }
            if (!checkIfSame(x[p], y[p])) {
                return false;
            }
        }
        return true;
    }
})(tracelog = exports.tracelog || (exports.tracelog = {}));
//# sourceMappingURL=tracelog.js.map