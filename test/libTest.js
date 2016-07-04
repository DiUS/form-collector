const assert = require('assert')
const sinon = require('sinon')
const { dbMock, s3Mock } = require('./mocks')
const ds = require('../src/lib/data_source')
const { DBError, InvalidFormDataObject, InvalidFormDataFields, S3Error } = require('../src/lib/error')
const forms = require('../docker/dbseed/forms.collection')
const lib = require('../src/lib')


describe('Library', () => {

  const formMock = {
    firstName: 'Joe', lastName: 'Smith',
    file: {
      originalname: 'testFile',
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

    it('should handle errors during database read', (done) => {
      sandbox.stub(ds, 'findDB', (collectionName, opts, cb) => cb(new DBError('Test')))
      lib.getForms({}, (err) => {
        assert(err instanceof DBError)
        done()
      })
    })
  })


  describe('getFormById', () => {

    it('should return form by id', (done) => {
      sandbox.stub(ds, 'findDB', (collectionName, opts, cb) => cb(null, [forms[ 1 ]]))
      sandbox.spy(lib, 'getForms')

      lib.getFormById(2, (err, result) => {
        assert.ifError(err)

        assert(lib.getForms.calledOnce)
        assert.equal(result.firstName, 'Jack')
        assert.equal(result.lastName, 'Sparrow')

        done()
      })
    })

    it('should return NULL when form not found by id', (done) => {
      sandbox.stub(ds, 'findDB', (collectionName, opts, cb) => cb(null, []))
      sandbox.spy(lib, 'getForms')

      lib.getFormById(0, (err, result) => {
        assert.ifError(err)

        assert(lib.getForms.calledOnce)
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
      const s3Opts = {
        fileName: 'Joe-Smith-testFile',
        fileData: 'testestest',
        headers: {
          'Content-Length': 10,
          'Content-Type': 'text/plain',
          'x-amz-acl': 'public-read'
        }
      }

      sandbox.stub(ds, 'putS3', (opts, cb) => cb(null, 'localhost'))
      sandbox.stub(ds, 'saveDB', (collectionName, opts, cb) => cb())

      lib.saveForm(formMock, (err) => {
        assert.ifError(err)

        assert(ds.putS3.calledOnce)
        assert.deepEqual(ds.putS3.getCall(0).args[ 0 ], s3Opts)

        assert(ds.saveDB.calledOnce)
        assert.equal(ds.saveDB.getCall(0).args[ 0 ], 'forms')
        assert.deepEqual(ds.saveDB.getCall(0).args[ 1 ], {
          firstName: 'Joe',
          lastName: 'Smith',
          url: 'localhost'
        })

        done()
      })
    })

    it('should return error when DB is not available', (done) => {
      ds.setDBClient(null)
      sandbox.stub(ds, 'putS3', (opts, cb) => cb())
      lib.saveForm(formMock, (err) => {
        assert(err instanceof DBError)
        assert(ds.putS3.calledOnce)
        done()
      })
    })

    it('should return error when file storage S3 is not available', (done) => {
      ds.setS3Client(null)
      sandbox.spy(ds, 'saveDB')
      lib.saveForm(formMock, (err) => {
        assert(err instanceof S3Error)
        assert(!ds.saveDB.called)
        done()
      })
    })

    it('should handle errors during file upload to S3', (done) => {
      sandbox.spy(ds, 'saveDB')

      lib.saveForm(formMock, (err) => {
        assert(err instanceof S3Error)
        assert(!ds.saveDB.called)
        done()
      })
      s3Client.request.emit('response', { statusCode: 400, statusMessage: 'test error' })
    })

    it('should handle errors during database write', (done) => {
      sandbox.spy(ds, 'putS3')
      sandbox.stub(ds, 'saveDB', (collectionName, data, cb) => cb(new DBError('Test')))

      lib.saveForm(formMock, (err) => {
        assert(err instanceof DBError)
        // TODO: what should we do if we cannot write to DB?
        // should we try to delete file from S3?
        assert(ds.putS3.called)
        done()
      })
      s3Client.request.emit('response', { statusCode: 200 })
    })
  })
})
