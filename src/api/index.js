const express = require('express')
const middleware = require('../middleware')

const router = express.Router()


router.get('/', middleware.getForms)
router.get('/:id', middleware.getFormById)
router.post('/', middleware.sanitizeForm, middleware.createForm)


module.exports = router
