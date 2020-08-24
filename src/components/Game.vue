<template>
  <div class="game">
    <AddPlayer v-on:add-player="addPlayer" />
    <Board :players="players" :gameState="gameState" @attack="attack" @protect="protect" @check="check" />
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
      ],
      attackCandidates: [],
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
  },
  methods: {
    addPlayer(newPlayer) {
      this.players = [...this.players, newPlayer];
    },
    assignRoles: function () {
      this.players.forEach((player) => (player.role = getRandomRole()));
    },
    attack(id) {
      alert("passed to Game.vue " + id);

      this.attackCandidates.push(id);

      if (this.aliveWerewolves.length === this.attackCandidates.length) {
        var target = Array.from(new Set(this.attackCandidates));
        if (target.length === 1) {
          this.players.forEach((player) => {
            if (player.status === "protected"){
              player.status = "alive";
              this.attackCandidate = [];
            }
            else if (player.id === id) {
              player.status = "dead";
              this.attackCandidates = [];
            }
          });
        }
      }
    },
    protect(id){
      alert("passed to Game.vue " + id)

      this.protectCandidates.push(id)

      if(this.aliveWerewolves.length === this.protectedCandidates.length){
        var target = Array.from(new Set(this.protectedCandidates))
        if (target.length ===1){
          this.players.forEach((player) => {
            if( player.id === id){
              player.status = "protected";
              this.protectCandidates =[];
            }
          });
        }
      }
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
