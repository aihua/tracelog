var tracelog = require('../lib/index.js').tracelog.log({depth: 3});

var assert = require("chai").assert;
describe('test simple', function () {
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