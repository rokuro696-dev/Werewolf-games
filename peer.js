module.exports = class Peer {
  constructor(socketId, name) {
    this.id = socketId
    this.name = name
    this.transports = new Map()
    this.consumers = new Map()
    this.producers = new Map()
  }

  // Peer配下のCRUDは基本こちらで定義する

  setTransport(id, transport) {
    this.transports.set(id, transport);
  }

  getTransport(id) {
    return this.transports.get(id);
  }

  setProducer(id, producer) {
    this.producers.set(id, producer);
  }

  setConsumer(id, consumer) {
    this.consumer.set(id, consumer);
  }


  async createConsumer(consumerTransportId, producerId, rtpCapabilities) {

    let consumerTransport = this.transports.get(consumerTransportId)
    let consumer = null

    try {
      consumer = await consumerTransport.consume({
        producerId: producerId,
        rtpCapabilities,
        paused: false
        // paused: producer.kind === 'video',
      });
      console.log(`create new consumer for producer: ${producerId} consumerId: ${consumer.id} client Id: ${this.id}`);

      this.consumers.set(consumer.id, consumer)
    } catch (error) {
      console.error('consume failed', error);
      return;
    }

    if (consumer.type === 'simulcast') {
      await consumer.setPreferredLayers({ spatialLayer: 2, temporalLayer: 2 });
    }

    return {
      producerId: producerId,
      id: consumer.id,
      kind: consumer.kind,
      rtpParameters: consumer.rtpParameters,
      type: consumer.type,
      producerPaused: consumer.producerPaused
    }
  }
}