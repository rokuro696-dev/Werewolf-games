const mediasoup = require('mediasoup');
const fs = require('fs');
const https = require('https');
const express = require('express');
const socketIO = require('socket.io');
const config = require('./config');
const { DataConsumer } = require('mediasoup/lib/types');
const Room = require('./room.js')
// const peer = require('./peer.js');


// Global variables
let worker;
let webServer;
let socketServer;
let expressApp;
// let mediasoupRouter;

// let peers = new Map();
let roomList = new Map();

(async () => {
  try {
    await runExpressApp();
    await runWebServer();
    await runMediasoupWorker();
    await runSocketServer();
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


    socket.on('createRoom', async({ roomName }, callback) => {
      console.log(`recieved request of creating room. room name: ${roomName}`)
      if (roomList.has(roomName)) {
        console.log('room created')
        callback('created')
        return
      }

      room = new Room(worker, roomName);
      roomList.set(roomName, room)

      callback('success')

    });

    socket.on('join', ({ user, roomName }, callback) => {
      //regist peer 
      console.log(`user joined : ${user}`)
      if (!roomList.has(roomName)) {
        return callback({
          error: 'room does not exist'
        })
      }
      let room = roomList.get(roomName);
      room.addPeer(socket.id, user)
      socket.roomId = roomName

      // return room info
      callback()

    });

    socket.on('getProducers', () => {
      // send all the current producer to newly joined member
      if (!roomList.has(socket.roomId)) return
      room = roomList.get(socket.roomId);
      let producerList = room.getProducerListForPeer()

      socket.emit('newProducers', producerList)
    })


    socket.on('disconnect', () => {
      console.log('client disconnected');
    });

    socket.on('connect_error', (err) => {
      console.error('client connection error', err);
    });

    socket.on('getRouterRtpCapabilities', (data, callback) => {
      room = roomList.get(socket.roomId);
      console.log(`getRouterCapabilities ${socket.roomId}`)
      rtpCapabilities = room.getRouterRtpCapabilities();
      console.log(`capabilitis ${rtpCapabilities}`)

      callback(rtpCapabilities);

    });

    socket.on('createWebRtcTransport', async (_, callback) => {
      console.log(`create webrtc transport user: ${socket.id}`);
      room = roomList.get(socket.roomId);
      try {
        const {
          params
        } = await room.createTransport(socket.id);
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
      console.log(`connect transport user: ${socket.id}`)
      // if (!roomList.has(socket.room_id)) return
      room = roomList.get(socket.roomId);
      await room.connectTransport(socket.id, transport_id, dtlsParameters)

      callback('success')
    })


    socket.on('produce', async ({ kind, rtpParameters, producerTransportId }, callback) => {
      // create producer
      room = roomList.get(socket.roomId);
      producerId = await room.produceProcess(kind, rtpParameters, producerTransportId, socket.id)

      console.log('created produce ' + producerId + ' client id ' + socket.id);

      callback({ id: producerId });

      // inform clients about new producer
      broadCast(socket, socket.id, 'newProducers', [{
        producer_id: producerId,
        producer_socket_id: socket.id
      }])

    });

    socket.on('consume', async ({ consumerTransportId, producerId, rtpCapabilities }, callback) => {
      console.log('request consume produce ' + producerId + ' clientId ' + socket.id)
      room = roomList.get(socket.roomId);
      let param = await room.consumeProcess(consumerTransportId, producerId, rtpCapabilities, socket.id)

      callback(param);
    });

    socket.on('resume', async (data, callback) => {
      // TODO リクエストしたIDごとにresumeすべきconsumerを選ぶようにする
      callback();
    });

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
}

function broadCast(socket, socket_id, name, data) {
  room = roomList.get(socket.roomId);
  peers = room.getPeers()
  for (let otherID of Array.from(peers.keys()).filter(id => id !== socket_id)) {
    socketServer.to(otherID).emit(name, data)
  }
}
