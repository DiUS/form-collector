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


const findDB = (collectionName, opts, cb) => {
  const db = getDB()
  if (!db) return cb(error.DBNotAvailable)

  const collection = db.collection(collectionName)
  if (!collection) return cb(error.DBCollectionNotFound(collectionName))

  collection.find(opts, cb)
}


module.exports = { connectDB, disconnectDB, getDB, setDB, findDB }
