/**
 * This module contains all data source references
 * which used by this application. It includes
 * - DataBase reference
 * - File storage reference (to be done)
 * - Other external data source references
 */
const DBClient = require('mongodb').MongoClient
const error = require('./error')

let _db = null
const getDB = () => _db
const setDB = (db) => _db = db


const connectDB = (opts, cb) => {
  if (getDB()) return cb()

  // TODO: get connection string from opts
  DBClient.connect(opts, (err, db) => {
    if (err) return cb(err)
    setDB(db)
    cb()
  })
}


const disconnectDB = () => {
  const db = getDB()
  if (!db) return

  db.close()
  setDB(null)
}


const validateDBAndCollection = (collectionName) => {
  const db = getDB()
  if (!db) return error.DBNotAvailable

  const collection = db.collection(collectionName)
  if (!collection) return error.DBCollectionNotFound(collectionName)

  return collection
}


const findDB = (collectionName, opts, cb) => {
  const collection = validateDBAndCollection(collectionName)
  return (collection instanceof Error) ? cb(collection) : collection.find(opts, cb)
}


const saveDB = (collectionName, data, cb) => {
  const collection = validateDBAndCollection(collectionName)
  return (collection instanceof Error) ? cb(collection) : collection.insert(data, cb)
}


module.exports = { connectDB, disconnectDB, getDB, setDB, findDB, saveDB }
