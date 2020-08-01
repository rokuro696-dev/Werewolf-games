<template>
  <div class="board">
    <Player
      v-for="player in players"
      :key="player.id"
      :id="player.id"
      :name="player.name"
      :role="player.role"
      :status="player.status"
      :otherPlayers="players"
      :gameState="gameState"
      @attack="attack"
      @check="check"
    ></Player>
  </div>
</template>

<script>
import Player from "./Player";

export default {
  name: "Players",
  components: {
    Player,
  },
  props: {
    players: Array,
    gameState: String,
  },
  methods: {
    attack(id) {
      this.$emit("attack", id);
    },
    check(id) {
      this.$emit("check", id);
    },
  },
};
</script>

<style>
</style>