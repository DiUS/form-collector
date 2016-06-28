const NODE_ENV = process.env.NODE_ENV

/* eslint-disable no-unused-vars */
module.exports = (err, req, res, next) => {
  if (NODE_ENV === 'dev') {
    /* eslint-disable no-console */
    console.error(err.stack)
    /* eslint-enable no-console */
  }

  res.status(500).send({ error: err.message })
}
