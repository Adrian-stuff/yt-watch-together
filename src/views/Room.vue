<template>
  <div class="flex sm:flex-row flex-col justify-center my-1 ">
    <div class="my-0">
      <div class="flex flex-col justify-center items-center">
        <form
          @submit="onSetVideoID"
          class="flex flex-row justify-center items-center"
        >
          <input
            type="text"
            class="border-2 rounded px-2 py-1 my-2 mx-1  w-52 "
            v-model="inputVideoID"
            placeholder="Video ID/Link"
          />
          <Button
            class="text-sm px-2 py-1.5"
            @button-click="onSetVideoID"
            text="Set Video"
          />
        </form>
      </div>
      <div class="max-w-full">
        <Youtube
          :src="videoID"
          class="max-w-full max-h-max"
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
        <h1 class="text-lg my-2 ml-2">Room: {{ roomID }}</h1>
        <div class="flex justify-center">
          <Button
            class="px-2 py-1.5 mb-1"
            @button-click="showModal = true"
            text="Search for Videos"
          />
        </div>
      </div>
    </div>
    <Messages />
    <Modal v-if="showModal" @close="closeModal()">
      <template v-slot:header>
        <div class="flex justify-around">
          <form @submit.prevent="searchVideo" class="mr-2">
            <Input
              class="p-1 border-2 rounded max-w-screen-sm"
              v-model:value="searchVal"
              placeholder="Search"
            />
            <button type="submit" class="ml-2">Search</button>
          </form>
          <button @click="closeModal()" class="">
            X
          </button>
        </div>
      </template>
      <template v-slot:body>
        <div style="max-height: 500px" class="flex flex-col overflow-y-auto ">
          <div
            v-for="data in searchResults"
            :key="data.etag"
            class="flex my-2 justify-center max-w-md mx-auto"
          >
            <div v-if="data.id.kind !== 'youtube#channel'">
              <button class="text-left" @click="setVideoID(data.id.videoId)">
                <img
                  :src="data.snippet.thumbnails.medium.url"
                  :alt="data.snippet.title"
                  class="mx-auto"
                />
                <div class="flex flex-col ">
                  <h1 v-html="data.snippet.title" class="font-bold"></h1>
                  <p class="">{{ data.snippet.channelTitle }}</p>
                  <p>videoID: {{ data.id.videoId }}</p>
                </div>
              </button>
            </div>

            <div v-else></div>
          </div>
        </div>
      </template>
    </Modal>
  </div>
</template>
<script>
import { mapState } from "vuex";
import Button from "../components/Button.vue";
import Messages from "../components/Messages.vue";
import Modal from "../components/Modal.vue";
import Input from "../components/Input.vue";
export default {
  name: "Room",
  components: { Button, Messages, Modal, Input },
  data() {
    return {
      isPlayerReady: false,
      // videoID: this.VideoID || ,
      inputVideoID: "XA2YEHn-A8Q",
      roomID: this.$route.params.roomID,
      username: this.$store.state.username,
      isUpdated: false,
      lastStatus: null,
      secondLastStatus: null,
      isStartedBySelf: true,
      showModal: false,
      searchVal: "",
      searchResults: [],
    };
  },
  methods: {
    onReady() {
      this.isPlayerReady = true;
      console.log("player ready");
    },
    cueVideo(id) {
      if (this.videoID === id) return;
      console.log("????", id);
      this.player.cueVideoById(id);
    },
    onSetVideoID(e) {
      e.preventDefault();
      let data = { videoID: this.inputVideoID };
      this.$socket.client.emit("setVideoData", data, (e) => {
        console.log(e);
      });
    },
    setVideoID(videoID) {
      let data = { videoID: videoID };
      this.$socket.client.emit("setVideoData", data, (e) => {
        console.log(e);
      });
      this.closeModal();
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
        if (this.player && this.player.getPlayerState() != undefined) {
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
    searchVideo() {
      // console.log("hello", process.env.VUE_APP_API_KEY);
      // fetch(
      //   `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${this.searchVal}&key=${process.env.VUE_APP_API_KEY}`
      // )
      //   .then((res) => res.json())
      //   .then((data) => {
      //     console.log(data);
      //   });
      fetch(`https://dogewatch.herokuapp.com/search?q=${this.searchVal}`)
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          console.log(data.items);
          this.searchResults = data.items;
        });
    },
    closeModal() {
      console.log("closing..");
      this.showModal = false;
      this.searchResults = [];
    },
  },
  computed: mapState({
    isAdmin: (state) => state.isAdmin,
    player() {
      return this.$refs.youtube;
    },
    videoID: (state) => state.videoID,
  }),
  mounted() {
    if (this.username == null || this.roomID == null) {
      this.$router.push("/");
    }
    this.$nextTick(() => {
      let data = { room: this.roomID, username: this.username };
      this.$socket.client.emit("joinRoom", data, (e) => {
        console.log(e);
      });
      this.unsubscribe = this.$store.subscribe((mutation, state) => {
        if (mutation.type === "SOCKET_SETVIDEODATA") {
          console.log(`Updating to ${state.videoID}`);
          this.inputVideoID = state.videoID;
          this.cueVideo(state.videoID);
        }
        if (mutation.type === "SOCKET_PLAYSTATUS") {
          console.log(`Updating to ${state.playStatus}`);
          this.changePlayerStatus(state.playStatus);
        }
        if (mutation.type === "SOCKET_JOINROOM") {
          console.log(`Updating to ${state.isAdmin}`);
          console.log(`Updating to ${state.playerStatus}`);

          // if (!state.isAdmin) {
          //   this.cueVideo(state.videoID);
          //   console.log("initial state set.");
          // }
        }
        if (mutation.type === "SOCKET_USERJOINED") {
          console.log(`USERJOINED ${state.users}`);
          if (state.isAdmin) {
            this.broadcastPlayerState();
          }
          if (!state.isAdmin) {
            this.changePlayerStatus(state.playStatus);
            this.cueVideo(state.videoID);
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
