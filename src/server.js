const express = require('express')
const bodyParser = require('body-parser')
const expressValidator = require('express-validator')
const apiRouter = require('./api')
const errorMiddleware = require('./middleware/error')

const app = express()

app.use(bodyParser.json())
app.use(expressValidator())
app.use(apiRouter)
app.use(errorMiddleware)

module.exports = app
