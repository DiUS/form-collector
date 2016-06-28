class Request {
  constructor(payload) {
    const _payload = payload || {}
    this.query = _payload.query || {}
    this.params = _payload.params || {}
    this.body = _payload.body || {}
  }
}


module.exports = (payload) => new Request(payload)
