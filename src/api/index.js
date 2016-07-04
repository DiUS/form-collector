const express = require('express')
const { getForms, getFormById, formAttachment, sanitizeForm, createForm } = require('../middleware')

const router = express.Router()


router.get('/', getForms)
router.get('/:id', getFormById)
router.post('/', formAttachment.single('attachment'), sanitizeForm, createForm)


module.exports = router
