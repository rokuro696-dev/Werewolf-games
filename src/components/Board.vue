<template>
    <div class="board">
        <Player v-for="player in players" :key="player.id" 
                :id="player.id" :name="player.name" :role="player.role" 
                :status="player.status">
        </Player>
    </div>
</template>

<script>
import Player from "./Player";

export default {
    name: "Players",
    components: {
        Player
    },
    props:{
        players: Array,
    }
}
</script>

<style>

</style>