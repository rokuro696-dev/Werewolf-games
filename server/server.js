var express = require("express");
var socket = require("socket.io");
var serveIndex = require("serve-index");

var app = express();
var port_client = 9080;
var port_server = 9090;

// 静的ホスティング
app
  .use(express.static("..public"))
  .use(serveIndex("../public", { icons: true }))
  .listen(process.env.PORT || port_client);

// WebSocket
const server = app.listen(port_server, function () {
  console.log("server running on port 9090");
});
const io = socket(server);

io.on("connection", (socket) => {
  socket.on("ENTER-ROOM", function (data) {
    console.log(
      "プレイヤー [" +
      data.playerName +
      "] が [" +
      data.roomName +
      "] に入場しました。" +
      socket.id
    );
    socket.join(data.roomName);
    socket.to(data.roomName).broadcast.emit("USER-ENTERED", data);

    socket.on("PASS-PLAYERS", function (data) {
      socket.to(data.roomName).broadcast.emit("PASS-PLAYERS", data.players);
    });

    socket.on("PASS-GAMESTATE", function (data) {
      const gameState = data.gameState;
      socket.to(data.roomName).broadcast.emit("PASS-GAMESTATE", { gameState });
    });

    socket.on("disconnect", () => {
      socket
        .to(data.roomName)
        .broadcast.emit("USER-DISCONNECTED", data.playerName);
    });

    // 役職割当
    socket.on("ASSIGN-ROLES", function (data) {
      socket.to(data.roomName).broadcast.emit("ROLES-ASSIGNED", data.players);
    });

    // ゲームスタート
    socket.on("START-GAME", function (data) {
      socket.to(data.roomName).broadcast.emit("GAME-STARTED", data.gameState);
    });

    // ターン進行
    socket.on("CHANGE-GAMESTATE", function (data) {
      socket
        .to(data.roomName)
        .broadcast.emit("GAMESTATE-CHANGED", data.gameState);
    });

    // 投票
    socket.on("PLAYER-VOTE", function (data) {
      let targetId = data.targetId;
      let voterId = data.voterId;
      console.log("PLAYER-VOTE＞投票状況共有＞PLAYER-VOTED");
      socket
        .to(data.roomName)
        .broadcast.emit("PLAYER-VOTED", { targetId, voterId });
    });

    // 投票結果
    socket.on("EXECUTE-RESULT", function (data) {
      let targetId = data.targetId;
      let voterId = data.voterId;
      socket
        .to(data.roomName)
        .broadcast.emit("EXECUTE-RESULT", { targetId, voterId });
    });

    // 襲撃
    socket.on("WEREWOLF-ATTACK", function (data) {
      let targetId = data.targetId;
      let wolfId = data.wolfId;
      socket
        .to(data.roomName)
        .broadcast.emit("WEREWOLF-ATTACKED", { targetId, wolfId });
    });

    // 襲撃結果
    socket.on("ATTACK-RESULT", function (data) {
      let targetId = data.targetId;
      let wolfId = data.wolfId;
      socket
        .to(data.roomName)
        .broadcast.emit("ATTACK-RESULT", { targetId, wolfId });
    });

    // 襲撃再投票
    socket.on("WEREWOLF-REVOTE", function (data) {
      socket.to(data.roomName).broadcast.emit("WEREWOLF-REVOTE");
    });
  });
});
