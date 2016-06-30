const assert = require('assert')
const DBClient = require('mongodb').MongoClient
const sinon = require('sinon')
const { DBCollection, dbMock, s3Mock } = require('./mocks')
const ds = require('../src/lib/data_source')
const {
  DBNotAvailable, DBCollectionNotFound, DBError,
  S3Error
} = require('../src/lib/error')


describe('Data source', () => {

  let sandbox = null

  beforeEach(() => sandbox = sinon.sandbox.create())
  afterEach(() => sandbox.restore())

  describe('DataBase', () => {


    describe('connectDB and disconnectDB', () => {

      beforeEach(() => ds.setDBClient(null))

      it('should handle DB connection errors', (done) => {
        const connectionError = new Error('Connection error')
        sandbox.stub(DBClient, 'connect', (url, opts, cb) => cb(connectionError))

        ds.connectDB({}, (err) => {
          assert(err instanceof DBError)
          assert(!ds.getDBClient())
          done()
        })
      })

      it('should connect and disconnect from DB', () => {
        sandbox.stub(DBClient, 'connect', (url, opts, cb) => cb(null, dbMock))
        sandbox.spy(dbMock, 'close')

        ds.connectDB({ url: {}, connection: {} }, (err) => {
          assert.ifError(err)
          assert.deepEqual(ds.getDBClient(), dbMock)

          ds.disconnectDB()
          assert(!ds.getDBClient())
          assert(dbMock.close.calledOnce)
        })
      })
    })


    describe('_validateDBAndCollection', () => {

      it('should return error when DB is not available', () => {
        ds.setDBClient(null)
        const err = ds._validateDBAndCollection('forms')
        assert(err instanceof DBNotAvailable)
      })

      it('should return error when collection not found in DB', () => {
        ds.setDBClient(dbMock)
        const err = ds._validateDBAndCollection('forms')
        assert(err instanceof DBCollectionNotFound)
      })
    })


    describe('Data manipulation methods', function() {

      beforeEach(() => ds.setDBClient(dbMock))
      afterEach(() => ds.setDBClient(null))

      describe('findDB', () => {

        it('should handle errors on document find', (done) => {
          const collection = new DBCollection()

          sandbox.spy(collection, 'find')
          sandbox.stub(collection, 'toArray', (cb) => cb(new Error('Test')))
          sandbox.stub(ds, '_validateDBAndCollection', () => collection)

          ds.findDB('forms', {}, (err) => {
            assert(err instanceof DBError)
            assert(ds._validateDBAndCollection.calledOnce)
            assert(collection.find.calledOnce)
            assert.deepEqual((collection.find.getCall(0).args[0]), {})
            assert(collection.toArray.calledOnce)
            done()
          })
        })

        it('should call find method of collection', (done) => {
          const collectionData = [{ _id: 1, firstName: 'Joe', lastName: 'Smith' }]
          const collection = new DBCollection(collectionData)
          const findOpts = { firstName: 'Joe' }

          sandbox.spy(collection, 'find')
          sandbox.spy(collection, 'toArray')
          sandbox.stub(ds, '_validateDBAndCollection', () => collection)

          ds.findDB('forms', findOpts, (err, forms) => {
            assert.ifError(err)
            assert(ds._validateDBAndCollection.calledOnce)
            assert(collection.find.calledOnce)
            assert.deepEqual((collection.find.getCall(0).args[0]), findOpts)
            assert(collection.toArray.calledOnce)
            assert.deepEqual(forms, collectionData)
            done()
          })
        })
      })


      describe('saveDB', () => {

        it('should handle errors on document insert', (done) => {
          const collection = new DBCollection()

          sandbox.stub(collection, 'insertOne', (data, cb) => cb(new Error('Test')))
          sandbox.stub(ds, '_validateDBAndCollection', () => collection)

          ds.saveDB('forms', {}, (err) => {
            assert(err instanceof DBError)
            assert(collection.insertOne.calledOnce)
            assert.deepEqual((collection.insertOne.getCall(0).args[0]), {})
            done()
          })
        })

        it('should insert document and return document data', (done) => {
          const formMock = { _id: 1, firstName: 'Joe', lastName: 'Smith' }
          const collection = new DBCollection()

          sandbox.spy(collection, 'insertOne')
          sandbox.stub(ds, '_validateDBAndCollection', () => collection)

          ds.saveDB('forms', formMock, (err, newForm) => {
            assert.ifError(err)
            assert.deepEqual(newForm, formMock)

            assert(collection.insertOne.calledOnce)
            assert.deepEqual((collection.insertOne.getCall(0).args[0]), formMock)

            done()
          })
        })
      })
    })
  })


  describe('S3', function() {


    describe('createS3Client', () => {

      it('should handle S3 client creation errors', (done) => {
        ds.createS3Client({}, (err) => {
          assert(err instanceof S3Error)
          assert(!ds.getS3Client())
          done()
        })
      })

      it('should create S3 client', (done) => {
        const opts = {
          key: 'key',
          secret: 'secret',
          bucket: 'bucket',
          endpoint: 'localhost'
        }
        ds.createS3Client(opts, (err) => {
          assert.ifError(err)
          assert(ds.getS3Client())
          done()
        })
      })
    })


    describe('Bucket objects manipulation methods', () => {

      beforeEach(() => ds.setS3Client(s3Mock))
      afterEach(() => ds.setS3Client(null))

      describe('putS3', () => {

        it('should handle error when S3 connection is not established')
        it('should handle errors during put to S3')
        it('should put data to S3 and return URL to resource')
      })


      describe('getS3', () => {

        it('should handle error when S3 connection is not established')
        it('should handle errors during get from S3')
        it('should propogate resource not found error')
        it('should get resource from S3')
      })
    })
  })
})
