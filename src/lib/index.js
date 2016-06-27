const ds = require('./data_source')
const _ = require('lodash')
const error = require('./error')
const formsCollectionName = 'forms'


const getForms = (opts, cb) => ds.findDB(formsCollectionName, opts, cb)


const getFormById = (id, cb) => {
  getForms({ _id: id }, (err, formsList) => {
    if (err) return cb(err)
    if (!formsList.length) return cb(null, null)
    return cb(null, formsList[ 0 ])
  })
}


const validateForm = (formData) => {
  if (!_.isObject(formData)) return error.InvalidFormDataObject
  const invalidFields = []

  if (!formData.firstName) invalidFields.push('firstName')
  if (!formData.lastName) invalidFields.push('lastName')

  // NOTE: add other required fields checks here

  if (invalidFields.length) return error.InvalidFormDataFields(invalidFields)

  return true
}


const saveForm = (formData, cb) => {
  throw new Error('Not implemented yet')
}


module.exports = { getForms, getFormById, validateForm, saveForm }
