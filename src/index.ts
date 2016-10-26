function tracelog(sth, expect) { // trace is enabled if expect is not undefined
    if (expect != null) {
        try {
            if (!compare2Objects(sth, expect)) {
                throw new Error(sth);
            } else {
                return true;
            }
        } catch (e) {
            console.log(e.stack);
            return false;
        }
    } else {
        console.log(sth);
    }
}
export default tracelog
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
    if(x instanceof Array && y instanceof Array){
        if(x.length === 0 && y.length > 0){
            console.warn('array content not specified', x, y)
            return true;
        }else{
            for(var i = 0; i < Math.min(x.length, y.length); i++){
                if(!compare2Objects(x[i],y[i])){
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
