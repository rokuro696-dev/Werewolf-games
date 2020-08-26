<template>
  <div class="entrance">
    <form @submit="enterRoom">
      <input type="text" placeholder="ルーム名" v-model="roomName" />
      <input type="text" placeholder="プレイヤー名" v-model="playerName" />
      <input type="submit" value="GO" class="btn" />
    </form>
  </div>
</template>

<script>
export default {
  name: "Entrance",
  data() {
    return {
      roomName: "",
      playerName: "",
    };
  },
  methods: {
    enterRoom(e) {
      e.preventDefault();

      var data = {
        roomName: this.roomName,
        playerName: this.playerName,
      };

      this.$emit("enter-room", data);
      this.roomName = "";
      this.playerName = "";
    },
  },
};
</script>

<style>
</style>