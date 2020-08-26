<template>
  <div v-if="this.gameState === 'night' && id === yourId">
    {{ title }}
    <br />
    <br />占う
    <li v-for="target in validTargets" :key="target.id">
      <input
        type="submit"
        :value="target.name"
        class="btn"
        @click="check(target.id)"
      />
    </li>
  </div>
  <div v-else>
    {{ title }}
    <br />
    <br />
  </div>
</template>

<script>
export default {
  name: "fortuneteller",
  data() {
    return {
      title: "占い師",
    };
  },
  props: {
    id: String,
    yourId: String,
    validTargets: Array,
    gameState: String,
    type: String,
  },
  methods: {
    check(id) {
      this.$emit("check", id);
    },
  },
};
</script>

<style></style>
