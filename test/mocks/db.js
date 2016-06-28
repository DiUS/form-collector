const _ = require('lodash')
const collections = { forms: require('../../dbseed/forms.collection') }


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
        find: (opts, cb) => cb(null, _.filter(collectionData, opts)),
        insert: (data, cb) => {
          const _lastId = (data._id) ? data._id : (_(collectionData).map('_id').max() || 0) + 1
          const _data = Object.assign({ _id: _lastId }, data)
          collectionData.push(_data)
          cb(null, _data)
        }
      }
      return result
    }, {})
  }
})
Object.defineProperty(db, 'collection', {
  value: (collectionName) => db.collections[collectionName]
})


module.exports = db
