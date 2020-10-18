<template>
  <div class="board">
    <div v-if="this.gameState === 'reveal'">
      <Announcement
        :yourRole="yourRole"
      ></Announcement>
    </div>
    <div v-else>
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

  </div>
</template>

<script>
import Player from "./Player";
import Announcement from "./Announcement";

export default {
  name: "Players",
  components: {
    Player,
    Announcement
  },
  props: {
    players: Array,
    gameState: String,
    yourRole: String,
    id: String,
  },
  computed:{

  },
  methods: {
    vote(data) {
      let id = data.id;
      let yourId = data.yourId;
      // Game.vueの"vote"メソッド発火
      this.$emit("vote", { id, yourId });
    },
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
  },
};
</script>

<style></style>
