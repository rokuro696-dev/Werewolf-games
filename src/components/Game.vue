<template>
  <div class="game">
    <AddPlayer v-on:add-player="addPlayer" />
    <Board :players="players"/>
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
          role: ""
        },
        {
          id: "2",
          name: "Jiro",
          role: ""
        },
        {
          id: "3",
          name: "Saburo",
          role: ""
        }
      ]
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
    }
}

function getRandomRole() {
  var roles = [
    "Citizen"
  ]
  var index = Math.floor(Math.random() * roles.length)

  return roles[index];
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
