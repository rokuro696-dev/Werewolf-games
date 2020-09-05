<template>
  <div v-if="this.gameState === 'night'">
    {{ title }}
    <br />
    <br />占う
    <li v-for="target in validTargets" :key="target.id">
      <input type="submit" :value="target.name" class="btn" @click="check(target.id)" />
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
    validTargets: Array,
    status: String,
    gameState: String,
  },
  methods: {
    check(id) {
      alert("clicked on " + id + " from fortuneteller.vue");
      this.$emit("check", id);
    },
  },
};
</script>

<style>
</style>