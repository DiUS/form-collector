const ds = require('./data_source')
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
  throw new Error('Not implemented yet')
}


const saveForm = (formData, cb) => {
  throw new Error('Not implemented yet')
}


module.exports = { getForms, getFormById, validateForm, saveForm }
