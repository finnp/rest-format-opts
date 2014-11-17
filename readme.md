# rest-format-opts

Parse request options for specific requested data formats. Parses Accept headers
and query string, with priority given to the query string.


Install with `npm install rest-format-opts`


## example

```js
var formatOpts = require('rest-format-opts')({
  'json': 'application/json',
  'csv': 'text/csv'
})

http.createServer(function (req, res) {
  formatOpts(req, res, function (req, res, opts) {
    // opts.format now includes the format
    // res has the correct headers
  })
})

```

## usage

```js
var formatOpts = require('rest-format-opts')(formatDict, opts)
```

### formatDict

Object with the format identifiers as keys and the associated mediatypes as values.

#### opts

* *defaultFormat* Set a default fallback format
* *setContentType* Set to `false` to disable setting of response content-type