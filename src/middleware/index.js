const error = require('../lib/error')
const lib = require('../lib')


const getForms = (req, res, next) => {
  lib.getForms(req.query, (err, forms) => {
    if (err) return next(err)
    res.send(forms)
  })
}


const getFormById = (req, res, next) => {
  lib.getFormById(req.params.id, (err, form) => {
    if (err) return next(err)
    if (!form) return res.status(404).send(error.FormNotFound.message)
    res.send(form)
  })
}


const sanitizeForm = (req, res, next) => {
  req.sanitizeBody('firstName').trim()
  req.sanitizeBody('lastName').trim()

  // NOTE: sanitize other forms fields here

  next()
}


const createForm = (req, res, next) => {
  const formData = req.body
  const isValidFormData = lib.validateForm(formData)

  if (isValidFormData !== true) return next(isValidFormData)
  lib.saveForm(formData, (err, newForm) => {
    if (err) return next(err)
    res.send(newForm)
  })
}


module.exports = {
  getForms, getFormById,
  sanitizeForm, createForm
}
