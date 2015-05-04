'use strict';
var test = require('tape');
var readUntil = require('../index');

var file = './test/data/numbers.txt';

test('Match exists, read whole file on first read', function(t){
  t.plan(2);
  readUntil(file, '4', 256, function(err, buf){
    t.notOk(err, 'No error');
    t.equal(buf.toString() ,'123', 'Returns contents before match.') 
  })
})

test('Match doesn\'t exist, read whole file on first read', function(t){
  t.plan(2);
  readUntil(file, 'nope', 256, function(err, buf){
    t.ok(err, 'Error on no match.');
    t.notOk(buf, 'No data returned if no match exists.') 
  })
})


test('Match exists, file fits into initial buffer', function(t){
  t.plan(2);
  readUntil(file, '9', 4, function(err, buf){
    t.notOk(err, 'No error');
    t.equal(buf.toString(), '12345678', 'Returns contents before match.') 
  })
})

test('Match doesn\'t exist, file fits into initial buffer', function(t){
  t.plan(2);
  readUntil(file, 'nope', 4, function(err, buf){
    t.ok(err, 'Error on no match.');
    t.notOk(buf, 'No data returned if no match exists.') 
  })
})
