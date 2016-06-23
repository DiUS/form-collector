const assert = require('assert')


describe('Library', () => {


  describe('getForms', () => {

    it('should return list of forms')
    it('should support filtering')
    it('should support pagination')
    it('should throw error when database is not available')

  })


  describe('getFormById', () => {

    it('should return form by id')
    it('should return NULL when form not found by id')
    it('should throw error when database is not available')

  })


  describe('validateForm', () => {

    it('should successfully validate form')
    // please add tests of validation rules bellow

  })


  describe('saveForm', () => {

    it('should successfully save form data and return form entity')
    it('should throw error when database is not available')
    it('should throw error when file storage (S3) is not available')

  })
})
