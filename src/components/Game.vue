<template>
  <div class="game">
    <Board
      :players="players"
      :gameState="gameState"
      :id="id"
      @attack="attack"
      @protect="protect"
      @check="check"
    />
    <div v-if="this.gameState === 'preparation'">
      <button button v-on:click="assignRoles">Assign Roles</button>
    </div>
    <div v-if="this.gameState === 'preparation'">
      <button v-on:click="startGame">ゲームを開始</button>
    </div>
    <div v-else>
      <button v-on:click="changeGameState">次のターンに進む</button>
    </div>
    <div>現在は {{ this.gameState }}</div>
  </div>
</template>

<script>
import Board from "./Board";
import io from "socket.io-client";

export default {
  name: "Game",
  components: {
    Board,
  },
  props: {
    id: String,
    roomName: String,
    playerName: String,
  },
  data() {
    return {
      socket: io("localhost:9090"),
      gameState: "preparation",
      players: [
        /*
        id: String (プレイヤーID)
        name: String (プレイヤー名)
        role: String (役職、デフォルトは空文字)
        status: String (ゲーム上でのステータス)
        type: String (プレイヤーが"あなた"か他の人か)
        */
      ],
      type: "you",
      attackCandidates: [],
    };
  },
  // 入室処理全般
  created() {
    const roomName = this.roomName;
    const playerName = this.playerName;
    const id = this.id;

    // 部屋に入る
    this.socket.emit("ENTER-ROOM", { roomName, playerName, id });
    // プレイヤーリストを取得
    this.socket.on("PASS-PLAYERS", (players) => {
      this.players = players;
    });
    // プレイヤーリストに自分自身が含まれているか確認
    let playerIndex = this.players.findIndex(
      (player) => player.name === this.playerName
    );
    if (!playerIndex > -1) {
      // 含まれていなければ"自分"を自身のプレイヤーリストに追加
      const you = {
        id: this.id,
        name: this.playerName,
        role: "",
        status: "alive",
        type: "you",
      };
      this.addPlayer(you);
    } else {
      // 含まれていれば、typeを"you"に変更し、他のプレイヤーは"other"に変更
      this.players.forEach((player) => {
        if (player.name === this.playerName) {
          player.type = "you";
          player.id = this.id;
        } else player.type = "other";
      });
    }
    // ゲーム状態を取得
    this.socket.on("PASS-GAMESTATE", (data) => {
      this.gameState = data.gameState;
    });
  },
  mounted() {
    this.socket.on("USER-ENTERED", (data) => {
      if (!this.players.some((player) => player.name === data.playerName)) {
        const newPlayer = {
          id: data.id,
          name: data.playerName,
          role: "",
          status: "alive",
        };
        this.addPlayer(newPlayer);
      }
      const players = this.players;
      const roomName = this.roomName;
      const gameState = this.gameState;

      this.socket.emit("PASS-PLAYERS", { roomName, players });
      this.socket.emit("PASS-GAMESTATE", { roomName, gameState });
    });

    // サーバーからプレイヤーの役割が与えられたら、更新する
    this.socket.on("ROLES-ASSIGNED", (playerList) => {
      playerList.forEach((obj) => {
        this.players.find((player) => player.name === obj.name).role = obj.role;
      });
    });

    // ゲームスタート
    this.socket.on("GAME-STARTED", (gameState) => {
      this.gameState = gameState;
    });

    // ターン進行
    this.socket.on("GAMESTATE-CHANGED", (gameState) => {
      this.gameState = gameState;
    });
  },
  computed: {
    aliveWerewolves: function() {
      var aliveWerewolves = [];
      this.players.forEach((player) => {
        if (player.status === "alive" && player.role === "Werewolf") {
          aliveWerewolves.push(player);
        }
      });
      return aliveWerewolves;
    },
  },
  methods: {
    addPlayer(newPlayer) {
      this.players = [...this.players, newPlayer];
    },
    assignRoles: function() {
      this.players.forEach((player) => (player.role = getRandomRole()));
      const players = this.players;
      const roomName = this.roomName;
      this.socket.emit("ASSIGN-ROLES", { roomName, players });
    },
    attack(id) {
      alert("passed to Game.vue " + id);

      this.attackCandidates.push(id);

      if (this.aliveWerewolves.length === this.attackCandidates.length) {
        var target = Array.from(new Set(this.attackCandidates));
        if (target.length === 1) {
          this.players.forEach((player) => {
            if (player.status === "protected") {
              player.status = "alive";
              this.attackCandidate = [];
            } else if (player.id === id) {
              player.status = "dead";
              this.attackCandidates = [];
            }
          });
        }
      }
    },
    protect(id) {
      //alert("passed to Game.vue " + id);

      this.protectCandidates.push(id);

      if (this.aliveWerewolves.length === this.protectedCandidates.length) {
        var target = Array.from(new Set(this.protectedCandidates));
        if (target.length === 1) {
          this.players.forEach((player) => {
            if (player.id === id) {
              player.status = "protected";
              this.protectCandidates = [];
            }
          });
        }
      }
    },
    check(id) {
      //alert("passed to Game.vue " + id);
      this.players.forEach((player) => {
        if (player.id === id) {
          if (player.role === "Werewolf") {
            alert(player.name + " is Werewolf");
          } else {
            alert(player.name + " is NOT Werewolf");
          }
        }
      });
    },
    startGame() {
      this.gameState = "noon";
      const roomName = this.roomName;
      const gameState = this.gameState;
      this.socket.emit("START-GAME", { roomName, gameState });
    },
    changeGameState() {
      this.gameState === "noon"
        ? (this.gameState = "night")
        : (this.gameState = "noon");

      const roomName = this.roomName;
      const gameState = this.gameState;
      this.socket.emit("CHANGE-GAMESTATE", { roomName, gameState });
    },
  },
};

function getRandomRole() {
  var roles = ["Citizen", "FortuneTeller", "Knight", "Madman", "Werewolf"];
  var index = Math.floor(Math.random() * roles.length);

  return roles[index];
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
