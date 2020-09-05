<template>
  <div>
    {{ title }}
    <br />
    <br />
    <div v-if="this.gameState === 'night'">
      生存者
      <li v-for="target in validTargets" :key="target.id">
        <input type="submit" :value="target.name" class="btn" @click="protect(target.id)" />
      </li>
    </div>
  </div>
</template>

<script>
export default {
  name: "knight",
  data() {
    return {
      title: "騎士",
    };
  },
  props: {
    validTargets: Array,
    gameState: String,
  },
  methods: {
    protect(id) {
      alert("clicked on " + id + " from knight.vue");
      this.$emit("protect", id);
    },
  },
};
</script>

<style>
</style>