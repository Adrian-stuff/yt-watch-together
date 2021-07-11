<template>
  <h1 v-if="!loaded" class="text-center text-4xl font-bold my-4">Loading</h1>
  <div v-else>
    <div class="flex justify-center">
      <div
        class="flex flex-col justify-center border-2 rounded-lg p-5 mt-5 w-80"
      >
        <h1 class="text-center text-3xl font-bold mb-2">Join Room</h1>
        <hr className="bg-gray-600" />
        <h1 class="text-center text-3xl font-bold mb-2">Create Room</h1>
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
            class="text-xl px-3 py-1 mt-2"
            @button-click="onSubmit"
            text="Enter"
          />
        </form>
      </div>
    </div>
    <div class="flex justify-center">
      <div
        class="flex flex-col justify-center border-2 rounded-lg p-6 mt-5 w-80"
      >
        <h1 class=" text-3xl font-bold mb-2">Rooms</h1>
        <button
          v-for="room in rooms"
          :key="room"
          @click="setVidId(room)"
          class="underline font-bold text-lg"
        >
          {{ room }}
        </button>
      </div>
    </div>
    <div class="flex flex-col justify-center items-center mt-4">
      <h1 class="font-bold text-xl">Check my other projects!</h1>
      <a
        href="https://doge-meme-review.web.app/"
        target="_blank"
        class="border-2 rounded px-2 py-1 mt-2"
      >
        <h1 class="underline text-lg">DogeReview</h1>
        <p>Review Memes with your friends!</p>
      </a>
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
    setVidId(id) {
      this.roomID = id;
    },
  },
  computed: mapState({
    loaded: (state) => state.isConnected,
    rooms: (state) => state.rooms,
  }),
  mounted() {
    if (this.$store.state.isConnected) {
      this.$socket.client.emit("leaveRoom");
    }
    this.$store.dispatch("clearMessages");
    setInterval(() => {
      this.$socket.client.emit("getAllRooms");
    }, 2000);
  },
  beforeUnmount() {
    clearInterval();
  },
};
</script>
