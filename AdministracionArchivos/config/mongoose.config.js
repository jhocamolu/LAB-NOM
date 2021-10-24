// Logic
const mongoose = require('mongoose')

// activating Promises for mongoose
mongoose.Promise = global.Promise

module.exports = (config, logger) => {
  const dbURI = config.db
  console.log(dbURI)
  // using new syntax for mongoose library
  // check the mongoose doc for more info
  mongoose
    .connect(dbURI, { useMongoClient: true })
    // mongoose.connect(dbURI)
    .then(() => {
      console.log('conectado')
      logger.info(`[*] Connected to Database`)
    })
    .catch(err => {
      logger.errpr(`[*] Error while connecting to DB, with error: ${err}`)
    })
}
