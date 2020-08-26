<template>
  <div id="app">
    <div div v-if="this.roomName === ''">
      <Entrance v-on:enter-room="enterRoom" />
    </div>
    <div v-else>
      <Game
        :roomName="this.roomName"
        :playerName="this.playerName"
        :id="this.id"
      />
    </div>
  </div>
</template>

<script>
import Entrance from "./components/Entrance.vue";
import Game from "./components/Game.vue";
import { v4 as uuid } from "uuid";

export default {
  name: "App",
  components: {
    Game,
    Entrance,
  },
  data() {
    return {
      id: "",
      roomName: "",
      playerName: "",
      socketID: "",
    };
  },
  methods: {
    enterRoom(data) {
      this.id = uuid();
      this.roomName = data.roomName;
      this.playerName = data.playerName;
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
