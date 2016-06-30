const assert = require('assert')
const req = require('supertest')
const sinon = require('sinon')
const app = require('../src/server')
const { dbMock, s3Mock } = require('./mocks')
const ds = require('../src/lib/data_source')
const forms = require('../dbseed/forms.collection')


describe('API', () => {

  const formMock = {
    firstName: 'John', lastName: 'Smith',
    file: {
      originalName: 'testFile',
      mimetype: 'text/plain',
      buffer: 'testestest'
    }
  }
  let sandbox = null
  let s3Client = null

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
    s3Client = s3Mock()
    ds.setDBClient(dbMock)
    ds.setS3Client(s3Client)
  })

  afterEach(() => {
    sandbox.restore()
    ds.setDBClient(null)
    ds.setS3Client(null)
  })

  describe('GET /', () => {

    it('should response `200` and return a list of found forms', (done) => {
      sandbox.stub(ds, 'findDB', (collectionName, opts, cb) => cb(null, forms))
      req(app)
        .get('/')
        .expect('Content-Type', /json/)
        .expect(200, (err, res) => {
          assert.ifError(err)
          assert.deepEqual(res.body, forms)
          done()
        })
    })

    it('should response `500` and return server side error information', (done) => {
      ds.setDBClient(null)
      req(app)
        .get('/')
        .expect(500, (err, res) => {
          assert.ifError(err)
          assert.deepEqual(res.body, { error: 'DataBase is not available now' })
          done()
        })
    })
  })


  describe('GET /:id', () => {

    it('should response `200` and return form data', (done) => {
      sandbox.stub(ds, 'findDB', (collectionName, opts, cb) => cb(null, [ forms[ 0 ] ]))
      req(app)
        .get('/1')
        .expect('Content-Type', /json/)
        .expect(200, (err, res) => {
          assert.ifError(err)
          assert.deepEqual(res.body, forms[ 0 ])
          done()
        })
    })

    it('should response `404` and return client error (form not found by id)', (done) => {
      sandbox.stub(ds, 'findDB', (collectionName, opts, cb) => cb(null, []))
      req(app)
        .get('/1')
        .expect('Content-Type', /json/)
        .expect(404, (err, res) => {
          assert.ifError(err)
          assert.deepEqual(res.body, { error: 'Form not found' })
          done()
        })
    })

    it('should response `500` and return server side error information', (done) => {
      ds.setDBClient(null)
      req(app)
        .get('/1')
        .expect(500, (err, res) => {
          assert.ifError(err)
          assert.deepEqual(res.body, { error: 'DataBase is not available now' })
          done()
        })
    })
  })


  describe('POST /', () => {

    it('should response `201` and return created form data', (done) => {
      sandbox.spy(ds, 'putS3')
      sandbox.stub(ds, 'saveDB', (collectionName, opts, cb) => cb(null, opts))
      req(app)
        .post('/')
        .send(formMock)
        .expect(201, (err, res) => {
          assert.ifError(err)
          assert(ds.putS3.calledOnce)
          assert.deepEqual(res.body, { firstName: 'John', lastName: 'Smith', url: 'localhost' })
          done()
        })

      setTimeout(() => {
        s3Client.request.emit('response', { statusCode: 200 })
      }, 100)
    })

    it('should response `400` and return client error (e.g. form valiedation error)', (done) => {
      sandbox.spy(ds, 'putS3')
      sandbox.spy(ds, 'saveDB')
      req(app)
        .post('/')
        .send({})
        .expect(400, (err, res) => {
          assert.ifError(err)
          assert(!ds.putS3.called)
          assert(!ds.saveDB.called)
          assert.deepEqual(res.body, { error: 'Form Data contains invalid fields: firstName, lastName' })
          done()
        })
    })

    it('should response `500` when DB is not available', (done) => {
      sandbox.spy(ds, 'putS3')
      ds.setDBClient(null)
      req(app)
        .post('/')
        .send(formMock)
        .expect(500, (err, res) => {
          assert.ifError(err)
          assert(ds.putS3.calledOnce)
          assert.deepEqual(res.body, { error: 'DataBase is not available now' })
          done()
        })

        setTimeout(() => {
          s3Client.request.emit('response', { statusCode: 200 })
        }, 100)
    })

    it('should response `500` when S3 is not available', (done) => {
      ds.setS3Client(null)
      sandbox.spy(ds, 'saveDB')
      req(app)
        .post('/')
        .send(formMock)
        .expect(500, (err, res) => {
          assert.ifError(err)
          assert(!ds.saveDB.called)
          assert.deepEqual(res.body, { error: 'S3 is not available now' })
          done()
        })
    })

    it('should response `500` on errors during file upload to S3', (done) => {
      sandbox.spy(ds, 'saveDB')
      req(app)
        .post('/')
        .send(formMock)
        .expect(500, (err, res) => {
          assert.ifError(err)
          assert(!ds.saveDB.called)
          assert.deepEqual(res.body, { error: 'S3 write error: status code \'400\', message \'test error\'' })
          done()
        })

      setTimeout(() => {
        s3Client.request.emit('response', { statusCode: 400, statusMessage: 'test error' })
      }, 100)
    })

    it('should response `500` errors during database write', (done) => {
      sandbox.spy(ds, 'putS3')
      sandbox.stub(ds, 'saveDB', (collectionName, opts, cb) => cb(new Error('test error')))
      req(app)
        .post('/')
        .send(formMock)
        .expect(500, (err, res) => {
          assert.ifError(err)
          assert(ds.putS3.calledOnce)
          assert.deepEqual(res.body, { error: 'test error' })
          done()
        })

        setTimeout(() => {
          s3Client.request.emit('response', { statusCode: 200 })
        }, 100)
    })
  })
})
