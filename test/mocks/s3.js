const EventEmitter = require('events')


class S3Request extends EventEmitter {
  constructor() {
    super()
    this.url = 'localhost'
  }

  end() {}
}


class S3 {
  constructor() {
    this.request = new S3Request()
  }

  put() {
    return this.request
  }
}


module.exports = () => new S3()
