var print = require('../lib/index.js').print; 
var assert = require("chai").assert;
describe('test print', function () {
    it('number', function () {
        assert.deepEqual(print(1), "1,");
    });
    it('undefined', function () {
        assert.deepEqual(print(undefined), "undefined,");
    });
    it('null', function () {
        assert.deepEqual(print(null), "null,");
    });
    it('string', function () {
        assert.deepEqual(print('1'), '\"1\",');
    });
    it('array', function(){
        assert.deepEqual(print([1,2]), "[1,2,],");
    });
    it('array depth 2', function(){
        assert.deepEqual(print([1,2,[3,4]]), "[1,2,[3,4,],],");
    });
    it('function', function(){
        assert.deepEqual(print(function a(b){return 1;}), "function a(b){return 1;},");
    });
    it('object', function(){
        assert.deepEqual(print({a: 1, b: [3]}), "{\"a\":1,\"b\":[3,],},");
    });
    it('object depth 2', function(){
        assert.deepEqual(print({a: 1, b: [3], c:{hello: true}}), 
        "{\"a\":1,\"b\":[3,],\"c\":{\"hello\":true,},},");
    });
    it('object string as key', function () {
        assert.deepEqual(print({'1': '12'}), '{"1":"12",},');
    });
    it('regex', function(){
        assert.deepEqual(print(/fsa \w+/g), '/fsa \\w+/g,');
    })
})