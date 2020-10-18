<template>
  <button style="width: 250px; height: 250px">
    {{ name }}
    <div>
      <p v-if="this.role === 'Citizen'">
        <Citizen></Citizen>
      </p>
      <p v-else-if="this.role === 'FortuneTeller'">
        <FortuneTeller
          :id="id"
          :yourId="yourId"
          :gameState="gameState"
          :validTargets="alivePlayers"
          @check="check"
        ></FortuneTeller>
      </p>
      <p v-else-if="this.role === 'Knight'">
        <Knight
          :gameState="gameState"
          :yourId="yourId"
          :validTargets="alivePlayers"
          @protect="protect"
        ></Knight>
      </p>
      <p v-else-if="this.role === 'Madman'">
        <Madman></Madman>
      </p>
      <p v-else-if="this.role === 'Werewolf'">
        <Werewolf
          :id="id"
          :yourId="yourId"
          :gameState="gameState"
          :validTargets="attackablePlayers"
          :attacked="attacked"
          ref="WerewolfComponent"
          @attack="attack"
        ></Werewolf>
      </p>
      <p v-else>役職を決めてください。</p>
      <div v-if="gameState === 'noon' && status === 'alive' && id === yourId">
        <div v-if="voted === false || (voted === true && voteTarget === '')">
          投票する
          <li v-for="target in alivePlayers" :key="target.id">
            <input
              type="submit"
              :value="target.name"
              class="btn"
              @click="vote(target.id, target.name)"
            />
          </li>
        </div>
        <div v-if="voted === true">{{ voteTarget }}に投票しました</div>
      </div>
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
    yourId: String,
    name: String,
    role: String,
    status: String,
    otherPlayers: Array,
    gameState: String,
    voted: Boolean,
  },
  data() {
    return {
      attacked: false,
      voteTarget: "",
    };
  },
  computed: {
    alivePlayers: function () {
      var alivePlayers = [];
      this.otherPlayers.forEach((player) => {
        if (
          (player.status === "alive" || player.status === "protected") &&
          player.name !== this.name
        ) {
          alivePlayers.push(player);
        }
      });
      return alivePlayers;
    },
    attackablePlayers: function () {
      var attackablePlayers = [];
      this.alivePlayers.forEach((player) => {
        if (player.role !== "Werewolf") attackablePlayers.push(player);
      });
      return attackablePlayers;
    },
  },
  methods: {
    vote(id, name) {
      let yourId = this.yourId;
      // Board.vueの"vote"メソッド発火
      this.voteTarget = name;
      this.voted = true;
      this.$emit("vote", { id, yourId });
    },
    attack(data) {
      let id = data.id;
      let yourId = data.yourId;
      this.attacked = true;
      // Boardの"attack"メソッド発火
      this.$emit("attack", { id, yourId });
    },
    protect(id) {
      alert("message from plauyer.vue " + id + " triggered from werewolf.vue");
      this.$emit("protect", id);
    },
    check(id) {
      alert(
        "message from player.vue " + id + " triggered from FortuneTeller.vue"
      );
      this.$emit("check", id);
    },
    clearVotedStatus() {
      this.voted = false;
      this.votearget = "";
    },
    clearAttackedStatus() {
      this.attacked = false;
      this.$refs.WerewolfComponent.attackTarget = "";
    },
  },
};
</script>

<style></style>
