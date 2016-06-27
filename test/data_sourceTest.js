const assert = require('assert')
const _ = require('lodash')
const DBClient = require('mongodb').MongoClient
const sinon = require('sinon')
const db = require('./mocks/db')
const ds = require('../src/lib/data_source')
const error = require('../src/lib/error')


describe('Data source', () => {

  let sandbox = null

  beforeEach(() => sandbox = sinon.sandbox.create())
  afterEach(() => sandbox.restore())

  describe('DataBase', () => {


    describe('connectDB and disconnectDB', () => {

      beforeEach(() => ds.disconnectDB())

      it('should handle DB connection errors', (done) => {
        const connectionError = new Error('Connection error')
        sandbox.stub(DBClient, 'connect', (url, cb) => cb(connectionError))

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


    describe('Data manipulation methods', function() {

      beforeEach(() => ds.setDB(db))
      afterEach(() => ds.disconnectDB())

      describe('findDB', () => {

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


      describe('saveDB', () => {

        it('should return error when DB is not available', (done) => {
          ds.disconnectDB()
          ds.saveDB('forms', {}, (err) => {
            assert.deepEqual(err, error.DBNotAvailable)
            done()
          })
        })

        it('should return error when collection not found in DB', (done) => {
          ds.saveDB('unknown', {}, (err) => {
            assert.deepEqual(err, error.DBCollectionNotFound('unknown'))
            done()
          })
        })

        it('should insert document and return document data', (done) => {
          const formMock = { firstName: 'Joe', lastName: 'Smith' }
          sandbox.spy(db.collections.forms, 'insert')
          ds.saveDB('forms', formMock, (err, newForm) => {
            assert.ifError(err)

            // formMock and newForm should refer to different Objects
            assert.notEqual(newForm, formMock)

            // newForm should have _id field automatically generated
            assert(newForm._id)
            assert.equal(newForm.firstName, 'Joe')
            assert.equal(newForm.lastName, 'Smith')

            assert(db.collections.forms.insert.calledOnce)

            done()
          })
        })
      })
    })
  })
})
