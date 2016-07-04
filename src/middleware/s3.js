const lib = require('../lib')


exports.put = (req, res, next) => {
  if (!req.file) return next()

  lib.putS3(req.body, req.file, (err, url) => {
    if (err) return next(err)
    req.body.attachment = url
    next()
  })
}
