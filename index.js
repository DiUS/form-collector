const app = require('./src/server')

const PORT = process.env.PORT || 3000


app.listen(PORT, (err) => {
  if (err) {
    /* eslint-disable no-console */
    console.error(err)
    /* eslint-enable no-console */
    process.exit(1)
  }

  /* eslint-disable no-console */
  console.log(`Application is listening on port: ${PORT}`)
  /* eslint-enable no-console */
})
