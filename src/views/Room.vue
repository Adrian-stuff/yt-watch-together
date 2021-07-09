<template>
  <div>
    <Youtube
      :src="videoID"
      @ready="onReady"
      @state-change="onStateChange"
      :vars="{
        autoplay: 0,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
        disablekb: 1,
      }"
      ref="youtube"
    ></Youtube>
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
      setVideoID: undefined,
      videoID: "XA2YEHn-A8Q",
      roomID: this.$route.params.roomID,
      username: this.$store.state.username,
      isAdmin: this.$store.state.isAdmin,
      isUpdated: false,
      lastStatus: null,
      secondLastStatus: null,
      isStartedBySelf: true,
    };
  },
  methods: {
    onReady() {
      this.isPlayerReady = true;
      console.log("player ready");
    },
    playVideo() {
      this.player.playVideo();
    },

    cueVideo(id) {
      if (this.videoID === id) return;
      console.log("????", id);
      this.player.cueVideoById(id);
    },
    onSetVideoID(e) {
      e.preventDefault();
      let data = { videoID: this.setVideoID };
      this.$socket.client.emit("setVideoData", data, (e) => {
        console.log(e);
      });
    },
    sendPlayerStatus(status, time) {
      let data = { status, time };
      this.$socket.client.emit("playStatus", data);
    },
    onStateChange(event) {
      if (
        !this.isUpdated &&
        // eslint-disable-next-line no-undef
        this.lastStatus !== YT.PlayerState.BUFFERING &&
        // eslint-disable-next-line no-undef
        (event.data == YT.PlayerState.PLAYING ||
          // eslint-disable-next-line no-undef
          event.data == YT.PlayerState.PAUSED)
      ) {
        this.sendPlayerStatus(event.data, this.player.getCurrentTime());
      } else if (
        this.lastStatus === -1 &&
        // eslint-disable-next-line no-undef
        event.data === YT.PlayerState.BUFFERING
      ) {
        if (this.isStartedBySelf)
          // eslint-disable-next-line no-undef
          this.sendPlayerStatus(YT.PlayerState.PLAYING, 0);
        else this.isStartedBySelf = true;
      } else if (
        // eslint-disable-next-line no-undef
        this.secondLastStatus === YT.PlayerState.PAUSED &&
        // eslint-disable-next-line no-undef
        this.lastStatus === YT.PlayerState.BUFFERING &&
        // eslint-disable-next-line no-undef
        event.data === YT.PlayerState.PLAYING
      ) {
        this.sendPlayerStatus(event.data, this.player.getCurrentTime());
      }
      this.secondLastStatus = this.lastStatus;
      this.lastStatus = event.data;
      this.isUpdated = false;
    },
    changePlayerStatus(data) {
      console.log("data passed to changePlayerStatus:", data);

      const clearTimer = () => clearInterval(timer);
      const timer = setInterval(() => {
        // eslint-disable-next-line no-undef
        if (this.player && this.player.getPlayerState() != undefined && YT) {
          const playerState = this.player.getPlayerState();
          // eslint-disable-next-line no-undef
          if (playerState === YT.PlayerState.CUED || playerState === -1) {
            this.isStartedBySelf = false;
            this.player.playVideo();
            const timer = setInterval(() => {
              // eslint-disable-next-line no-undef
              if (this.player.getPlayerState() != YT.PlayerState.PLAYING)
                return;
              this.player.seekTo(data.time, true);
              // eslint-disable-next-line no-undef
              if (data.status === YT.PlayerState.PLAYING)
                this.player.playVideo();
              // eslint-disable-next-line no-undef
              else if (data.status === YT.PlayerState.PAUSED)
                this.player.pauseVideo();
              clearTimer();
            }, 500);
            const clearTimer = () => clearInterval(timer);
          } else {
            this.player.seekTo(data.time, true);
            // eslint-disable-next-line no-undef
            if (data.status === YT.PlayerState.PLAYING) this.player.playVideo();
            // eslint-disable-next-line no-undef
            else if (data.status === YT.PlayerState.PAUSED)
              this.player.pauseVideo();
          }
          this.isUpdated = true;
          clearTimer();
        }
      }, 500);
    },
    broadcastPlayerState() {
      // eslint-disable-next-line no-undef
      if (this.player) {
        const playerState = this.player.getPlayerState();
        if (
          // eslint-disable-next-line no-undef
          playerState === YT.PlayerState.PLAYING ||
          // eslint-disable-next-line no-undef
          playerState === YT.PlayerState.PAUSED
        ) {
          console.log(
            "broadcastData:",
            playerState,
            this.player.getCurrentTime()
          );
          this.sendPlayerStatus(playerState, this.player.getCurrentTime());
        }
      }
    },
  },
  computed: mapState({
    player() {
      return this.$refs.youtube;
    },
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
        if (mutation.type === "SOCKET_PLAYSTATUS") {
          console.log(`Updating to ${state.playStatus}`);
          this.changePlayerStatus(state.playStatus);
        }
        if (mutation.type === "SOCKET_JOINROOM") {
          console.log(`Updating to ${state.isAdmin}`);
          console.log(`Updating to ${state.playerStatus}`);

          if (!state.isAdmin) {
            this.cueVideo(state.videoID);
            console.log("initial state set.");
          }
        }
        if (mutation.type === "SOCKET_USERJOINED") {
          console.log(`USERJOINED ${state.users}`);
          if (state.isAdmin) {
            this.broadcastPlayerState();
          }
          if (!state.isAdmin) {
            this.changePlayerStatus(state.playStatus);
          }
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
