<template>
    <div>
        <form @submit="addPlayer">
            <input type="text"  v-model="name"
                    name="name" placeholder="Player Name">
            <input  type="submit" value="Submit" class="btn">
        </form>
    </div>
</template>

<script>
import {v4 as uuidv4} from "uuid"

export default {
    name: "AddPlayer",
    data() {
        return {
            name:"",
            role:""
        }
    },
    methods: {
        addPlayer(e) {
            e.preventDefault();
            const newPlayer = {
                id: uuidv4(),
                name: this.name,
                role: this.role,
            }

            // Send up to parent
            this.$emit("add-player", newPlayer)

            this.name = ""
            this.role = ""
        }
    }
}
</script>

<style>

</style>