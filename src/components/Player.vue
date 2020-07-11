<template>
  <button>
        {{ name }}
        <div>
          <p v-if="this.role === 'Citizen'">
            <Citizen></Citizen>
          </p>
          <p v-else>
            役職を決めてください
          </p>
        </div>
        {{ status }}
  </button>
</template>

<script>
import Citizen from "./Roles/Citizen";

export default {
    name: "Player",
    components: {
      Citizen
    },
    props: {
        id: String,
        name: String,
        role: String,
        status: String,
    }
}
</script>

<style>

</style>