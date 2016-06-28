const assert = require('assert')
const sinon = require('sinon')
const db = require('./mocks/db')
const ds = require('../src/lib/data_source')
const { DBError, InvalidFormDataObject, InvalidFormDataFields } = require('../src/lib/error')
const lib = require('../src/lib')


describe('Library', () => {

  let sandbox = null
  const formMock = { firstName: 'Joe', lastName: 'Smith' }

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
        assert(err instanceof DBError)
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

    it('should successfully save form data and return form entity', (done) => {
      lib.saveForm(formMock, (err, newForm) => {
        assert.ifError(err)
        assert(newForm._id)
        assert.equal(newForm.firstName, 'Joe')
        assert.equal(newForm.lastName, 'Smith')
        done()
      })
    })

    it('should return error when DB is not available', (done) => {
      ds.disconnectDB()
      lib.saveForm(formMock, (err) => {
        assert(err instanceof DBError)
        done()
      })
    })

    it('should return error when file storage (S3) is not available')
  })
})
