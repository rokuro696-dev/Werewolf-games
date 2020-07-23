<template>
  <div class="game">
    <AddPlayer v-on:add-player="addPlayer" />
    <Board :players="players" @attack="attack"/>
    <button v-on:click="assignRoles">Assign Roles</button>
  </div>
</template>

<script>
import Board from "./Board";
import AddPlayer from "./AddPlayer";

export default {
  name: 'Game',
  components:{
    Board,
    AddPlayer
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
          status: "alive"
        }
      ],
      attackCandidates:[]
    }
  },
  computed:{
    aliveWerewolves: function(){
      var aliveWerewolves = []
        this.players.forEach(player => {
          if (player.status === "alive" && player.role === "Werewolf"){
            aliveWerewolves.push(player)
          }
        });
        return aliveWerewolves
    }
  },
    methods: {
      addPlayer(newPlayer) {
        this.players = [...this.players, newPlayer]
      },
      assignRoles: function() {
        this.players.forEach(player =>
          player.role = getRandomRole()
        )
      },
      attack(id){
        alert("passed to Game.vue " + id)
        
        this.attackCandidates.push(id)

        if (this.aliveWerewolves.length === this.attackCandidates.length){
          var target = Array.from(new Set(this.attackCandidates))
          if (target.length === 1){
            this.players.forEach(player => {
              if( player.id === id){
                player.status = "dead"
                this.attackCandidates = []
          }
        });
          }
        }
      }
    }
}

function getRandomRole() {
  var roles = [
    "Citizen",
    "FortuneTeller",
    "Knight",
    "Madman",
    "Werewolf"
  ]
  var index = Math.floor(Math.random() * roles.length)

  return roles[index];
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
