const router = require('express').Router()

router.use((req, res, next) => {
  var token = req.headers['jwttoken']
  if (token) {
    next()
  } else {
    res.send({
      mensaje: 'No hay token.'
    })
  }
})

// Requiring the document-uploader file here from index file.
require('./upload/documents-uploader')(router)
require('./download/documents-downloader')(router)
require('./delete/documents-delete')(router)
require('./pdf/documents-downloader')(router)

module.exports = router
