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
    * (A.I.)新規参加者が参加した場合の `mediasoup.Comsumer` の立ち上げ  

* server.js
    * サーバーの初期起動(HTTPS, sokcet.io)
    * socket.io 起動準備
    * mediasoup の `Worker` 立ち上げ
    * `mediasoup.Producer` の送付
    * `mediasoup.Comsumer` 要求の受け取り、作成、送付