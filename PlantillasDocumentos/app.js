const app = require('express')()
const config = require('./config/config')
const logger = require('./config/logger.config')
const https = require('https');
const fs = require('fs');

// Express conf !
require('./config/express.config')(app)

// registrar servidor https
// https.createServer({
//   key: fs.readFileSync('/etc/ssl/private/ghestic.key'), 
//   cert: fs.readFileSync('/etc/ssl/certs/certghestic.pem'),
//   passphrase: 'Alcanos.2021'
// }, app).listen(config.port, () => {
//   logger.info(`[*] Listening on port ${config.port} ..`);
// });

// se comentarea cuando se registra HTTPS
//----------------------------------------------------
app.listen(config.port, () => {
  logger.info(`[*] Listening on port ${config.port} ..`)
})
//----------------------------------------------------