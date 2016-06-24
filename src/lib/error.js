const DBNotAvailable = new Error('DataBase is not available now')
const DBCollectionNotFound = (collectionName) => new Error(`DataBase collection '${collectionName}' not found`)


module.exports = { DBNotAvailable, DBCollectionNotFound }
