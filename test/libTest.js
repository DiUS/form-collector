const assert = require('assert')
const sinon = require('sinon')
const { dbMock, s3Mock } = require('./mocks')
const ds = require('../src/lib/data_source')
const { DBError, InvalidFormDataObject, InvalidFormDataFields, S3Error } = require('../src/lib/error')
const forms = require('../docker/dbseed/forms.collection')
const lib = require('../src/lib')


describe('Library', () => {

  const formMock = { firstName: 'Joe', lastName: 'Smith' }
  const attachmentMock = {
    originalname: 'testFile',
    mimetype: 'text/plain',
    buffer: new Buffer('testestest')
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

    it('should successfully save form data and return form entity', (done) => {
      sandbox.stub(ds, 'saveDB', (collectionName, opts, cb) => cb())

      lib.saveForm(formMock, (err) => {
        assert.ifError(err)

        assert(ds.saveDB.calledOnce)
        assert.equal(ds.saveDB.getCall(0).args[ 0 ], 'forms')
        assert.deepEqual(ds.saveDB.getCall(0).args[ 1 ], {
          firstName: 'Joe',
          lastName: 'Smith'
        })

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

    it('should handle errors during database write', (done) => {
      sandbox.stub(ds, 'saveDB', (collectionName, data, cb) => cb(new DBError('Test')))
      lib.saveForm(formMock, (err) => {
        assert(err instanceof DBError)
        done()
      })
    })
  })


  describe('generateS3ObjectName', () => {

    it('should generate s3 object name based on request boy and attachment', () => {
      const s3ObjectName = lib.generateS3ObjectName(formMock, attachmentMock)
      assert.equal(s3ObjectName, 'Joe-Smith-testFile')
    })
  })


  describe('putS3', () => {

    it('should put object to s3', (done) => {
      const s3Opts = {
        fileName: 'Joe-Smith-testFile',
        fileData: new Buffer('testestest'),
        headers: {
          'Content-Length': 10,
          'Content-Type': 'text/plain',
          'x-amz-acl': 'public-read'
        }
      }

      sandbox.spy(lib, 'generateS3ObjectName')
      sandbox.spy(ds, 'getS3PutOptions')
      sandbox.stub(ds, 'putS3', (opts, cb) => cb(null, 'localhost'))

      lib.putS3(formMock, attachmentMock, (err, url) => {
        assert.ifError(err)

        assert(lib.generateS3ObjectName.calledOnce)
        assert(ds.getS3PutOptions.calledOnce)
        assert(ds.putS3.calledOnce)
        assert.deepEqual(ds.putS3.getCall(0).args[ 0 ], s3Opts)
        assert.equal(url, 'localhost')

        done()
      })
    })

    it('should return error when file storage S3 is not available', (done) => {
      ds.setS3Client(null)
      lib.putS3(formMock, attachmentMock, (err) => {
        assert(err instanceof S3Error)
        done()
      })
    })

    it('should handle errors during file upload to S3', (done) => {
      lib.putS3(formMock, attachmentMock, (err) => {
        assert(err instanceof S3Error)
        done()
      })
      s3Client.request.emit('response', { statusCode: 400, statusMessage: 'test error' })
    })
  })
})
