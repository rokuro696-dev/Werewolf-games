<template>
  <div>
    {{ title }}
    <br />
    <br />占う
    <li v-for="target in validTargets" :key="target.id">
      <input type="submit" :value="target.name" class="btn" @click="check(target.id)" />
    </li>
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