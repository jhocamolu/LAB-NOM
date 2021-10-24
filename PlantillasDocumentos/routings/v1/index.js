const router = require('express').Router()

router.use((req, res, next) => {
  var token = req.headers['jwttoken']
  if (token) {
    next()
  } else {
    //next()
    res.send({
      message: "Error"
    });
  }
})
// Requiring the document-uploader file here from index file.
require('./pdf/documents-downloader')(router)
module.exports = router
