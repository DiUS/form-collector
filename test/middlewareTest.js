const assert = require('assert')
const expressValidator = require('express-validator')
const _ = require('lodash')
const sinon = require('sinon')
const { DBError, InvalidFormDataObject, FormNotFound } = require('../src/lib/error')
const lib = require('../src/lib')
const middleware = require('../src/middleware')
const requestMock = require('./mocks/request')
const responseMock = require('./mocks/response')
const forms = require('../docker/dbseed/forms.collection')


describe('Middleware', () => {

  const formsFetchError = new DBError('Forms Fetch Error')
  const formSaveError = new DBError('Form cannot be saved')
  const formMock = Object.assign({}, forms[0])
  let sandbox = null

  beforeEach(() => sandbox = sinon.sandbox.create())
  afterEach(() => sandbox.restore())

  describe('getForms', () => {

    it('should return paginated list of forms', (done) => {
      sandbox.stub(lib, 'getForms', (opts, cb) => cb(null, forms))
      const req = requestMock()
      const res = {
        send: (forms) => {
          assert(lib.getForms.calledOnce)
          assert(!_.isEmpty(forms))
          done()
        }
      }
      middleware.getForms(req, res, done)
    })

    it('should navigate by pages')
    it('should support filtering')

    it('should handle forms fetching errors', (done) => {
      sandbox.stub(lib, 'getForms', (opts, cb) => cb(formsFetchError))
      middleware.getForms(requestMock(), {}, (err) => {
        assert(err instanceof DBError)
        assert(lib.getForms.calledOnce)
        done()
      })
    })
  })


  describe('getFormById', () => {

    it('should return form by id', (done) => {
      sandbox.stub(lib, 'getFormById', (id, cb) => cb(null, formMock))
      const send = (form) => {
        assert(lib.getFormById.calledOnce)
        assert.deepEqual(form, formMock)
        done()
      }
      middleware.getFormById(requestMock(), responseMock(send), done)
    })

    it('should return error when form not found', (done) => {
      sandbox.stub(lib, 'getFormById', (id, cb) => cb(null, null))
      middleware.getFormById(requestMock(), responseMock(), (err) => {
        assert(err instanceof FormNotFound)
        done()
      })
    })

    it('should handle form fetching errors', (done) => {
      sandbox.stub(lib, 'getFormById', (id, cb) => cb(formsFetchError))
      middleware.getFormById(requestMock(), responseMock(), (err) => {
        assert(err instanceof DBError)
        assert(lib.getFormById.calledOnce)
        done()
      })
    })
  })


  describe('sanitizeForm', () => {

    it('should sanitize form data', (done) => {
      const req = requestMock({ body: { firstName: ' John  ', lastName: '  Smith ' } })
      expressValidator()(req, {}, _.noop)
      middleware.sanitizeForm(req, responseMock(), (err) => {
        assert.ifError(err)
        assert.equal(req.body.firstName, 'John')
        assert.equal(req.body.lastName, 'Smith')
        done()
      })
    })
  })


  describe('createForm', () => {

    it('should successfully create form and return form entity', (done) => {
      sandbox.stub(lib, 'validateForm', () => true)
      sandbox.stub(lib, 'saveForm', (fromData, cb) => cb(null, formMock))
      const send = (newForm) => {
        assert(lib.saveForm.calledOnce)
        assert.deepEqual(newForm, formMock)
        done()
      }
      middleware.createForm(requestMock({ body: formMock }), responseMock(send), done)
    })

    it('should handle form validation errors', (done) => {
      sandbox.stub(lib, 'validateForm', () => new InvalidFormDataObject())
      sandbox.spy(lib, 'saveForm')
      middleware.createForm(requestMock(), responseMock(), (err) => {
        assert(err instanceof InvalidFormDataObject)
        assert(!lib.saveForm.called)
        done()
      })
    })

    it('should handle server side errors', (done) => {
      sandbox.stub(lib, 'validateForm', () => true)
      sandbox.stub(lib, 'saveForm', (fromData, cb) => cb(formSaveError))
      middleware.createForm(requestMock(), responseMock(), (err) => {
        assert(err instanceof DBError)
        assert(lib.saveForm.calledOnce)
        done()
      })
    })
  })
})
