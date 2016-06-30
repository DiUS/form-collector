const assert = require('assert')
const sinon = require('sinon')
const { dbMock } = require('./mocks')
const ds = require('../src/lib/data_source')
const { DBError, InvalidFormDataObject, InvalidFormDataFields } = require('../src/lib/error')
const forms = require('../dbseed/forms.collection')
const lib = require('../src/lib')


describe('Library', () => {

  let sandbox = null
  const formMock = { firstName: 'Joe', lastName: 'Smith' }

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
    ds.setDBClient(dbMock)
  })

  afterEach(() => {
    sandbox.restore()
    ds.setDBClient(null)
  })

  describe('getForms', () => {

    it('should return paginated list of forms', (done) => {
      sandbox.stub(ds, 'findDB', (collectionName, opts, cb) => cb(null, forms))
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

    it('should return error when DB is not available', (done) => {
      ds.setDBClient(null)
      lib.getForms({}, (err) => {
        assert(err instanceof DBError)
        done()
      })
    })
  })


  describe('getFormById', () => {

    it('should return form by id', (done) => {
      sandbox.stub(ds, 'findDB', (collectionName, opts, cb) => cb(null, [forms[ 1 ]]))
      lib.getFormById(2, (err, result) => {
        assert.ifError(err)

        assert.equal(result.firstName, 'Jack')
        assert.equal(result.lastName, 'Sparrow')

        done()
      })
    })

    it('should return NULL when form not found by id', (done) => {
      sandbox.stub(ds, 'findDB', (collectionName, opts, cb) => cb(null, []))
      lib.getFormById(0, (err, result) => {
        assert.ifError(err)
        assert.strictEqual(result, null)
        done()
      })
    })

    it('should return error when DB is not available', (done) => {
      ds.setDBClient(null)
      lib.getFormById(2, (err) => {
        assert(err instanceof DBError)
        done()
      })
    })
  })


  describe('validateForm', () => {

    it('should return error when invalid form object found', () => {
      let isValid = lib.validateForm()
      assert(isValid instanceof InvalidFormDataObject)

      isValid = lib.validateForm(1)
      assert(isValid instanceof InvalidFormDataObject)

      isValid = lib.validateForm(null)
      assert(isValid instanceof InvalidFormDataObject)
    })

    it('should validate firstName and lastName', () => {
      let isValid = lib.validateForm({})
      assert(isValid instanceof InvalidFormDataFields)
    })

    // NOTE: please add tests of other validation rules here

    it('should successfully validate form', () => {
      let isValid = lib.validateForm(formMock)
      assert.equal(isValid, true)
    })
  })


  describe('saveForm', () => {

    it('should successfully upload form to S3, save form data and return form entity', (done) => {
      sandbox.stub(ds, 'saveDB', (collectionName, opts, cb) => cb(null, formMock))
      lib.saveForm(formMock, (err, newForm) => {
        assert.ifError(err)
        assert.equal(newForm.firstName, 'Joe')
        assert.equal(newForm.lastName, 'Smith')
        done()
      })
    })

    it('should return error when DB is not available', (done) => {
      ds.setDBClient(null)
      lib.saveForm(formMock, (err) => {
        assert(err instanceof DBError)
        done()
      })
    })

    it('should return error when file storage S3 is not available')

    it('should handle errors during file upload to S3')
    it('should handle errors during database write')
  })
})
