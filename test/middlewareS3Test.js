const assert = require('assert')
const sinon = require('sinon')
const { S3Error } = require('../src/lib/error')
const lib = require('../src/lib')
const middleware = require('../src/middleware/s3')
const requestMock = require('./mocks/request')
const responseMock = require('./mocks/response')


describe('Middleware S3', () => {

  let sandbox = null

  beforeEach(() => sandbox = sinon.sandbox.create())
  afterEach(() => sandbox.restore())

  describe('put', () => {

    it('should not put to S3 if no file attachment found', (done) => {
      sandbox.spy(lib, 'putS3')
      middleware.put(requestMock(), responseMock(), (err) => {
        assert.ifError(err)
        assert(!lib.putS3.called)
        done()
      })
    })

    it('should handle server side errors', (done) => {
      sandbox.stub(lib, 'putS3', (body, file, cb) => cb(new S3Error('File cannot be uploaded')))
      middleware.put(requestMock({ body: {} }, {}), responseMock(), (err) => {
        assert(err instanceof S3Error)
        assert(lib.putS3.calledOnce)
        done()
      })
    })

    it('should put attachment to S3 and call next middleware', (done) => {
      sandbox.stub(lib, 'putS3', (body, file, cb) => cb(null, 'localhost'))
      const req = requestMock({ body: {} }, {})
      assert(!req.body.attachment)
      middleware.put(req, responseMock(), (err) => {
        assert.ifError(err)
        assert(lib.putS3.calledOnce)
        assert.equal(req.body.attachment, 'localhost')
        done()
      })
    })
  })
})
