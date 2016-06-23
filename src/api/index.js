const express = require('express')

const router = express.Router()


router.get('/', (req, res, next) => {
  res.status(500).send({ error: 'Not implemented yet' })
})


router.get('/:id', (req, res, next) => {
  res.status(500).send({ error: 'Not implemented yet' })
})


router.post('/', (req, res, next) => {
  res.status(500).send({ error: 'Not implemented yet' })
})


module.exports = router
