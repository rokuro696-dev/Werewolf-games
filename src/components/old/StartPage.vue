<template>

    <html lang="ja">
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <!-- Vue.js -->
            <!-- CDNはいらないかも、なのでいったんコメントアウト -->
                <!-- <script src="https://cdn.jsdelivr.net/npm/vue"></script> -->
            <link rel="manifest" href="manifest.json">
            <link rel="stylesheet" type="text/css" href="Rohkuroh.css">
            <title>Vue-PWA 1</title>
        </head>
        <body>
        <div class="full-page">
            <h2>ゲームを始めます</h2>

            <div>
                <span>
                    <video class="video" id="myVideo" autoplay controls></video>
                </span>
                <span>
                    <video class="video" id="myVideo2" autoplay controls></video>
                </span>
            </div>
            <div>
                <span>
                    <video class="video" id="myVideo3" autoplay controls></video>
                </span>
                <span>
                    <video class="video" id="myVideo4" autoplay controls></video>
                </span>
            </div>
            <div v-if="this.gameState === 'preparation'">
             <button v-on:click="startGame">ゲームを開始</button>
            </div>
            
        </div>
        </body>
    </html>

</template>

<script>
    import Borad.vue from " ./Borad.vue";
    export default {

    }


    <!-- // 動画を流す準備 -->
    var video = document.getElementById("myVideo");
    var webcamStream;
    <!-- // gerUserMediaによるカメラ映像の取得 -->
    var media = navigator.mediaDevices.getUserMedia({
        video: true, 
        <!-- // ビデオを取得する
        // 使うカメラをインカメラか背面カメラかを指定する場合は下記 -->
        // video: { facingMode: "environment"} // 背面カメラ
        // video: { facingMode: "user"} // インカメラ
        audio: false, 
        <!-- // 音声が必要な場合はtrue -->
    });

    window.onload = function () {
            <!-- // リアルタイムに再生（ストリーミング）させる -->
            media.then((stream) => {
                video.srcObject = stream;
            })
        }

        <!-- // service workerの登録関係 -->
    if ("serviceWorker" in navigator){
        navigator.serviceWorker.register("service_worker.js")
            .then(function(registration){
                console.log("ServiceWorker registration successful with scope", registration.scope);
            }).catch(function(err) {
                console.log("ServiceWorker registration failed: ", err);
            });
    }

            
</script>

<style>
    .full-page {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: -webkit-linear-gradient(top right, #336B87, #90AFC5);
    }

    .video {
        width: 50%;
        max-width: 400px;
        height: 50%;
        max-height: 200px;
        padding: 5px;
      
        background: #d3d3d3;
        border-style: outset;
        border-color: #C4DFE6;
        border-width: thick;
        background: -webkit-linear-gradient(top right, #336B87, #90AFC5);
      }
      
      .nextPage {
        display: inline-block;
        background: #336B87;
        margin-top: 20px;
        margin-bottom: 20px;
        padding: 10px 20px;
        width: 10em;
        height: 1.5em;
        font-size: 24px;
        text-decoration: none;
        color: #FFFFFF;
        transition: .4s;
        border-style: outset;
        border-color: #C4DFE6;
      
      }
</style>