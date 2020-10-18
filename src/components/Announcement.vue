<template>
    <div>
        <div class="announcement">
        <h2>あなたの役職は</h2>
        <h2 class="position">{{yourRole}}</h2>
        <h2 class="position">です</h2>
        </div>
    </div>
</template>

<script>
export default {
    name: "Announcement",
    props: {
        yourRole: String,
    }
}
</script>

<style>

</style>