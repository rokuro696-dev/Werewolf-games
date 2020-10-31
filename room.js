const config = require('./config');
const Peer = require('./peer.js');

module.exports = class Room {
    constructor(worker, roomName) {
        this.roomName = roomName
        this.peers = new Map()

        // create router
        const mediaCodecs = config.mediasoup.router.mediaCodecs;

        worker.createRouter({ mediaCodecs }).then(function(router){
            console.log(`router : ${router}`)
            this.router = router
        }.bind(this));

    }


    setRouter(router){
        this.router = router;
    }

    addPeer(socketId, userName) {
        let peer = new Peer(socketId, userName);
        this.peers.set(peer.id, peer);
    }

    getPeer(socketId){
        return this.peers.get(socketId);
    }

    getPeers(){
        return this.peers
    }


    getRouterRtpCapabilities(){
        console.log(`${this.router}`)
        return this.router.rtpCapabilities;
    }



    async createTransport(socketId) {
        // create transport within room 
        const {
            maxIncomingBitrate,
            initialAvailableOutgoingBitrate
        } = config.mediasoup.webRtcTransport;

        const transport = await this.router.createWebRtcTransport({
            listenIps: config.mediasoup.webRtcTransport.listenIps, //TODO assign client Ips
            enableUdp: true,
            enableTcp: true,
            preferUdp: true,
            initialAvailableOutgoingBitrate,
        });
        if (maxIncomingBitrate) {
            try {
                await transport.setMaxIncomingBitrate(maxIncomingBitrate);
            } catch (error) {
            }
        }

        this.peers.get(socketId).setTransport(transport.id, transport)
        return {
            transport,
            params: {
                id: transport.id,
                iceParameters: transport.iceParameters,
                iceCandidates: transport.iceCandidates,
                dtlsParameters: transport.dtlsParameters
            },
        };
    }

    async connectTransport(socketId, transportId, dtlsParameters) {
        //connect transpoert 
        await this.peers.get(socketId).getTransport(transportId).connect({
            dtlsParameters: dtlsParameters
        });
    }

    async produceProcess(kind, rtpParameters, producerTransportId, socketId){
        //get producer process
        let peer = this.peers.get(socketId);
        let producer = await peer.getTransport(producerTransportId).produce({ kind, rtpParameters });
        peer.setProducer(producer.id, producer);

        return producer.id
    }

    async consumeProcess(consumerTransportId, producerId, rtpCapabilities, socketId){
        //get consumer process

        if (!this.router.canConsume(
            {
              producerId: producerId,
              rtpCapabilities,
            })
          ) {
            console.error('can not consume');
            return;
          }
    
          //create consumer
          let peer = this.peers.get(socketId);
          let param = await peer.createConsumer(consumerTransportId, producerId, rtpCapabilities);

          return param


    }

    getProducerListForPeer() {
        // get pruducers of all peers in romm 

        let producerList = []
        this.peers.forEach(peer => {
            peer.producers.forEach(producer => {
                producerList.push({
                    producer_id: producer.id
                })
            })
        })
        return producerList
    }



}