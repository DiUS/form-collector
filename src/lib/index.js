const async = require('async')
const _ = require('lodash')
const ds = require('./data_source')
const { InvalidFormDataObject, InvalidFormDataFields } = require('./error')
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
  if (!_.isObject(formData)) return new InvalidFormDataObject()
  const invalidFields = []

  if (!formData.firstName) invalidFields.push('firstName')
  if (!formData.lastName) invalidFields.push('lastName')

  // NOTE: add other required fields checks here

  if (invalidFields.length) return new InvalidFormDataFields(invalidFields)

  return true
}


const saveForm = (formData, cb) => {

  const putS3 = (formData, cb) => {
    const { originalName, buffer, mimetype } = formData.file
    const opts = ds.getS3PutOptions(originalName, buffer, mimetype)
    ds.putS3(opts, (err, url) => (err) ? cb(err) : cb(null, Object.assign({}, formData, { url })))
  }
  const saveDB = (formData, cb) => {
    ds.saveDB(formsCollectionName, _.omit(formData, 'file'), cb)
  }

  async.waterfall([
    async.apply(putS3, formData),
    saveDB
  ], cb)
}


module.exports = { getForms, getFormById, validateForm, saveForm }
