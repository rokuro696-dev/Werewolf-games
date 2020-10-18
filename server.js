const mediasoup = require('mediasoup');
const fs = require('fs');
const https = require('https');
const express = require('express');
const socketIO = require('socket.io');
const config = require('./config');
const { DataConsumer } = require('mediasoup/lib/types');
const peer = require('./peer.js');

// Global variables
let worker;
let webServer;
let socketServer;
let expressApp;
let mediasoupRouter;

let peers = new Map();

(async () => {
  try {
    await runExpressApp();
    await runWebServer();
    await runSocketServer();
    await runMediasoupWorker();
  } catch (err) {
    console.error(err);
  }
})();

async function runExpressApp() {
  expressApp = express();
  expressApp.use(express.json());
  expressApp.use(express.static(__dirname));

  expressApp.use((error, req, res, next) => {
    if (error) {
      console.warn('Express app error,', error.message);

      error.status = error.status || (error.name === 'TypeError' ? 400 : 500);

      res.statusMessage = error.message;
      res.status(error.status).send(String(error));
    } else {
      next();
    }
  });
}

async function runWebServer() {
  const { sslKey, sslCrt } = config;
  if (!fs.existsSync(sslKey) || !fs.existsSync(sslCrt)) {
    console.error('SSL files are not found. check your config.js file');
    process.exit(0);
  }
  const tls = {
    cert: fs.readFileSync(sslCrt),
    key: fs.readFileSync(sslKey),
  };
  webServer = https.createServer(tls, expressApp);
  webServer.on('error', (err) => {
    console.error('starting web server failed:', err.message);
  });

  await new Promise((resolve) => {
    const { listenIp, listenPort } = config;
    webServer.listen(listenPort, listenIp, () => {
      const listenIps = config.mediasoup.webRtcTransport.listenIps[0];
      const ip = listenIps.announcedIp || listenIps.ip;
      console.log('server is running');
      console.log(`open https://${ip}:${listenPort} in your web browser`);
      resolve();
    });
  });
}

async function runSocketServer() {
  socketServer = socketIO(webServer, {
    serveClient: false,
    path: '/server',
    log: false,
  });

  socketServer.on('connection', (socket) => {
    console.log('client connected');

    socket.on('join', ({name}, callback) =>{
      //regist peer 
      console.log('user joined :' + name)
      // if (!roomList.has(room_id)) {
      //     return cb({
      //         error: 'room does not exist'
      //     })
      // }
      addPeer(new peer(socket.id, name))

      // return room info
      callback()

    });

    socket.on('getProducers', () => {
      // send all the current producer to newly joined member
      // if (!roomList.has(socket.room_id)) return
      let producerList = getProducerListForPeer()

      socket.emit('newProducers', producerList)
    })


    socket.on('disconnect', () => {
      console.log('client disconnected');
    });

    socket.on('connect_error', (err) => {
      console.error('client connection error', err);
    });

    socket.on('getRouterRtpCapabilities', (data, callback) => {
      callback({
        data:mediasoupRouter.rtpCapabilities,
        // routerStatus:isCreatedRouter
      });
    });

    socket.on('createWebRtcTransport', async (_, callback) => {
      console.log(`create webrtc transport user: ${peers.get(socket.id).name}`);
      try {
          const {
              params
          } = await createWebRtcTransport(socket.id);
          callback(params);
      } catch (err) {
          console.error(err);
          callback({
              error: err.message
          });
      }
  });
    socket.on('connectTransport', async ({
      transport_id,
      dtlsParameters
  }, callback) => {
      console.log(`connect transport user: ${peers.get(socket.id).name}`)
      // if (!roomList.has(socket.room_id)) return
      await connectPeerTransport(socket.id, transport_id, dtlsParameters)
      
      callback('success')
  })

  

    socket.on('produce', async ({kind, rtpParameters, producerTransportId}, callback) => {
      // const {kind, rtpParameters} = data;
      // TODO refactor
      producer = await peers.get(socket.id).transports.get(producerTransportId).produce({ kind, rtpParameters });
      
      peers.get(socket.id).producers.set(producer.id, producer);

      console.log('created produce ' + producer.id + ' client id ' + socket.id);
      callback({ id: producer.id });

      // inform clients about new producer
      broadCast(socket, socket.id, 'newProducers', [{
        producer_id: producer.id ,
        producer_socket_id: socket.id
    }])
      // socket.broadcast.emit('newProducer', {
      //   id: producer.id
      // });
        
    });

    socket.on('consume', async ({consumerTransportId, producerId, rtpCapabilities}, callback) => {
      console.log('request consume produce ' + producerId + ' clientId ' + socket.id)
      // producer = producers[data.id]
      let param = await createConsumer(consumerTransportId, producerId, rtpCapabilities, socket.id);
      
      callback(param);
      //TODO consumerのクローズ処理を入れる
    });

    socket.on('resume', async (data, callback) => {
      // TODO リクエストしたIDごとにresumeすべきconsumerを選ぶようにする
      // for (var key in consumers){
      //   await consumers[key].resume();
      // };
      await consumer.resume();
      callback();
    });

    socket.on('checkProducer', async(data, callback) =>{
      ids = Object.keys(producers)
      console.log('response for new client ' + ids)
      callback({ids: ids});
    })
  });
}

async function runMediasoupWorker() {
  worker = await mediasoup.createWorker({
    logLevel: config.mediasoup.worker.logLevel,
    logTags: config.mediasoup.worker.logTags,
    rtcMinPort: config.mediasoup.worker.rtcMinPort,
    rtcMaxPort: config.mediasoup.worker.rtcMaxPort,
  });

  worker.on('died', () => {
    console.error('mediasoup worker died, exiting in 2 seconds... [pid:%d]', worker.pid);
    setTimeout(() => process.exit(1), 2000);
  });

  const mediaCodecs = config.mediasoup.router.mediaCodecs;
  mediasoupRouter = await worker.createRouter({ mediaCodecs });
}

async function createWebRtcTransport(socket_id) {
  const {
    maxIncomingBitrate,
    initialAvailableOutgoingBitrate
  } = config.mediasoup.webRtcTransport;

  const transport = await mediasoupRouter.createWebRtcTransport({
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

  peers.get(socket_id).transports.set(transport.id, transport)
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

async function connectPeerTransport(socket_id, transport_id, dtlsParameters){
  await peers.get(socket_id).transports.get(transport_id).connect({
      dtlsParameters: dtlsParameters
  });
}

async function createConsumer(consumer_transport_id, producer_id, rtpCapabilities, socket_id) {
  if (!mediasoupRouter.canConsume(
    {
      producerId: producer_id,
      rtpCapabilities,
    })
  ) {
    console.error('can not consume');
    return;
  }
  let consumerTransport = peers.get(socket_id).transports.get(consumer_transport_id)
  let consumer = null

  try {
    consumer = await consumerTransport.consume({
      producerId: producer_id,
      rtpCapabilities,
      paused: false
      // paused: producer.kind === 'video',
    });
    console.log('create new consumer  for producer ' + producer_id +  'consumerId ' +  consumer.id + ' client Id ' + socket_id);

    peers.get(socket_id).consumers.set(consumer.id, consumer)
  } catch (error) {
    console.error('consume failed', error);
    return;
  }

  if (consumer.type === 'simulcast') {
    await consumer.setPreferredLayers({ spatialLayer: 2, temporalLayer: 2 });
  }


  return {
    producerId: producer_id,
    id: consumer.id,
    kind: consumer.kind,
    rtpParameters: consumer.rtpParameters,
    type: consumer.type,
    producerPaused: consumer.producerPaused
  }
}

function addPeer(peer){
  peers.set(peer.id, peer)
}


function getProducerListForPeer() {
  let producerList = []
  peers.forEach(peer => {
      peer.producers.forEach(producer => {
          producerList.push({
              producer_id: producer.id
          })
      })
  })
  return producerList
  
}

function broadCast(socket, socket_id, name, data){
  for (let otherID of Array.from(peers.keys()).filter(id => id !== socket_id)) {
    socketServer.to(otherID).emit(name, data)
  }
}