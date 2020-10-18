const mediasoup = require('mediasoup-client');
const socketClient = require('socket.io-client');
const socketPromise = require('./lib/socket.io-promise').promise;
const config = require('./config');
const uuid = require('uuid');

const hostname = window.location.hostname;

const mediaType = {
  audio: 'audioType',
  video: 'videoType'
}

let device;
let socket;
let ownProducerId;

let producers = new Map();
let consumers = new Map();

let producerTransport;
let consumerTransport;

let consumeVideoDoms = {};


if (typeof navigator.mediaDevices.getDisplayMedia === 'undefined') {
  //TODO: media のサポートが内場合のエラー出力処理
}

// web loaded
window.addEventListener("load", function () {
  console.log("Page load, connect WebSocket");
  try{
    connect();

  } catch (err){
    console.error(err);
  }
  
  if ("adapter" in window) {
    console.log(
      // eslint-disable-next-line no-undef
      `webrtc-adapter loaded, browser: '${adapter.browserDetails.browser}', version: '${adapter.browserDetails.version}'`
    );
  } else {
    console.warn("webrtc-adapter is not loaded! an install or config issue?");
  }
});

// assign DOMS when enable audio
// await publish(mediatype.audio);  
let user = 'test_user'; //get user name from dom


async function connect(){
  const opts = {
    path: '/server',
    transports: ['websocket'],
  };

  const serverUrl = `https://${hostname}:${config.listenPort}`;
  socket = socketClient(serverUrl, opts);
  socket.request = socketPromise(socket);

  await joinRoom(user);
  initSocket();
}

async function joinRoom(user){
  socket.request('join', {
    user //change name user
    // room_id
  }).then(async function (e) {
      console.log(e)
      const data = await socket.request('getRouterRtpCapabilities');
      await loadDevice(data.data)
      await initTransports(device)
      socket.emit('getProducers')

      publish(mediaType.video);
  }).catch(e => {
      console.log(e)
  })

}


async function initTransports(device){
  // init producerTransport
  {
    const data = await socket.request('createWebRtcTransport', {
        forceTcp: false,
        rtpCapabilities: device.rtpCapabilities,
    })
    if (data.error) {
        console.error(data.error);
        return;
    }

    producerTransport = device.createSendTransport(data);

    producerTransport.on('connect', async function ({
        dtlsParameters
    }, callback, errback) {
        socket.request('connectTransport', {
                dtlsParameters,
                transport_id: data.id
            })
            .then(callback)
            .catch(errback)
    });

    producerTransport.on('produce', async function ({
        kind,
        rtpParameters
    }, callback, errback) {
        try {
            const {
                producer_id
            } = await socket.request('produce', {
                producerTransportId: producerTransport.id,
                kind,
                rtpParameters,
            });
            callback({
                id: producer_id
            });
        } catch (err) {
            errback(err);
        }
    });

    producerTransport.on('connectionstatechange', function (state) {
        switch (state) {
            case 'connecting':

                break;

            case 'connected':
                //localVideo.srcObject = stream
                break;

            case 'failed':
                producerTransport.close();
                break;

            default:
                break;
        }
    });
}

// init consumerTransport
{
    const data = await socket.request('createWebRtcTransport', {
        forceTcp: false,
    });
    if (data.error) {
        console.error(data.error);
        return;
    }

    // only one needed
    consumerTransport = device.createRecvTransport(data);
    consumerTransport.on('connect', function ({
        dtlsParameters
    }, callback, errback) {
        socket.request('connectTransport', {
                transport_id: consumerTransport.id,
                dtlsParameters
            })
            .then(callback)
            .catch(errback);
    });

    consumerTransport.on('connectionstatechange', async function (state) {
        switch (state) {
            case 'connecting':
                break;

            case 'connected':
                //remoteVideo.srcObject = await stream;
                //await socket.request('resume');
                break;

            case 'failed':
                consumerTransport.close();
                break;

            default:
                break;
        }
    });
}
}

async function initSocket() {
 
  socket.on('disconnect', () => {
    //接続切断処理 エラー出力を画面側でするとよいかも
  });

  socket.on('connect_error', (error) => {
    console.error('could not connect to %s%s (%s)', serverUrl, opts.path, error.message);
  });

  socket.on('newProducers', (data) => {
    // console.log('new producer data ' + data)

    for (let {producer_id} of data) {
      console.log('new producer data ' + producer_id)
      subscribe(producer_id)
    }
  });
}


async function loadDevice(routerRtpCapabilities) {
  try {
    device = new mediasoup.Device();
  } catch (error) {
    if (error.name === 'UnsupportedError') {
      console.error('browser not supported');
    }
  }
  await device.load({ routerRtpCapabilities });
}



async function publish(type) {
  let mediaConstraints = {}

  let audio = false
  switch (type) {
      case mediaType.audio:
          mediaConstraints = {
              // audio: {
              //     deviceId: deviceId
              // },
              audio: true,
              video: false
          }
          audio = true
          break
      case mediaType.video:
          mediaConstraints = {
              audio: false,
              video: true,
              // video: {
              //     width: {
              //         min: 640,
              //         ideal: 1920
              //     },
              //     height: {
              //         min: 400,
              //         ideal: 1080
              //     },
                  // deviceId: deviceId
                  /*aspectRatio: {
                      ideal: 1.7777777778
                  }*/
              // }
          }
          break
      default:
          return
  }

  if (!device.canProduce('video') && !audio) {
      console.error('cannot produce video');
      return;
  }
    
  let stream;

  try {
    stream = await getUserMedia(producerTransport, mediaConstraints);
    const track = audio ? stream.getAudioTracks()[0] : stream.getVideoTracks()[0]
    const params = { track };

    if (!audio) {
        params.encodings = [{
                rid: 'r0',
                maxBitrate: 100000,
                //scaleResolutionDownBy: 10.0,
                scalabilityMode: 'S1T3'
            },
            {
                rid: 'r1',
                maxBitrate: 300000,
                scalabilityMode: 'S1T3'
            },
            {
                rid: 'r2',
                maxBitrate: 900000,
                scalabilityMode: 'S1T3'
            }
        ];
        params.codecOptions = {
            videoGoogleStartBitrate: 1000
        };
    }
  
    producer = await producerTransport.produce(params);
    producers.set(producer.id, producer)


    let elem
    if (!audio) {
        elem = document.querySelector('#myVideo')
        // elem = document.createElement('video')
        elem.srcObject = stream
        elem.id = producer.id
        // elem.playsinline = false
        // elem.autoplay = true
        // elem.className = "vid"
        // localMediaEl.appendChild(elem)
    }
  } catch (err) {
    console.log('[ERROR] producer cannot create')
  }
}



async function getUserMedia(transport, mediaConstraints) {
  if (!device.canProduce('video')) {
    console.error('cannot produce video');
    return;
  }

  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
  } catch (err) {
    console.error('getUserMedia() failed:', err.message);
    throw err;
  }
  return stream;
}





async function subscribe(producer_id) {

  consume(producer_id).then(function ({
      consumer,
      stream,
      kind
  }) {

      // console.log(`received consumer info ${consumer.id}, kind ${kind}`)

      consumers.set(consumer.id, consumer)

      let elem;
      if (kind === 'video') {
        // TODO: ここでDOMを追加していく処理をいれる
        domsTag = '#myVideo' + (Object.keys(consumeVideoDoms).length + 2)
        console.log(domsTag)
        consumeVideoDoms[consumer.id] = domsTag;

        elem = document.querySelector(domsTag)

        elem.srcObject = stream
        elem.id = consumer.id
        // elem.playsinline = false
        // elem.autoplay = true
        // elem.className = "vid"
      } else {
          elem = document.createElement('audio')
          elem.srcObject = stream
          elem.id = consumer.id
          elem.playsinline = false
          elem.autoplay = true
          remoteAudioEl.appendChild(elem)
      }

      consumer.on('trackended', function () {
          removeConsumer(consumer.id)
      })
      consumer.on('transportclose', function () {
          removeConsumer(consumer.id)
      })
  })
}

async function consume(reqeustProducerId) {
  // console.log('start request consume. producer id ' +reqeustProducerId);
  const { rtpCapabilities } = device;
  const data = await socket.request('consume', { 
    consumerTransportId: consumerTransport.id,
    producerId: reqeustProducerId,
    rtpCapabilities });
  const {
    producerId,
    id,
    kind,
    rtpParameters,
  } = data;

  console.log(`returned consumer id : ${id} producer id: ${producerId}`)

  let codecOptions = {};
  const consumer = await consumerTransport.consume({
    id,
    producerId,
    kind,
    rtpParameters,
    codecOptions,
  });


  const stream = new MediaStream();
  stream.addTrack(consumer.track);

  // return stream;
  return {
    consumer,
    stream,
    kind
  };
}
