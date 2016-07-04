class Request {
  constructor(payload, attachment) {
    const _payload = payload || {}
    this.query = _payload.query || {}
    this.params = _payload.params || {}
    this.body = _payload.body || {}
    this.file = attachment
  }
}


module.exports = (payload, attachment) => new Request(payload, attachment)
