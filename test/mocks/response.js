class Response {
  constructor(send) {
    this.send = (typeof send === 'function') ? send : () => {}
  }

  status(statusCode) {
    this.statusCode = statusCode
    return this
  }
}


module.exports = (send) => new Response(send)
