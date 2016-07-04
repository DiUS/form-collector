const _ = require('lodash')
const ds = require('./data_source')
const { InvalidFormDataObject, InvalidFormDataFields } = require('./error')
const formsCollectionName = 'forms'


exports.getForms = (opts, cb) => ds.findDB(formsCollectionName, opts, cb)


exports.getFormById = (id, cb) => {
  exports.getForms({ _id: id }, (err, formsList) => {
    if (err) return cb(err)
    if (!formsList.length) return cb(null, null)
    return cb(null, formsList[ 0 ])
  })
}


exports.validateForm = (formData) => {
  if (!_.isObject(formData)) return new InvalidFormDataObject()
  const invalidFields = []

  if (!formData.firstName) invalidFields.push('firstName')
  if (!formData.lastName) invalidFields.push('lastName')

  // NOTE: add other required fields checks here

  if (invalidFields.length) return new InvalidFormDataFields(invalidFields)

  return true
}


exports.saveForm = (formData, cb) => {
  ds.saveDB(formsCollectionName, formData, cb)
}


exports.generateS3ObjectName = (body, attachment) => {
  return `${body.firstName}-${body.lastName}-${attachment.originalname}`
}


exports.putS3 = (body, attachment, cb) => {
  const { buffer, mimetype } = attachment
  const fullName = exports.generateS3ObjectName(body, attachment)
  const opts = ds.getS3PutOptions(fullName, buffer, mimetype)
  ds.putS3(opts, cb)
}
