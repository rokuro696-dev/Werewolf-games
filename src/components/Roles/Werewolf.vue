<template>
  <div v-if="gameState === 'night' && id === yourId">
    {{ title }}
    <br />
    <br />
    <div
      v-if="attacked === false || (attacked === true && attackTarget === '')"
    >
      襲撃する
      <li v-for="target in validTargets" :key="target.id">
        <input
          type="submit"
          :value="target.name"
          class="btn"
          @click="attack(target.id, target.name)"
        />
      </li>
    </div>
    <div v-else>{{ attackTarget }} を襲撃しました。</div>
  </div>
  <div v-else>
    {{ title }}
    <br />
    <br />
  </div>
</template>

<script>
export default {
  name: "werewolf",
  data() {
    return {
      title: "人狼",
      attackTarget: "",
    };
  },
  props: {
    id: String,
    yourId: String,
    validTargets: Array,
    gameState: String,
    attacked: Boolean,
  },
  methods: {
    attack(id, name) {
      let yourId = this.yourId;
      // Player.vueの"attack"メソッド発火
      this.attackTarget = name;
      this.$emit("attack", { id, yourId });
    },
    clear() {
      this.attacked = false;
      this.attackTarget = "";
    },
    clearAttackedStatus() {
      this.attacked = false;
      this.attackTarget = "";
    },
  },
  mounted() {
    this.$on("clear-werewolf", () => {
      this.attacked = false;
      this.attackTarget = "";
    });
  },
};
</script>

<style></style>
