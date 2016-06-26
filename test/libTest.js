const assert = require('assert')
const sinon = require('sinon')
const db = require('./mocks/db')
const ds = require('../src/lib/data_source')
const lib = require('../src/lib')


describe('Library', () => {

  let sandbox = null

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
    ds.setDB(db)
  })

  afterEach(() => {
    sandbox.restore()
    ds.disconnectDB()
  })

  describe('getForms', () => {

    it('should return paginated list of forms', (done) => {
      lib.getForms({}, (err, result) => {
        assert.ifError(err)

        // TODO: add pagination checks and put strict size check
        assert(Array.isArray(result))
        assert(result.length > 0)
        assert.equal(result[ 0 ].firstName, 'John')
        assert.equal(result[ 0 ].lastName, 'Doe')

        done()
      })
    })

    it('should support filtering', (done) => {
      lib.getForms({ lastName: 'Skywalker' }, (err, result) => {
        assert.ifError(err)

        assert(Array.isArray(result))
        assert.equal(result.length, 1)
        assert.equal(result[ 0 ].firstName, 'Luke')
        assert.equal(result[ 0 ].lastName, 'Skywalker')

        done()
      })
    })

    it('should return error when DB is not available', (done) => {
      ds.disconnectDB()
      lib.getForms({}, (err) => {
        assert.equal(err.message, 'DataBase is not available now')
        done()
      })
    })
  })


  describe('getFormById', () => {

    it('should return form by id', (done) => {
      lib.getFormById(2, (err, result) => {
        assert.ifError(err)

        assert.equal(result.firstName, 'Jack')
        assert.equal(result.lastName, 'Sparrow')

        done()
      })
    })

    it('should return NULL when form not found by id', (done) => {
      lib.getFormById(0, (err, result) => {
        assert.ifError(err)
        assert.strictEqual(result, null)
        done()
      })
    })

    it('should return error when DB is not available', (done) => {
      ds.disconnectDB()
      lib.getFormById(2, (err) => {
        assert.equal(err.message, 'DataBase is not available now')
        done()
      })
    })
  })


  describe('validateForm', () => {

    it('should successfully validate form')
    // please add tests of validation rules bellow

  })


  describe('saveForm', () => {

    it('should successfully save form data and return form entity')
    it('should return error when DB is not available')
    it('should return error when file storage (S3) is not available')
  })
})
