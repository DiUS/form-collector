const express = require('express')
const { getForms, getFormById, formAttachment, sanitizeForm, createForm, s3 } = require('../middleware')

const router = express.Router()


router.get('/', getForms)
router.get('/:id', getFormById)
router.post('/', formAttachment.single('attachment'), s3.put, sanitizeForm, createForm)


module.exports = router
