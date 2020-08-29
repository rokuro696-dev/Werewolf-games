<template>
  <div>
    {{ title }}
    <br />
    <br />
    <div v-if="this.gameState === 'night' && status === 'alive'">
      生存者
      <li v-for="target in validTargets" :key="target.id">
        <input type="submit" :value="target.name" class="btn" @click="attack(target.id)" />
      </li>
    </div>
  </div>
</template>

<script>
export default {
  name: "werewolf",
  data() {
    return {
      title: "人狼",
    };
  },
  props: {
    validTargets: Array,
    gameState: String,
  },
  methods: {
    attack(id) {
      alert("clicked on " + id + " from werewolf.vue");
      this.$emit("attack", id);
    },
  },
};
</script>

<style>
</style>