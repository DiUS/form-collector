const assert = require('assert')
const sinon = require('sinon')
const ds = require('../src/lib/data_source')
const lib = require('../src/lib')


describe('Library', () => {

  let sandbox = null

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('getForms', () => {

    it('should return list of forms')
    it('should support filtering')
    it('should support pagination')
    it('should return error when DB is not available')
  })


  describe('getFormById', () => {

    it('should return form by id')
    it('should return NULL when form not found by id')
    it('should return error when DB is not available')
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
