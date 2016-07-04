const multer = require('multer')

const KB = Math.pow(2, 10)
const MB = Math.pow(2, 20)
const attachmentSize = (process.env.NODE_ENV === 'test') ? 20 * KB : 5 * MB

// multer settings
const storage = multer.memoryStorage()
const limits = { fileSize: attachmentSize }
const upload = multer({ storage, limits })

module.exports = upload
