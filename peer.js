module.exports = class Peer {
  constructor(socket_id, name) {
      this.id = socket_id
      this.name = name
      this.transports = new Map()
      this.consumers = new Map()
      this.producers = new Map()
  }

  // getter と setterの追加

}