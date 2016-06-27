const assert = require('assert')
const _ = require('lodash')
const DBClient = require('mongodb').MongoClient
const sinon = require('sinon')
const db = require('./mocks/db')
const ds = require('../src/lib/data_source')
const error = require('../src/lib/error')


describe('Data source', () => {

  let sandbox = null

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  afterEach(() => {
    sandbox.restore()
    ds.disconnectDB()
  })

  describe('DataBase', () => {


    describe('connectDB and disconnectDB', () => {

      it('should handle DB connection errors', (done) => {
        const connectionError = new Error('Connection error')
        sandbox.stub(DBClient, 'connect', (url, cb) => cb(connectionError))

        ds.disconnectDB()
        ds.connectDB({}, (err) => {
          assert.deepEqual(err, connectionError)
          assert(!ds.getDB())
          done()
        })
      })

      it('should connect and disconnect from DB', () => {
        sandbox.stub(DBClient, 'connect', (url, cb) => cb(null, db))
        sandbox.spy(db, 'close')

        ds.connectDB({}, (err) => {
          assert.ifError(err)
          assert.deepEqual(ds.getDB(), db)

          ds.disconnectDB()
          assert(!ds.getDB())
          assert(db.close.calledOnce)
        })
      })
    })


    describe('findDB', () => {
      beforeEach((done) => {
        sandbox.stub(DBClient, 'connect', (url, cb) => cb(null, db))
        ds.connectDB({}, done)
      })

      it('should return error when DB is not available', (done) => {
        ds.disconnectDB()
        ds.findDB('forms', {}, (err) => {
          assert.deepEqual(err, error.DBNotAvailable)
          done()
        })
      })

      it('should return error when collection not found in DB', (done) => {
        ds.findDB('unknown', {}, (err) => {
          assert.deepEqual(err, error.DBCollectionNotFound('unknown'))
          done()
        })
      })

      it('should call find method of collection', (done) => {
        sandbox.spy(db.collections.forms, 'find')
        ds.findDB('forms', {}, (err, forms) => {
          assert.ifError(err)
          assert(db.collections.forms.find.calledOnce)
          assert(!_.isEmpty(forms))
          done()
        })
      })
    })
  })
})
