const assert = require('assert')
const request = require('supertest')


describe('API', () => {


  describe('GET /', () => {

    it('should response `200` and return a list of found forms')
    it('should response `500` and return server side error information')

  })


  describe('GET /:id', () => {

    it('should response `200` and return form data')
    it('should response `404` and return client error (form not found by id)')
    it('should response `500` and return server side error information')

  })


  describe('POST /', () => {

    it('should response `201` and return created form data')
    it('should response `400` and return client error (e.g. form valiedation error)')
    it('should response `500` and return server side error information')

  })
})
