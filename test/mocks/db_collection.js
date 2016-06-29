class DBCollection {
  constructor(data) {
    this.data = data || []
  }

  /* eslint-disable no-unused-vars */
  find(opts) {
    return this
  }
  /* eslint-enable no-unused-vars */

  toArray(cb) {
    cb(null, this.data)
  }

  insertOne(data, cb) {
    cb(null, { ops: [ data ] })
  }
}


module.exports = DBCollection
