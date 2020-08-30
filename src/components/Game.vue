<template>
  <div class="game">
    <AddPlayer v-on:add-player="addPlayer" />
    <Board
      :players="players"
      :gameState="gameState"
      @attack="attack"
      @protect="protect"
      @check="check"
      @vote="vote"
    />
    <button v-on:click="assignRoles">Assign Roles</button>
    <div v-if="this.gameState === 'preparation'">
      <button v-on:click="startGame">ゲームを開始</button>
    </div>
    <div v-else>
      <button v-on:click="changeGameState">次のターンに進む</button>
    </div>
    <div>現在は {{this.gameState}}</div>
  </div>
</template>

<script>
import Board from "./Board";
import AddPlayer from "./AddPlayer";

export default {
  name: "Game",
  components: {
    Board,
    AddPlayer,
  },
  props: {
    gameState: String,
  },
  data() {
    return {
      players: [
        {
          id: "1",
          name: "Taro",
          role: "",
          status: "alive",
        },
        {
          id: "2",
          name: "Jiro",
          role: "",
          status: "alive",
        },
        {
          id: "3",
          name: "Saburo",
          role: "",
          status: "alive",
        },
        {
          id: "4",
          name: "Shiro",
          role: "",
          status: "alive",
        },
        {
          id: "5",
          name: "Goro",
          role: "",
          status: "alive",
        },
        {
          id: "6",
          name: "Anna",
          role: "",
          status: "alive",
        },{
          id: "7",
          name: "John",
          role: "",
          status: "alive",
        },{
          id: "8",
          name: "Mia",
          role: "",
          status: "alive",
        },{
          id: "9",
          name: "Luke",
          role: "",
          status: "alive",
        },{
          id: "10",
          name: "Emma",
          role: "",
          status: "alive",
        },{
          id: "11",
          name: "Ryan",
          role: "",
          status: "alive",
        },{
          id: "12",
          name: "Melissa",
          role: "",
          status: "alive",
        },{
          id: "13",
          name: "Elijah",
          role: "",
          status: "alive",
        },{
          id: "14",
          name: "Liam",
          role: "",
          status: "alive",
        },{
          id: "15",
          name: "Olivia",
          role: "",
          status: "alive",
        },
      ],

      attackCandidates: [],

      voteCandidates: [
        { id: "0", vote: 0 }, //集計用
        { id: "1", vote: 0 },
        { id: "2", vote: 0 },
        { id: "3", vote: 0 },
        { id: "4", vote: 0 },
        { id: "5", vote: 0 },
      ],
    };
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
      this.players.forEach((player) => (player.role = getRandomRole()));
    },
    vote(id) {
      alert("Vote: passed to Game.vue " + id);
      //票数集計
      this.voteCandidates[0].vote = this.voteCandidates[0].vote + 1;
      //対象に投票
      this.voteCandidates[id].vote = this.voteCandidates[id].vote + 1;

      alert(
        "vote check:\n" +
          "PlayerID:" +
          this.voteCandidates[id].id +
          "-" +
          this.voteCandidates[id].vote
      );
      //票が集まったらソート
      if (this.alivePlayers.length === this.voteCandidates[0].vote) {
        this.voteCandidates.sort(function (a, b) {
          if (a.vote < b.value) return 1;
          if (a.vote > b.vote) return -1;
          return 0;
        });
        //処刑
        alert("Execution:" + this.voteCandidates[1].id);
        this.players.forEach((player) => {
          if (player.id === this.voteCandidates[1].id) {
            player.status = "dead";
            this.voteCandidates = [];
          }
        });

        this.voteCandidates.forEach((voteCandidate) => {
          voteCandidate.vote = 0;
        });
      }
    },

    attack(id) {
      alert("passed to Game.vue" + id);
      this.attackCandidates.push(id);
      if (this.alivewerewolves.length === this.attackCandidates.length) {
        var target = Array.from(new Set(this.attackCandidates));
        if (target.length === 1 ) {
          this.players.forEach((player) => {
            if (player.status === "protected") {
              player.status = "alive";
              this.attackCandidates = [];
            }
            else if (player.id === id) {
              player.status = "dead";
              this.attackCandidates = [];
            }
          })
        }
      }
    },

    protect(id) {
      alert("passed to Game.vue" + id)

      this.players.forEach((player) => {
        console.log (player.id)
        console.log (id)

        if (player.id === id){
          player.status = "protected";
        }
      })
    },

    check(id) {
      alert("passed to Game.vue " + id);
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
    },
    changeGameState() {
      this.gameState === "noon"
        ? (this.gameState = "night")
        : (this.gameState = "noon");
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
<style scoped>
</style>
