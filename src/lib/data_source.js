/**
 * This module contains all data source references
 * which used by this application. It includes
 * - DataBase reference
 * - File storage reference (to be done)
 * - Other external data source references
 */
const DBClient = require('mongodb').MongoClient
const knox = require('knox') // S3 client library
const url = require('url')
const {
  DBNotAvailable, DBCollectionNotFound, DBError,
  S3Error
} = require('./error')


// database connection properties
let _db = null // database client reference
let _dbReconnectTimeout = null
let reconnectTries = 600
let reconnectInterval = 1000 // in msec
let bufferMaxEntries = 0

// s3 connection properties
let _s3 = null // s3 client reference


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


exports.getDBClient = () => _db
exports.setDBClient = (db) => {
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


exports.connectDB = (opts, cb) => {
  if (exports.getDBClient()) return cb()

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
    exports.setDBClient(db)
    cb()
  })
}


exports.disconnectDB = () => {
  const db = exports.getDBClient()
  if (!db) return

  db.removeAllListeners()
  db.close()
  exports.setDBClient(null)
}


exports._validateDBAndCollection = (collectionName) => {
  const db = exports.getDBClient()
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


exports.getS3Client = () => _s3
exports.setS3Client = (s3) => _s3 = s3


exports.createS3Client = (opts, cb) => {
  try {
    exports.setS3Client(knox.createClient(opts))
  } catch(err) {
    return cb(new S3Error(err))
  }
  cb()
}


exports.putS3 = (opts, cb) => {
  cb(new Error('Not implemented yet'))
}


exports.getS3 = (opts, cb) => {
  cb(new Error('Not implemented yet'))
}
