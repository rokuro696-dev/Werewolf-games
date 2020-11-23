<template>
  <div id="app">
    <div div v-if="this.roomName === ''">
      <Entrance v-on:enter-room="enterRoom" />
    </div>
    <div v-else>
      <Game :roomName="this.roomName" :playerName="this.playerName" :id="this.id" />
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
  head: {
    meta() {
      return[
        {name: "charset", content:"utf-8"},
        {name: "viewport", content:"width=device-width, initial-scale=1"}
      ]
    }
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

body {
  text-align: center;
  margin: 0;
  background: -webkit-linear-gradient(top right, #336B87, #90AFC5);
}

h2 {
  font-size: 2em;
  color: #F5F5F5;
  font-weight: bold;
}

.body {
  padding-top: 20px;
}

.video {
  width: 50%;
  max-width: 400px;
  height: 50%;
  max-height: 200px;
  padding: 5px;

  background: #d3d3d3;
  border-style: outset;
  border-color: #C4DFE6;
  border-width: thick;
  background: -webkit-linear-gradient(top right, #336B87, #90AFC5);
  z-index: -100;
}

.nextPage {
  display: inline-block;
  background: #336B87;
  margin-top: 20px;
  margin-bottom: 20px;
  padding: 10px 20px;
  width: 10em;
  height: 1.5em;
  font-size: 24px;
  text-decoration: none;
  color: #FFFFFF;
  transition: .4s;
  border-style: outset;
  border-color: #C4DFE6;

}

.nextPage:hover {
  background: #2A3132;
  color: white;
}

.announcement {
  padding: 20%;
}

.position {
  display: inline-block;
}

.reminder {
  padding: 5px;
}

.flat-botton {
  display: inline-block;
  background: none;
  margin: 1.5em;
  padding: 3.0em 3.0em;
  text-decoration: none;
  color: #FFFFFF;
  border: solid 2px #FFFFFF;
  border-radius: 3px;
  transition: .4s;
}

.flat-botton:hover {
  background: #2A3132;
  color: white;
}

.arrow {
  border: solid black;
  border-width: 0 3px 3px 0;
  display: inline-block;
  padding: 3px;
}

.left {
  transform: rotate(135deg);
  -webkit-transform: rotate(135deg);
}

.general-botton {
  display: inline-block;
  background: none;
  margin: 1.5em;
  padding: 3.0em 3.0em;
  text-decoration: none;
  color: #FFFFFF;
  border: solid 2px #FFFFFF;
  border-radius: 3px;
  transition: .4s;
}

.night {
  padding: 20%;
  background: -webkit-linear-gradient(top right, #336B87, #90AFC5);
}

.night-announcement {
  color: #FFFFFF;
}

.end-botton {
  display: inline-block;
  background: none;
  margin: 1.5em;
  padding: 3.0em 3.0em;
  text-decoration: none;
  color: #FFFFFF;
  border: solid 2px #FFFFFF;
  border-radius: 3px;
  transition: .4s;
}

.end-night {
  padding: 20%;
  text-align: left;
  background: -webkit-linear-gradient(top right, #336B87, #90AFC5);
}

.end-role {
  color: #FFFFFF;
  display: inline;
}

.end-announcement {
  padding: 1.4%;
  font-size: 3.0em;
  text-align: center;
}

#time {
  text-decoration: underline;
}

</style>
