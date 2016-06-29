const async = require('async')
const nconf = require('nconf')
const app = require('./src/server')
const ds = require('./src/lib/data_source')

// application configuration
// * command line arguments
// * environment variables
// * defaults to config.json
nconf.argv().env().defaults(require('./config'))


const startApp = (cb) => {
  const port = nconf.get('serverApp').port
  app.listen(port, (err) => {
    if (err) return cb(err)
    /* eslint-disable no-console */
    console.log(`Application is listening on port: ${port}`)
    /* eslint-enable no-console */
  })
}


const connectDB = (cb) => {
  const opts = nconf.get('db')
  ds.connectDB(opts, (err) => {
    if (err) return cb(err)
    /* eslint-disable no-console */
    console.log(`Connected to DB: '${opts.url.name}' on '${opts.url.host}:${opts.url.port}'`)
    /* eslint-enable no-console */
  })
}


async.parallel({
  startApp,
  connectDB
}, (err) => {
  if (err) {
    /* eslint-disable no-console */
    console.error(err)
    /* eslint-enable no-console */
    process.exit(1)
  }
})
