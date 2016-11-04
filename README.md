[![Build Status](https://travis-ci.org/fex-team/tracelog.svg?branch=master)](https://travis-ci.org/fex-team/tracelog?branch=master)
[![Coverage Status][cover-img]][cover-url]
[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url]

# Introduction

Toolkit for logging debugging and tracing; can do type checking for backend mocking check for fast iteration.

In strict mode, one cannot use arguments.caller so it is hard to trace bugs.
This library utilizes error stack to print full debug info when necessary.

```Javascript
e.g.
a = ['fd']
tracelog(a , [1]) if not the same type it will print tracelog information
["fd"] expected: [1] Context.<anonymous>(index.spec.js:24:26) << callFn(runnable.js:250:21) 
tracelog(a) simply print nothing. (use console.log in this case if you want to print it anyway)
```

note that variable keys can be traced with RegExp.

# Useage


``` Javascript
// @ depth: trace depth
// @ color: console log color
// @ fullprint: trace full information
// @ disable: disable log
// @ callback(logstr): for outer logger, write to file etc
// @ printJSON: use JSON.stringify for logging, which may not print RegExp etc.
// customValid(sth, expect): a customary validation function
// return true if sth is expected as expect

default options:
depth: 3,
color: 'yellow',
printfullstack: false,
disable: false,
useMockjs: false,
callback: undefined,
printJSON: false,
customValid: undefined,
//es 6
import tracelog from 'tracelog';
// or import {tracelog} from 'tracelog';
var tracelog = tracelog(opt);
//es 5
var tracelog = require('../lib/index.js').tracelog();



describe('test mockjs', function () {
    var tracelog = require('../lib/index.js').tracelog({depth: 3,useMockjs: true});
    it('number', function () {
        assert.deepEqual(tracelog({number:2}, {'number|1-100':1}), true);
    });
    it('string', function () {
        assert.deepEqual(tracelog( {str:'abc'}, {'str|1': 'abc'}), true);
    });
    it('regex', function(){
        assert.deepEqual(tracelog({reg:'ab'}, {'reg':/^ab$/}), true);
    })
    it('array1', function () {
        assert.deepEqual(tracelog({arr:[1, 2, 3]}, {'arr|1':[1,2,3]}), true);
    });
    it('array5', function () {
        assert.deepEqual(tracelog(['fd'], {'arr|1':[1,2,3]}), false);
    });
    // !! this is different from withou mockjs,
    // key is different and mockjs do not check for that
    it('array6', function () {
        assert.deepEqual(tracelog({arr:[{ a: 1 }]}, 
        {'arr|1' : [{ 'b|1': 1 }]  } ), true);
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
    it('same object1', function () {
        assert.deepEqual(tracelog(
            {
                errno: 0,
                errmsg: '',
                data: [{ a: 1, b: 2, c: '' }]
            },
            {
                'errno|0-100': 1,
                'errmsg|0': 'not true',
                'data|1': [{'a|1':1,'b|1-100':1, 'c|1-100':''}]
            }), true);
    });
    // cannot check for variable key
    // it('different object2', function () {
    //     assert.deepEqual(tracelog(
    //         { 
    //                 '25 (forum_id)': {
    //                     forum_id: 258,
    //                     rank: 0
    //                 } 
    //         },
    //         {
                    
    //                 '258': { 
    //                     forum_id: 258, 
    //                     rank: 0 
    //                 },
                
    //         }), false);
    // });
    
     
    it('similar object regex', function () {
        assert.deepEqual(tracelog(
            {
                data: {
                    a: 1, b: 2, c: 'apple 10'
                }
            },
            {
                data: {
                    a: 1, b: 2, 'c|1': /^\w+ \d+$/
                }
            }), true);
    });
})




describe('test simple', function () {
    var tracelog = require('../lib/index.js').tracelog();
    it('number', function () {
        assert.deepEqual(tracelog(1, 0), true);
    });
    it('string', function () {
        assert.deepEqual(tracelog('abc', ''), true);
    });
    it('regex', function(){
        assert.deepEqual(tracelog('ab', /^ab$/), true);
    })
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
    it('similar object regex', function () {
        assert.deepEqual(tracelog(
            {
                data: {
                    a: 1, b: 2, c: 'apple 10'
                }
            },
            {
                data: {
                    a: 13, b: 322, c: /^\w+ \d+$/
                }
            }), true);
    });
})


```
# Links
- [Changelog](https://github.com/fex-team/tracelog/blob/master/ChangeLog.md)
- [Mockjs](https://github.com/nuysoft/Mock)

[npm-image]: https://img.shields.io/npm/v/tracelog.svg
[npm-url]: https://www.npmjs.com/package/tracelog
[downloads-image]: https://img.shields.io/npm/dm/tracelog.svg
[cover-url]: https://coveralls.io/repos/github/fex-team/tracelog/badge.svg?branch=master
[cover-img]: http://img.shields.io/coveralls/fex-team/tracelog/master.svg