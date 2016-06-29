/**
 * This module contains all data source references
 * which used by this application. It includes
 * - DataBase reference
 * - File storage reference (to be done)
 * - Other external data source references
 */
const DBClient = require('mongodb').MongoClient
const url = require('url')
const { DBNotAvailable, DBCollectionNotFound, DBError } = require('./error')

let _db = null
let _dbReconnectTimeout = null
let reconnectTries = 600
let reconnectInterval = 1000 // in msec
let bufferMaxEntries = 0

exports.getDB = () => _db
exports.setDB = (db) => {
  _db = db
  if (!db) return

  // driver's events
  db.on('close', () => {
    if (_dbReconnectTimeout) clearTimeout(_dbReconnectTimeout)
    _dbReconnectTimeout = setTimeout(() => {
      _db = db = null
      // TODO: we should return message about DB failure and stop the whole application here
    }, reconnectTries * reconnectInterval)
  })

  db.on('reconnect', () => {
    if (_dbReconnectTimeout) {
      clearTimeout(_dbReconnectTimeout)
      _dbReconnectTimeout = null
    }
  })
}


const getDBConnectionString = (opts) => {
  const _opts = {
    protocol: opts.protocol,
    hostname: opts.host,
    port: opts.port,
    pathname: opts.name,
    slashes: true
  }
  return url.format(_opts)
}


exports.connectDB = (opts, cb) => {
  if (exports.getDB()) return cb()

  let _url = ''
  try {
     _url = getDBConnectionString(opts.url)
  } catch (e) {
    return cb(new DBError(e))
  }

  reconnectTries = opts.connection.reconnectTries || reconnectTries
  reconnectInterval = opts.connection.reconnectInterval || reconnectInterval
  bufferMaxEntries = opts.connection.bufferMaxEntries || bufferMaxEntries

  const connectionOptions = {
    reconnectTries,
    reconnectInterval,
    bufferMaxEntries
  }

  DBClient.connect(_url, connectionOptions, (err, db) => {
    if (err) return cb(new DBError(err))
    exports.setDB(db)
    cb()
  })
}


exports.disconnectDB = () => {
  const db = exports.getDB()
  if (!db) return

  db.removeAllListeners()
  db.close()
  exports.setDB(null)
}


exports._validateDBAndCollection = (collectionName) => {
  const db = exports.getDB()
  if (!db) return new DBNotAvailable()

  const collection = db.collection(collectionName)
  if (!collection) return new DBCollectionNotFound(collectionName)

  return collection
}


exports.findDB = (collectionName, opts, cb) => {
  const collection = exports._validateDBAndCollection(collectionName)
  return (collection instanceof Error) ? cb(collection) : collection.find(opts).toArray((err, result) => {
    (err) ? cb(new DBError(err)) : cb(null, result)
  })
}


exports.saveDB = (collectionName, data, cb) => {
  const collection = exports._validateDBAndCollection(collectionName)
  return (collection instanceof Error) ? cb(collection) : collection.insertOne(data, (err, result) => {
    (err) ? cb(new DBError(err)) : cb(null, result.ops[ 0 ])
  })
}
