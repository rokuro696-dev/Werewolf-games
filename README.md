# Werewolf-games

## WEB-RTC (team-3)

### 使い方
最初にSSL通信向けの公開鍵と秘密鍵のペアを用意

#### 設定の変更
起動する環境に合わせて `config.js` を設定する

```
vi config.js
```

#### mediasoup関連のパッケージのインストール
```
npm install
```

#### サーバーの起動
```
npm start
```
### ファイル説明

* etc_client.js
    * 初期接続要求(SSL証明書必須)
    * socket.io エンドポイント起動とスタンバイ
    * ルーター情報の取得とローカルメディアへの登録
    * 新規参加者イベント時のComsumer
    * 新規参加者が参加した場合の `mediasoup.Comsumer` の立ち上げ  

* init.js
    * サーバーの初期起動(HTTPS, sokcet.io)
    * socket.io 起動準備
    * mediasoup の `Worker` 立ち上げ
    * Roomオブジェクトの作成

* room.js
    * Roomオブジェクトの初期化
    * 参加者情報の発行
    * Roomに紐づくデータの管理
     * 参加者情報
     * router
     * ルーム名 (ID)
    * (暫定) producerの発行 (Peerに移行予定)

* peer.js
    * Peerオブジェクトの初期化
    * 参加者に紐づくデータの管理
        * transport
        * pruducer
        * consumer
    * 参加者と紐づくProducerの発行 (将来的にこちらに移行予定)
    * 参加者が依頼したConsumerの発行