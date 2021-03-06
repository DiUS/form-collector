const { InvalidFormError, NotFoundError } = require('../lib/error')

const NODE_ENV = process.env.NODE_ENV


const getStatus = (err) => {
  if (err instanceof InvalidFormError) return 400
  if (err instanceof NotFoundError) return 404
  if (err.code === 'LIMIT_FILE_SIZE') return 400
  return 500
}


/* eslint-disable no-unused-vars */
module.exports = (err, req, res, next) => {
  if (NODE_ENV === 'dev') {
    /* eslint-disable no-console */
    console.error(err.stack)
    /* eslint-enable no-console */
  }

  res.status(getStatus(err)).send({ error: err.message.replace(/Error:/g, '').trim() })
}


module.exports._getStatus = getStatus
