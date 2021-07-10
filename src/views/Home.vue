<template>
  <h1 v-if="!loaded" class="text-center text-4xl font-bold my-4">Loading</h1>
  <div v-else class="flex justify-center">
    <div class="flex flex-col justify-center border-2 rounded-lg p-6 mt-5">
      <h1 class="text-center text-3xl font-bold mb-2">Join Room</h1>
      <form
        @submit="onSubmit"
        class="flex flex-col justify-center items-center "
      >
        <Input
          class="m-1 w-64"
          v-model:value="username"
          placeholder="username"
        />
        <Input class="m-1 w-64" v-model:value="roomID" placeholder="roomID" />
        <Button
          class="text-xl px-3 py-1"
          @button-click="onSubmit"
          text="Join"
        />
      </form>
    </div>
  </div>
</template>

<script>
import Input from "../components/Input.vue";
import Button from "../components/Button.vue";
import { mapState } from "vuex";

export default {
  name: "Home",
  components: { Input, Button },
  data() {
    return {
      username: this.$store.state.username,
      roomID: undefined,
    };
  },
  methods: {
    onSubmit(e) {
      e.preventDefault();
      let filteredUsername = this.username
        ? this.username.trim().replace(/\s/g, "")
        : "";
      let filteredRoomID = this.roomID
        ? this.roomID.trim().replace(/\s/g, "")
        : "";
      if (filteredUsername !== "" && filteredRoomID !== "") {
        this.$store.dispatch("setUsername", this.username);
        this.$router.push(`/room/${filteredRoomID}`);
      }
      console.log(this.username, this.roomID);
    },
  },
  computed: mapState({
    loaded: (state) => state.isConnected,
  }),
  mounted() {
    if (this.$store.state.isConnected) {
      this.$socket.client.emit("leaveRoom");
    }
    this.$store.dispatch("clearMessages");
  },
};
</script>
