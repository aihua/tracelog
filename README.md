
Util functions for debug and trace; can do type checking for backend mocking check for fast iteration.

In strict mode, one cannot use arguments.caller so it is hard to trace bugs.
This library utilizes error stack to print full debug info when necessary.

e.g.
a = 1
tracelog(a, '') if not the same type it will print tracelog information

tracelog(a) simply print 1.


```
var tracelog = require('./index');
var assert = require("chai").assert;
describe('test simple', function () {
    it('number', function () {
        assert.deepEqual(tracelog(1, 0), true);
    });
    it('string', function () {
        assert.deepEqual(tracelog('abc', ''), true);
    });
    it('array1', function(){
        assert.deepEqual(tracelog([1,2,3],[1,2]), true);
    });
    it('array2', function(){
        assert.deepEqual(tracelog([1,2,3],[]), true);
    });
    it('array3', function(){
        assert.deepEqual(tracelog([],[]), true);
    });
    it('array4', function(){
        assert.deepEqual(tracelog([],[1]), true);
    });
    it('array5', function(){
        assert.deepEqual(tracelog(['fd'],[1]), false);
    });
    it('array6', function(){
        assert.deepEqual(tracelog([{a:1}],[{b:1}]), false);
    });

    it('different object', function () {
        assert.deepEqual(tracelog(
            {
                errno: 0,
                errmsg: '',
                data: [{ a: 1, b: 2, c: '' }]
            },
            {
                errno:209,
                errmsg:'not true',
                data:[[]]
            }), false);
    });
    it('similar object', function () {
        assert.deepEqual(tracelog(
            {
                errno: 0,
                errmsg: '',
                data: { a: 1, b: 2, c: '', d:[],e:{
                    a:1,
                    b:2,
                    c: function(){},
                    d:''
                } }
            },
            {
                errno:209,
                errmsg:'not true',
                data:{ a: 13, b: 322, c: 'fsaf',d:[12],e:{
                    a:12,
                    b:0,
                    c:function(){return false;},
                    d:'323'
                } }
            }), true);
    });
})
```