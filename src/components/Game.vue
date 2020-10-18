<template>
  <div class="game">
    <Board
      :players="players"
      :gameState="gameState"
      :id="id"
      :yourRole="yourRole"
      ref="BoardComponent"
      @attack="attack"
      @protect="protect"
      @check="check"
      @vote="vote"
    />
    <div v-if="this.gameState === 'preparation'">
      <button button v-on:click="assignRoles">Assign Roles</button>
    </div>
    <div v-if="this.gameState === 'preparation'">
      <button v-on:click="startGame">ゲームを開始</button>
    </div>
    <div v-else>
      <a class="nextPage" v-on:click="changeGameState">次のターンに進む</a>
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
        */
      ],

      attackCandidates: [],
      attackers: [],

      voteCandidates: [],
      voters: [],
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
    // 含まれていなければ"自分"を自身のプレイヤーリストに追加
    if (playerIndex === -1) {
      const self = {
        id: this.id,
        name: this.playerName,
        role: "",
        status: "alive",
      };
      this.addPlayer(self);
    }
    // ゲーム状態を取得
    this.socket.on("PASS-GAMESTATE", (data) => {
      this.gameState = data.gameState;
    });
  },
  mounted() {
    // 他プレイヤー入場時処理
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

    // 投票（投票状況をルームに共有）
    this.socket.on("PLAYER-VOTED", (data) => {
      console.log(
        "プレイヤー [" +
          data.yourId +
          "] が [" +
          data.targetId +
          "] に投票しました。" +
          this.socket.id
      );
      //let roomName = this.roomName;
      let targetId = data.targetId;
      let voterId = data.yourId;

      if (this.id !== voterId) {
        // 処刑対象の配列に処刑対象のIDを格納
        this.voteCandidates = [...this.voteCandidates, targetId];
        // 処刑者を配列に格納
        this.voters = [...this.voters, voterId];
        //票数確認用本番では消す
        alert(this.voters.length + "/" + this.alivePlayers.length);
      }
    });

    // 投票（投票結果をルームに共有）
    this.socket.on("EXECUTE-RESULT", (data) => {
      alert("投票が終了しました");
      //let roomName = this.roomName;
      //let targetId = data.targetId;
      let voterId = data.yourId;

      if (this.id !== voterId) {
        //処刑フェーズ
        if (this.alivePlayers.length === this.voters.length) {
          alert("投票数確認");
          //票数順にソート
          this.voteCandidates.sort(function (a, b) {
            if (a.vote < b.value) return 1;
            if (a.vote > b.vote) return -1;
            return 0;
          });
          //票数が多いプレイヤーを処刑
          this.players.forEach((player) => {
            if (player.id === this.voteCandidates[0]) {
              player.status = "dead";
              alert(player.name + "が処刑されました");
            }
          });
          this.voteCandidates = [];
          this.voters = [];
        }
      }
    });

    // 襲撃（人狼間での襲撃対象精査）
    this.socket.on("WEREWOLF-ATTACKED", (data) => {
      let roomName = this.roomName;
      let targetId = data.targetId;
      let wolfId = data.wolfId;

      if (this.yourRole === "Werewolf" && this.id !== wolfId) {
        // 襲撃対象の配列に襲撃対象のIDを格納
        this.attackCandidates = [...this.attackCandidates, targetId];
        // 襲撃者を配列に格納
        this.attackers = [...this.attackers, wolfId];

        if (this.aliveWerewolves.length === this.attackCandidates.length) {
          if (this.isAttackUnanimous()) {
            var target = Array.from(new Set(this.attackCandidates));
            this.processAttack(target);
          } else {
            this.attackCandidates = [];
            this.attackers = [];
            alert("Revote");
            this.$refs.BoardComponent.clearAttackedStatus();
            this.socket.emit("WEREWOLF-REVOTE", roomName);
          }
        }
      }
    });

    // 襲撃結果
    this.socket.on("ATTACK-RESULT", (data) => {
      let targetId = data.targetId;
      //let wolfId = data.wolfId;
      //let isSuccess = data.isSuccess;
      if (data.wolfId !== this.id) {
        this.players.forEach((player) => {
          if (player.status === "protected") {
            player.status = "alive";

            // デバッグ用アラート
            if (this.yourRole === "Werewolf") alert("襲撃失敗");
          } else if (player.id === targetId) {
            player.status = "dead";
            // デバッグ用アラート
            if (this.yourRole === "Werewolf") alert("襲撃成功");
          }
        });
      }
      this.attackCandidate = [];
      this.attackers = [];
    });

    // 襲撃再投票
    this.socket.on("WEREWOLF-REVOTE", () => {
      this.attackCandidates = [];
      this.attackers = [];
      alert("Revote");
      this.$refs.BoardComponent.clearAttackedStatus();
    });
  },
  computed: {
    aliveWerewolves: function () {
      var aliveWerewolves = [];
      this.players.forEach((player) => {
        if (player.status === "alive" && player.role === "Werewolf") {
          aliveWerewolves.push(player);
        }
      });
      return aliveWerewolves;
    },
    yourRole: function () {
      var yourRole = "";
      var you = this.players.find((player) => player.id === this.id);
      yourRole = you.role;
      return yourRole;
    },
    alivePlayers: function () {
      var alivePlayers = [];
      this.players.forEach((player) => {
        if (player.status === "alive" && player.name !== this.name) {
          alivePlayers.push(player);
        }
      });
      return alivePlayers;
    },
  },
  methods: {
    addPlayer(newPlayer) {
      this.players = [...this.players, newPlayer];
    },

    assignRoles: function () {
      var roles = [];

      //以下でプレイヤー数別のロールアサインパターンを記載
      if (this.players.length === 15) {
        roles = [
          { Title: "Citizen", MaxNum: 7, CurrentNum: 0 },
          { Title: "Werewolf", MaxNum: 3, CurrentNum: 0 },
          { Title: "FortuneTeller", MaxNum: 1, CurrentNum: 0 },
          { Title: "Knight", MaxNum: 2, CurrentNum: 0 },
          { Title: "Madman", MaxNum: 2, CurrentNum: 0 },
        ];
        this.getRandomRole(roles);
      } else if (this.players.length === 14) {
        roles = [
          { Title: "Citizen", MaxNum: 7, CurrentNum: 0 },
          { Title: "Werewolf", MaxNum: 3, CurrentNum: 0 },
          { Title: "FortuneTeller", MaxNum: 1, CurrentNum: 0 },
          { Title: "Knight", MaxNum: 1, CurrentNum: 0 },
          { Title: "Madman", MaxNum: 2, CurrentNum: 0 },
        ];
        this.getRandomRole(roles);
      } else if (this.players.length === 13) {
        roles = [
          { Title: "Citizen", MaxNum: 6, CurrentNum: 0 },
          { Title: "Werewolf", MaxNum: 3, CurrentNum: 0 },
          { Title: "FortuneTeller", MaxNum: 1, CurrentNum: 0 },
          { Title: "Knight", MaxNum: 1, CurrentNum: 0 },
          { Title: "Madman", MaxNum: 2, CurrentNum: 0 },
        ];
        this.getRandomRole(roles);
      } else if (this.players.length === 12) {
        roles = [
          { Title: "Citizen", MaxNum: 5, CurrentNum: 0 },
          { Title: "Werewolf", MaxNum: 3, CurrentNum: 0 },
          { Title: "FortuneTeller", MaxNum: 1, CurrentNum: 0 },
          { Title: "Knight", MaxNum: 1, CurrentNum: 0 },
          { Title: "Madman", MaxNum: 2, CurrentNum: 0 },
        ];
        this.getRandomRole(roles);
      } else if (this.players.length === 11) {
        roles = [
          { Title: "Citizen", MaxNum: 5, CurrentNum: 0 },
          { Title: "Werewolf", MaxNum: 2, CurrentNum: 0 },
          { Title: "FortuneTeller", MaxNum: 1, CurrentNum: 0 },
          { Title: "Knight", MaxNum: 1, CurrentNum: 0 },
          { Title: "Madman", MaxNum: 2, CurrentNum: 0 },
        ];
        this.getRandomRole(roles);
      } else if (this.players.length === 10) {
        roles = [
          { Title: "Citizen", MaxNum: 4, CurrentNum: 0 },
          { Title: "Werewolf", MaxNum: 2, CurrentNum: 0 },
          { Title: "FortuneTeller", MaxNum: 1, CurrentNum: 0 },
          { Title: "Knight", MaxNum: 1, CurrentNum: 0 },
          { Title: "Madman", MaxNum: 2, CurrentNum: 0 },
        ];
        this.getRandomRole(roles);
      } else if (this.players.length === 9) {
        roles = [
          { Title: "Citizen", MaxNum: 4, CurrentNum: 0 },
          { Title: "Werewolf", MaxNum: 2, CurrentNum: 0 },
          { Title: "FortuneTeller", MaxNum: 1, CurrentNum: 0 },
          { Title: "Knight", MaxNum: 1, CurrentNum: 0 },
          { Title: "Madman", MaxNum: 1, CurrentNum: 0 },
        ];
        this.getRandomRole(roles);
      } else if (this.players.length === 8) {
        roles = [
          { Title: "Citizen", MaxNum: 3, CurrentNum: 0 },
          { Title: "Werewolf", MaxNum: 2, CurrentNum: 0 },
          { Title: "FortuneTeller", MaxNum: 1, CurrentNum: 0 },
          { Title: "Knight", MaxNum: 1, CurrentNum: 0 },
          { Title: "Madman", MaxNum: 1, CurrentNum: 0 },
        ];
        this.getRandomRole(roles);
      } else if (this.players.length === 7) {
        roles = [
          { Title: "Citizen", MaxNum: 2, CurrentNum: 0 },
          { Title: "Werewolf", MaxNum: 2, CurrentNum: 0 },
          { Title: "FortuneTeller", MaxNum: 1, CurrentNum: 0 },
          { Title: "Knight", MaxNum: 1, CurrentNum: 0 },
          { Title: "Madman", MaxNum: 1, CurrentNum: 0 },
        ];
        this.getRandomRole(roles);
      } else if (this.players.length === 6) {
        roles = [
          { Title: "Citizen", MaxNum: 2, CurrentNum: 0 },
          { Title: "Werewolf", MaxNum: 2, CurrentNum: 0 },
          { Title: "FortuneTeller", MaxNum: 1, CurrentNum: 0 },
          { Title: "Knight", MaxNum: 1, CurrentNum: 0 },
          { Title: "Madman", MaxNum: 0, CurrentNum: 0 },
        ];
        this.getRandomRole(roles);
      } else if (this.players.length === 5) {
        roles = [
          { Title: "Citizen", MaxNum: 2, CurrentNum: 0 },
          { Title: "Werewolf", MaxNum: 1, CurrentNum: 0 },
          { Title: "FortuneTeller", MaxNum: 0, CurrentNum: 0 },
          { Title: "Knight", MaxNum: 1, CurrentNum: 0 },
          { Title: "Madman", MaxNum: 1, CurrentNum: 0 },
        ];
        this.getRandomRole(roles);
      } else if (this.players.length === 4) {
        roles = [
          { Title: "Citizen", MaxNum: 1, CurrentNum: 0 },
          { Title: "Werewolf", MaxNum: 1, CurrentNum: 0 },
          { Title: "FortuneTeller", MaxNum: 0, CurrentNum: 0 },
          { Title: "Knight", MaxNum: 1, CurrentNum: 0 },
          { Title: "Madman", MaxNum: 1, CurrentNum: 0 },
        ];
        this.getRandomRole(roles);
      }

      let roomName = this.roomName;
      let players = this.players;
      this.socket.emit("ASSIGN-ROLES", { roomName, players });
    },

    getRandomRole(roles) {
      this.players.forEach((player) => {
        while (player.role === "") {
          var index = Math.floor(Math.random() * roles.length);
          var role = roles[index];
          console.log(role.MaxNum, role.CurrentNum);
          if (role.MaxNum > role.CurrentNum) {
            role.CurrentNum += 1;
            player.role = role.Title;
          }
        }
      });
    },

    vote(data) {
      let roomName = this.roomName;
      let targetId = data.id;
      let voterId = data.yourId;

      // 処刑対象の配列に処刑対象のIDを格納
      this.voteCandidates = [...this.voteCandidates, targetId];
      // 処刑者を配列に格納
      this.voters = [...this.voters, voterId];
      alert(this.voters.length + "/" + this.alivePlayers.length);
      console.log("CheckPoint1");

      // 投票結果を共有
      this.socket.emit("PLAYER-VOTE", {
        roomName,
        targetId,
        voterId,
      });

      //票が集まったら処刑フェーズに
      if (this.alivePlayers.length === this.voters.length) {
        alert("投票が終わりました");
        //票数順にソート
        this.voteCandidates.sort(function (a, b) {
          if (a.vote < b.value) return 1;
          if (a.vote > b.vote) return -1;
          return 0;
        });
        //票数が多いプレイヤーを処刑
        this.players.forEach((player) => {
          if (player.id === this.voteCandidates[0]) {
            player.status = "dead";
            alert(player.name + "が処刑されました");
          }
        });
        this.voteCandidates = [];
        this.voters = [];
        //処刑結果を共有;
        this.socket.emit("EXECUTE-RESULT", {
          roomName,
          targetId,
          voterId,
        });
      }
    },

    attack(data) {
      let roomName = this.roomName;
      let targetId = data.id;
      let wolfId = data.yourId;

      // 襲撃対象の配列に襲撃対象のIDを格納
      this.attackCandidates = [...this.attackCandidates, targetId];
      // 襲撃者を配列に格納
      this.attackers = [...this.attackers, wolfId];

      if (this.aliveWerewolves.length === this.attackCandidates.length) {
        if (this.isAttackUnanimous()) {
          var target = Array.from(new Set(this.attackCandidates))[0];
          this.processAttack(target);
        } else {
          this.attackCandidates = [];
          this.attackers = [];
          alert("Revote");
          this.$refs.BoardComponent.clearAttackedStatus();
          this.socket.emit("WEREWOLF-REVOTE", { roomName });
        }
      } else {
        // 他の人狼へ襲撃を知らせる。
        this.socket.emit("WEREWOLF-ATTACK", {
          roomName,
          targetId,
          wolfId,
        });
      }
    },

    protect(id) {
      alert("passed to Game.vue" + id);

      this.players.forEach((player) => {
        console.log(player.id);
        console.log(id);

        if (player.id === id) {
          player.status = "protected";
        }
      });
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
      this.gameState = "reveal";
      const roomName = this.roomName;
      const gameState = this.gameState;
      this.socket.emit("START-GAME", { roomName, gameState });
    },
    startNoon() {
      this.gameState = "noon";
      const roomName = this.roomName;
      const gameState = this.gameState;
      this.socket.emit("CHANGE-GAMESTATE", {roomName, gameState})
    },
    changeGameState() {
      this.gameState === "noon"
        ? (this.gameState = "night")
        : (this.gameState = "noon");

      const roomName = this.roomName;
      const gameState = this.gameState;
      this.socket.emit("CHANGE-GAMESTATE", { roomName, gameState });
    },
    processAttack(targetId) {
      //let isSuccess = false;
      this.players.forEach((player) => {
        if (player.status === "protected") {
          player.status = "alive";
          alert("襲撃失敗");
        } else if (player.id === targetId) {
          player.status = "dead";
          //isSuccess = true;
          alert("襲撃成功");
        }
      });
      this.attackCandidate = [];
      this.attackers = [];

      let roomName = this.roomName;
      let wolfId = this.id;
      this.socket.emit("ATTACK-RESULT", {
        roomName,
        targetId,
        wolfId,
        //isSuccess,
      });
    },
    isAttackUnanimous() {
      // 襲撃対象配列の重複排除
      var target = Array.from(new Set(this.attackCandidates));

      // 重複排除後の配列に要素が一つしか無ければ、襲撃対象が一致
      return target.length === 1;
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
