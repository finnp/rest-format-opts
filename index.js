var negotiator = require('negotiator')
var qs = require('querystring')
var url = require('url')

module.exports = Format

function Format(formatMap, opts) {
  if(!(this instanceof Format)) return new Format(formatMap, opts)
  opts = opts || {}
  this.formats = formatMap
  this.defaultFormat = opts.defaultFormat
  this.setContentType = (opts.setContentType !== false)
  return this.handle.bind(this)
}

Format.prototype.handle = function (req, res, cb) {
  var mimetype
  var opts = qs.parse(url.parse(req.url).query)
  if(opts.format) {
    mimetype = this.getMimeType(opts.format)
  } else {
    mimetype = this.mimetypeFromAccept(req)
    opts.format = mimetype ? this.getFormat(mimetype) : this.defaultFormat
  }
  
  if(this.setContentType && mimetype) res.setHeader('Content-Type', mimetype)

  cb(req, res, opts)
}

Format.prototype.mimetypeFromAccept = function(req) {
  var formats = this.formats
  var mimes = Object.keys(formats).map(function (format) {
    return formats[format]
  })
  return negotiator(req).mediaType(mimes)
}

Format.prototype.getMimeType = function(format) {
  return this.formats[format]
}

Format.prototype.getFormat = function(mimetype) {
  var formats = this.formats
  return Object.keys(formats).filter(function (format) {
    return formats[format] === mimetype
  }).pop()
}
