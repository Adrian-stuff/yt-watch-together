<template>
  <div>
    <Youtube :src="videoID" @ready="onReady" ref="youtube"></Youtube>
    <button @click="playVideo()">PLAY</button>
    <h1>room: {{ roomID }}</h1>
    <form @submit="onSetVideoID">
      <input type="text" v-model="setVideoID" />
      <button type="submit">setVideo</button>
    </form>
  </div>
</template>
<script>
import { mapState } from "vuex";
export default {
  name: "Room",
  data() {
    return {
      isPlayerReady: false,
      setVideoID: null,
      roomID: this.$route.params.roomID,
      username: this.$store.state.username,
    };
  },
  methods: {
    onReady() {
      this.isPlayerReady = true;
      console.log("player ready");
    },
    playVideo() {
      this.$refs.youtube.playVideo();
    },
    playing() {
      console.log("playing...");
    },
    cueVideo(id) {
      this.$refs.youtube.cueVideo(id);
    },
    onSetVideoID(e) {
      e.preventDefault();
      let data = { videoID: this.setVideoID };
      this.$socket.client.emit("setVideoData", data, (e) => {
        console.log(e);
      });
    },
  },
  computed: mapState({
    videoID: (state) => state.videoID,
    // player() {
    //   return this.$refs.youtube.player;
    // },
  }),
  mounted() {
    this.$nextTick(() => {
      let data = { room: this.roomID, username: this.username };
      this.$socket.client.emit("joinRoom", data, (e) => {
        console.log(e);
      });
      this.unsubscribe = this.$store.subscribe((mutation, state) => {
        if (mutation.type === "SOCKET_SETVIDEODATA") {
          console.log(`Updating to ${state.videoID}`);
          this.cueVideo(state.videoID);
        }
      });
    });
  },
  beforeUnmount() {
    this.unsubscribe();
  },
};
</script>
<style></style>
