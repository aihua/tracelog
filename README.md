[![Build Status](https://travis-ci.org/fex-team/tracelog.svg?branch=master)](https://travis-ci.org/fex-team/tracelog)
[![Coverage Status](https://coveralls.io/repos/fex-team/tracelog/badge.png)](https://coveralls.io/r/fex-team/tracelog)

Util functions for debug and trace; can do type checking for backend mocking check for fast iteration.

In strict mode, one cannot use arguments.caller so it is hard to trace bugs.
This library utilizes error stack to print full debug info when necessary.

```
e.g.
a = ['fd']
tracelog(a , [1]) if not the same type it will print tracelog information
["fd"] expected: [1] Context.<anonymous>(index.spec.js:24:26) << callFn(runnable.js:250:21) 
tracelog(a) print nothing. (use console.log in this case if you want to print it anyway)
```

note that variable keys cannot be traced.

# useage

```
// @ depth: trace depth
// @ color: console log color
// @ fullprint: trace full information
// @ disable: disable log
// @ callback(logstr): for outer logger, write to file etc
opt = { depth: 3, color: 'yellow', fullprint: false, disable: false, callback: undefined }
var tracelog = require('../lib/index.js').default(opt); 

import trace from 'tracelog';  //this might warn about type info in vscode
tracelog = trace();

var tracelog = require('../lib/index.js').default(); 
var assert = require("chai").assert;
describe('test simple', function () {
    it('number', function () {
        assert.deepEqual(tracelog(1, 0), true);
    });
    it('string', function () {
        assert.deepEqual(tracelog('abc', ''), true);
    });
    it('array1', function () {
        assert.deepEqual(tracelog([1, 2, 3], [1, 2]), true);
    });
    it('array2', function () {
        assert.deepEqual(tracelog([1, 2, 3], []), true);
    });
    it('array3', function () {
        assert.deepEqual(tracelog([], []), true);
    });
    it('array4', function () {
        assert.deepEqual(tracelog([], [1]), true);
    });
    it('array5', function () {
        assert.deepEqual(tracelog(['fd'], [1]), false);
    });
    it('array6', function () {
        assert.deepEqual(tracelog([{ a: 1 }], [{ b: 1 }]), false);
    });


    it('different object1', function () {
        assert.deepEqual(tracelog(
            {
                errno: 0,
                errmsg: '',
                data: [{ a: 1, b: 2, c: '' }]
            },
            {
                errno: 209,
                errmsg: 'not true',
                data: [[]]
            }), false);
    });
    it('different object2', function () {
        assert.deepEqual(tracelog(
            { 
                    '25 (forum_id)': {
                        forum_id: 258,
                        rank: 0
                    } 
            },
            {
                    
                    '258': { 
                        forum_id: 258, 
                        rank: 0 
                    },
                
            }), false);
    });
    
    it('similar object', function () {
        assert.deepEqual(tracelog(
            {
                errno: 0,
                errmsg: '',
                data: {
                    a: 1, b: 2, c: '', d: [], e: {
                        a: 1,
                        b: 2,
                        c: function () { },
                        d: ''
                    }
                }
            },
            {
                errno: 209,
                errmsg: 'not true',
                data: {
                    a: 13, b: 322, c: 'fsaf', d: [12], e: {
                        a: 12,
                        b: 0,
                        c: function () { return false; },
                        d: '323'
                    }
                }
            }), true);
    });
})
```