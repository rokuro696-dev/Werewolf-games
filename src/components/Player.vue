<template>
  <button style="width: 250px; height:250px">
    {{ name }}
    <div>
      <p v-if="this.role === 'Citizen'">
        <Citizen></Citizen>
      </p>
      <p v-else-if="this.role === 'FortuneTeller'">
        <FortuneTeller :validTargets="alivePlayers" @check="check"></FortuneTeller>
      </p>
      <p v-else-if="this.role === 'Knight'">
        <Knight :validTargets="alivePlayers" @protect="protect"></Knight>
      </p>
      <p v-else-if="this.role === 'Madman'">
        <Madman></Madman>
      </p>
      <p v-else-if="this.role === 'Werewolf'">
        <Werewolf :gameState="gameState" :validTargets="alivePlayers" @attack="attack"></Werewolf>
      </p>
      <p v-else>役職を決めてください。</p>
    </div>
    {{ status }}
  </button>
</template>

<script>
import Citizen from "./Roles/Citizen";
import FortuneTeller from "./Roles/FortuneTeller";
import Knight from "./Roles/Knight";
import Madman from "./Roles/Madman";
import Werewolf from "./Roles/Werewolf";

export default {
  name: "Player",
  components: {
    Citizen,
    FortuneTeller,
    Knight,
    Madman,
    Werewolf,
  },
  props: {
    id: String,
    name: String,
    role: String,
    status: String,
    otherPlayers: Array,
    gameState: String,
  },
  computed: {
    alivePlayers: function () {
      var alivePlayers = [];
      this.otherPlayers.forEach((player) => {
        if (player.status === "alive" && player.name !== this.name) {
          alivePlayers.push(player);
        }
      });
      return alivePlayers;
    },
  },
  methods: {
    attack(id) {
      alert("message from player.vue " + id + " triggered from werewolf.vue");
      this.$emit("attack", id);
    },
    protect(id) {
      alert("message from plauyer.vue " +id + " triggered from werewolf.vue");
      this.$emit('protect, id')
    },
    check(id) {
      alert(
        "message from player.vue " + id + " triggered from FortuneTeller.vue"
      );
      this.$emit("check", id);
    },
  },
};
</script>

<style>
</style>