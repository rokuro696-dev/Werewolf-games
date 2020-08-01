<template>
  <div>
      {{ title }}

      <br>
      <br>
      生存者
        <li v-for="target in validTargets" :key="target.id">
            <input type="submit" :value="target.name" class="btn" @click="protect(target.id)">
        </li>
  </div>
</template>

<script>
export default {
    name: "knight",
    data() {
        return {
            title: "騎士"
        }
    },
    props: {
        validTargets: Array,
    },
    methods: {
        protect(id){
            alert("clicked on " + id + " from knight.vue")
            this.$emit("protect", id)
        }
    }
}
</script>

<style>

</style>