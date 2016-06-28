const assert = require('assert')
const req = require('supertest')
const sinon = require('sinon')
const app = require('../src/server')
const ds = require('../src/lib/data_source')
const formsCollection = require('../dbseed/forms.collection')


describe('API', () => {

  let sandbox = null

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
    ds.setDB({})
  })

  afterEach(() => sandbox.restore())

  describe('GET /', () => {

    it('should response `200` and return a list of found forms', (done) => {
      sandbox.stub(ds, 'findDB', (collectionName, opts, cb) => cb(null, formsCollection))
      req(app)
        .get('/')
        .expect('Content-Type', /json/)
        .expect(200, (err, res) => {
          assert.ifError(err)
          assert.deepEqual(res.body, formsCollection)
          done()
        })
    })

    it('should response `500` and return server side error information', (done) => {
      ds.setDB(null)
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
      sandbox.stub(ds, 'findDB', (collectionName, opts, cb) => cb(null, [ formsCollection[ 0 ] ]))
      req(app)
        .get('/1')
        .expect('Content-Type', /json/)
        .expect(200, (err, res) => {
          assert.ifError(err)
          assert.deepEqual(res.body, formsCollection[ 0 ])
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
      ds.setDB(null)
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

    it('should response `201` and return created form data')

    it('should response `400` and return client error (e.g. form valiedation error)', (done) => {
      req(app)
        .post('/')
        .send({})
        .expect(400, (err, res) => {
          assert.ifError(err)
          assert.deepEqual(res.body, { error: 'Form Data contains invalid fields: firstName, lastName' })
          done()
        })
    })

    it('should response `500` and return server side error information', (done) => {
      ds.setDB(null)
      req(app)
        .post('/')
        .send({ firstName: 'John', lastName: 'Smith' })
        .expect(500, (err, res) => {
          assert.ifError(err)
          assert.deepEqual(res.body, { error: 'DataBase is not available now' })
          done()
        })
    })
  })
})
