/// <reference path="../node_modules/@types/colors/index.d.ts" />
import * as colors  from 'colors';
namespace tracelogNamespace {
    function extract(str) {
        try {
            str = str.match(/at ([^ ]+) \((.*)\)/);
            let list = str[2].split('/');
            return str[1] + '(' + list[list.length - 1] + ')';
        } catch (e) {
            return e.stack;
        }
    }
    // @ depth: trace depth
    // @ color: console log color
    // @ fullprint: trace full information
    // @ disable: disable log
    // @ callback(logstr): for outer logger, write to file etc
    export function tracelog(opt = { depth: 3, color: 'yellow', fullprint: false, disable: false, callback: undefined }) {
        // @ sth real data
        // @ expect expected form
        // @ tmpopt local settings, can override opt
        return function (sth, expect, tmpopt) { // trace is enabled if expect is not undefined
            if (opt['disable']) { return; }
            let color = (str) => {
                return colors ? colors[opt['color']](str) : str;
            }
            let options = (attr) => {
                return (tmpopt && attr in tmpopt) ? tmpopt[attr] : opt[attr];
            }
            if (expect == null) { return; }
            try {
                if (!compare2Objects(sth, expect)) {
                    throw new Error(sth);
                } else {
                    return true;
                }
            } catch (e) {
                if (options('fullprint')) {
                    console.log(JSON.stringify(sth), 'expected:', JSON.stringify(expect), color(e.stack));
                    if(options('callback') != null){
                        options('callback')(e.stack);
                    }
                    return false;
                }
                let errStr = e.stack.split('\n').slice(1);
                let arr = errStr.slice(1, options('depth'));
                console.log(JSON.stringify(sth), 'expected:', JSON.stringify(expect), color(arr.map(extract).join(' << ')));
                if(options('callback') != null){
                    options('callback')([JSON.stringify(sth), 'expected:', JSON.stringify(expect), arr.map(extract).join(' << ')].join(' '));
                }
                return false;
            }
        }
    }



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
            (x instanceof RegExp && y instanceof RegExp) ||
            (x instanceof String && y instanceof String) ||
            (x instanceof Number && y instanceof Number) ||
            (typeof (x) !== 'object' && typeof (x) === typeof (y))) {
            return true;
        }
        if (x instanceof Array && y instanceof Array) {
            if (x.length === 0 && y.length > 0) {
                console.warn('array content not specified', x, y)
                return true;
            } else {
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
                return false;
            }
        }
        for (p in x) {
            if (!compare2Objects(y.hasOwnProperty(p), x.hasOwnProperty(p))) {
                return false;
            }
            else if (typeof y[p] !== typeof x[p]) {
                return false;
            }


            if (!compare2Objects(x[p], y[p])) {
                return false;

            }
        }

        return true;
    }

}
export default tracelogNamespace.tracelog;