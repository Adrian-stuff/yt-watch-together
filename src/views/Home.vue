<template>
  <div>
    <form @submit="onSubmit">
      <input type="text" v-model="username" placeholder="username" />
      <input type="text" v-model="roomID" placeholder="roomID" />
      <button type="submit">Join</button>
    </form>
  </div>
</template>

<script>
export default {
  name: "Home",
  components: {},
  data() {
    return {
      username: this.$store.state.username,
      roomID: null,
    };
  },
  methods: {
    onSubmit(e) {
      e.preventDefault();
      this.$store.dispatch("setUsername", this.username);
      this.$router.push(`/room/${this.roomID}`);
      console.log(this.username, this.roomID);
    },
  },
};
</script>
