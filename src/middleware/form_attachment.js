const multer = require('multer')

// multer settings
const storage = multer.memoryStorage()
const limits = { /*fieldSize: 5120, fileSize: 5120*/ } // 5Mb file size limit
const upload = multer({ storage, limits })

module.exports = upload
