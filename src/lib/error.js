// DataBase errors
const DBNotAvailable = new Error('DataBase is not available now')
const DBCollectionNotFound = (collectionName) => new Error(`DataBase collection '${collectionName}' not found`)

// Form validation errors
const InvalidFormDataObject = new Error('Invalid Form Data Object')
const InvalidFormDataFields = (invalidFields) =>
  new Error(`Form Data contains invalid fields: ${invalidFields.join(', ')}`)

module.exports = {
  DBNotAvailable, DBCollectionNotFound,
  InvalidFormDataObject, InvalidFormDataFields
}
