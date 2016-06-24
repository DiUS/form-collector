/**
 * This module contains all data source references
 * which used by this application. It includes
 * - DataBase reference
 * - File storage reference (to be done)
 * - Other external data source references
 */
const DBClient = require('mongodb').MongoClient

let _db = null


const connectDB = (opts, cb) => {
  throw new Error('Not implemented yet')
}


const disconnectDB = (cb) => {
  throw new Error('Not implemented yet')
}


const getDB = () => ( _db )


module.exports = { connectDB, disconnectDB, getDB }
