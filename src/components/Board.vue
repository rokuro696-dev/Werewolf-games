<template>
  <div class="board">
    <Player
      v-for="player in players"
      :key="player.id"
      :id="player.id"
      :yourId="id"
      :name="player.name"
      :role="player.role"
      :status="player.status"
      :otherPlayers="players"
      :gameState="gameState"
      ref="PlayerComponent"
      @attack="attack"
      @protect="protect"
      @check="check"
      @vote="vote"
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
    id: String,
  },
  methods: {
    attack(data) {
      let id = data.id;
      let yourId = data.yourId;
      // Gameの"attack"発火
      this.$emit("attack", { id, yourId });
    },
    protect(id) {
      this.$emit("protect", id);
    },
    check(id) {
      this.$emit("check", id);
    },
    clearAttackedStatus() {
      this.$refs.PlayerComponent.forEach((playerComponent) => {
        if (playerComponent.role === "Werewolf") {
          playerComponent.clearAttackedStatus();
        }
      });
    },
    vote(id) {
      this.$emit("vote", id);
    },
  },
};
</script>

<style></style>
