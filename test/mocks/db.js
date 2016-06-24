const _ = require('lodash')
const collections = require('./db.collections')


const db = Object.create(null, {
  connected: {
    value: true
  },
  close: {
    configurable: true,
    value: () => {}
  },
  collections: {
    enumerable: true,
    value: _.reduce(collections, (result, collectionData, collectionName) => {
      result[collectionName] = {
        find: (opts, cb) => cb(null, _.filter(collectionData, opts))
      }
      return result
    }, {})
  }
})
Object.defineProperty(db, 'collection', {
  value: (collectionName) => db.collections[collectionName]
})


module.exports = db
