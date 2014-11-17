
var http = require('http')
var cluster = require('cluster')


if(cluster.isMaster) {
  var request = require('request').defaults({json: true})
  var test = require('tape')
  
  var worker = cluster.fork()
  
  worker.send({'json': 'application/json'})
  
  worker.on('message', function () {
    
    test('query string options parsed', function (t) {
      t.plan(5)
      request('http://localhost:8080?data=kitten', function (err, res, opts) {
        if(err) throw err
        t.equals(opts.data, 'kitten', 'data parsed')
      })
      request('http://localhost:8080?data=mangos&format=json', function (err, res, opts) {
        if(err) throw err
        t.equals(Object.keys(opts).length, 2, '2 options')
        t.equals(res.headers['content-type'], 'application/json', 'correct content-type')
        t.equals(opts.data, 'mangos', 'data parsed')
        t.equals(opts.format, 'json', 'format parsed') // should this be more strict?
      })
    })
    
    test('accept header parsed and mapped', function (t) {
      request({url:'http://localhost:8080?data=pasta', headers: {'Accept': 'application/json'}}, function (err, res, opts) {
        if(err) throw err
        t.equals(res.headers['content-type'], 'application/json', 'correct content-type')
        t.equals(Object.keys(opts).length, 2, '2 options')
        t.equals(opts.data, 'pasta', 'query string options')
        t.equals(opts.format, 'json', 'header format')
        t.end()
      })
    })
    
    test('do nothing with non existing format', function (t) {
      request({url:'http://localhost:8080', headers: {'Accept': 'text/csv'}}, function (err, res, opts) {
        if(err) throw err
        t.ok(!opts.format, 'no format parsed')
        t.end()
      })
    })

    test('query string wins over accept headers', function (t) {
      request({url:'http://localhost:8080?format=csv', headers: {'Accept': 'application/json'}}, function (err, res, opts) {
        if(err) throw err
        t.equals(opts.format, 'csv', 'correc format')
        t.end()
      })
    })
    
    test('choose correct format with wildcard accept  ', function (t) {
      worker.send({'csv': 'text/csv', 'json': 'application/json'})
      request({url:'http://localhost:8080', headers: {'Accept': 'text/*'}}, function (err, res, opts) {
        if(err) throw err
        t.equals(res.headers['content-type'], 'text/csv', 'correct content-type')
        t.equals(opts.format, 'csv', 'format parsed')
        t.end()
      })
    })
    
    test('default format', function (t) {
        worker.send([{'mydefault': 'text/mydefault', 'json': 'application/json'}, {defaultFormat: 'mydefault'}])
        request({url:'http://localhost:8080', headers: {'Accept': 'whoot/*'}}, function (err, res, opts) {
          if(err) throw err
          t.equals(opts.format, 'mydefault', 'default parsed')
          t.end()
        })
    })
    
    test('end test', function (t) {
      worker.kill()
      t.end()
    })
    
  })  
  

} else {

  // Create Server
  var restFormatOpts = require('./')
  var formatOpts = restFormatOpts({})

  process.on('message', function (msg) { 
    if(!('length' in msg)) msg = [msg]
    formatOpts = restFormatOpts.apply(null, msg)
  })

  http.createServer(function (req, res) {
    formatOpts(req, res, function (req, res, opts) {
      res.end(JSON.stringify(opts))
    })
  }).listen(8080, function () {   process.send('ready') })
}




