// DataBase errors
class DBError extends Error {
  constructor(err) {
    super(err)
  }
}

class DBNotAvailable extends DBError {
  constructor() {
    super(new Error('DataBase is not available now'))
  }
}

class DBCollectionNotFound extends DBError {
  constructor(collectionName) {
    super(new Error(`DataBase collection '${collectionName}' not found`))
  }
}


// S3 errors
class S3Error extends Error {
  constructor(err) {
    super(err)
  }
}


class S3NotAvailable extends S3Error {
  constructor() {
    super(new Error('S3 is not available now'))
  }
}


class S3WriteError extends S3Error {
  constructor(message) {
    super(new Error(`S3 write error: ${message}`))
  }
}


class S3RequestTimeout extends S3Error {
  constructor() {
    super(new Error('Request has been aborted by timeout'))
  }
}


// Form validation errors
class InvalidFormError extends Error {
  constructor(err) {
    super(err)
  }
}

class InvalidFormDataObject extends InvalidFormError {
  constructor() {
    super(new Error('Invalid Form Data Object'))
  }
}

class InvalidFormDataFields extends InvalidFormError {
  constructor(invalidFields) {
    super(new Error(`Form Data contains invalid fields: ${invalidFields.join(', ')}`))
  }
}

// Resource errors
class NotFoundError extends Error {
  constructor(err) {
    super(err)
  }
}

class FormNotFound extends NotFoundError {
  constructor() {
    super(new Error('Form not found'))
  }
}


module.exports = {
  DBError, DBNotAvailable, DBCollectionNotFound,
  S3Error, S3NotAvailable, S3WriteError, S3RequestTimeout,
  InvalidFormError, InvalidFormDataObject, InvalidFormDataFields,
  NotFoundError, FormNotFound
}
