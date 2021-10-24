// Logic
const logger = require('morgan')
const busboyBodyParser = require('busboy-body-parser')

module.exports = app => {
  app.use(logger('dev'))
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    res.header(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, JwtToken'
    )
    next()
  })
  app.use(busboyBodyParser({ limit: '6000mb' }))

  //[*] V1 Routes Configuration.
  let viRoutes = require('../routings/v1/')
  app.use('/v1', viRoutes)
}
