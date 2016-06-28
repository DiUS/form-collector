const assert = require('assert')
const { InvalidFormError, NotFoundError } = require('../src/lib/error')
const middleware = require('../src/middleware/error')


describe('Middleware Error', () => {


  describe('getStatus', () => {

    it('should return status 400 when InvalidFormError', () => {
      assert.equal(400, middleware._getStatus(new InvalidFormError()))
    })

    it('should return status 404 when NotFoundError', () => {
      assert.equal(404, middleware._getStatus(new NotFoundError()))
    })

    it('should return status 500 in general case', () => {
      assert.equal(500, middleware._getStatus(new Error()))
    })
  })
})