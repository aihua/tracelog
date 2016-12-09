/// <reference path="../node_modules/@types/colors/index.d.ts" />
import * as colors from 'colors';
import * as Mock from 'mockjs';
export namespace tracelog {
    export function print(o) {
        function handleStr(o) {
            return typeof o === 'string' ? `"${o}"` : o;
        }
        if (o === null) {
            return "null,";
        }
        let str = '';
        if (typeof o !== 'object') {
            str += handleStr(o);
        } else if (o instanceof RegExp) {
            str += o;
        } else if (o instanceof Array) {
            str += '[';
            for (let i of o) {
                str += print(i);
            }
            str += ']';
        } else {
            str += '{';
            for (let i in o) {
                str += (typeof (i) === 'string' ? `"${i}"` : i) + ':' + print(o[i]);
            }
            return str + '},';
        }
        return str + ',';
    }

    function extract(str) {
        try {
            let tmpstr = str.match(/at ([^ ]+) \((.*)\)/);
            let list = tmpstr[2].split('/');
            return tmpstr[1] + '(' + list[list.length - 1] + ')';
        } catch (e) {
            try {
                str = str.match(/at ([^\n]+)/);
                return str[1];
            } catch (e2) {
                return e2.stack;
            }
        }
    }
    // @ depth: trace depth
    // @ color: console log color
    // @ printfullstack: trace full information
    // @ disable: disable log
    // @ callback(logstr): for outer logger, write to file etc
    // @ printJSON: use JSON.stringify for logging
    // @ silent: do not print
    // customValid(sth, expect): a customary validation function
    // return true if sth is expected as expect.
    export function tracelog(opt) {
        let defaultopt = {
            depth: 3,
            color: 'yellow',
            printfullstack: false,
            disable: false,
            useMockjs: false,
            callback: undefined,
            printJSON: false,
            customValid: undefined,
            silent: false;
        };
        if (opt == null) {
            opt = defaultopt;
        } else {
            for (let i in defaultopt) {
                if (opt[i] == null) {
                    opt[i] = defaultopt[i];
                }
            };
        }
        let stringify = print;
        if (opt.printJSON) {
            stringify = JSON.stringify;
        }
        // @ sth real data
        // @ expect expected form
        // @ tmpopt local settings, can override opt
        return (sth, expect, tmpopt) => { // trace is enabled if expect is not undefined
            let options = (attr) => {
                return (tmpopt && attr in tmpopt) ? tmpopt[attr] : opt[attr];
            };
            if (options('disable')) { return; }
            let color = (str) => {
                return colors ? colors[opt.color](str) : str;
            };

            if (expect == null) { return; }

            let compare2Objects = checkIfSame;
            if (options('useMockjs')) {
                compare2Objects = () => {
                    [sth, expect] = [expect, sth];
                    return Mock.valid(sth, expect).length === 0;
                };
            } else if (options('customValid')) {
                compare2Objects = options('customValid');
            }
            try {
                if (!compare2Objects(sth, expect)) {
                    throw new Error(sth);
                } else {
                    return true;
                }
            } catch (e) {
                if (options('printfullstack')) {
                    if (!options('silient')) {
                        console.log(stringify(sth), 'expected:', stringify(expect), color(e.stack));
                    }
                    if (options('callback') != null) {
                        options('callback')(e.stack);
                    }
                    return false;
                }
                let errStr = e.stack.split('\n').slice(1);
                let arr = errStr.slice(1, options('depth'));
                if (!options('silient')) {
                    console.log(stringify(sth), 'expected:', stringify(expect), color(arr.map(extract).join(' << ')));
                }
                if (options('callback') != null) {
                    options('callback')([stringify(sth), 'expected:', stringify(expect),
                    arr.map(extract).join(' << ')].join(' '));
                }
                return false;
            }
        };
    }
    function checkIfSame(x, y) {
        let p;

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
        if ((typeof x === 'string' && y instanceof RegExp)) {

            return y.test(x);
        }
        if (x instanceof Array && y instanceof Array) {
            if (x.length === 0 && y.length > 0) {
                console.log(colors.cyan('array content not specified'), x, y);
                return true;
            } else {
                for (var i = 0; i < Math.min(x.length, y.length); i++) {
                    if (!checkIfSame(x[i], y[i])) {
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
            } else if (typeof y[p] !== typeof x[p]) {
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
}
