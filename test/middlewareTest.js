const assert = require('assert')
const expressValidator = require('express-validator')
const _ = require('lodash')
const sinon = require('sinon')
const error = require('../src/lib/error')
const lib = require('../src/lib')
const middleware = require('../src/middleware')
const requestMock = require('./mocks/request')
const responseMock = require('./mocks/response')
const formsCollection = require('../dbseed/forms.collection')


describe('Middleware', () => {

  const formsFetchError = new Error('Forms Fetch Error')
  const formSaveError = new Error('Form cannot be saved')
  const formMock = Object.assign({}, formsCollection[0])
  let sandbox = null

  beforeEach(() => sandbox = sinon.sandbox.create())
  afterEach(() => sandbox.restore())

  describe('getForms', () => {

    it('should return paginated list of forms', (done) => {
      sandbox.stub(lib, 'getForms', (opts, cb) => cb(null, formsCollection))
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
        assert.deepEqual(err, formsFetchError)
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
      const send = (err) => {
        assert.deepEqual(err, { error: error.FormNotFound.message })
        done()
      }
      middleware.getFormById(requestMock(), responseMock(send), done)
    })

    it('should handle form fetching errors', (done) => {
      sandbox.stub(lib, 'getFormById', (id, cb) => cb(formsFetchError))
      middleware.getFormById(requestMock(), responseMock(), (err) => {
        assert.deepEqual(err, formsFetchError)
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
      sandbox.stub(lib, 'validateForm', () => error.InvalidFormDataObject)
      sandbox.spy(lib, 'saveForm')
      const send = (err) => {
        assert.deepEqual(err, { error: error.InvalidFormDataObject.message })
        assert(!lib.saveForm.called)
        done()
      }
      // middleware.createForm(requestMock(), responseMock(), (err) => {
      //   assert.deepEqual(err, error.InvalidFormDataObject)
      //   assert(!lib.saveForm.called)
      //   done()
      // })
      middleware.createForm(requestMock(), responseMock(send), done)
    })

    it('should handle form saving errors', (done) => {
      sandbox.stub(lib, 'validateForm', () => true)
      sandbox.stub(lib, 'saveForm', (fromData, cb) => cb(formSaveError))
      middleware.createForm(requestMock(), responseMock(), (err) => {
        assert.deepEqual(err, formSaveError)
        assert(lib.saveForm.calledOnce)
        done()
      })
    })
  })
})
