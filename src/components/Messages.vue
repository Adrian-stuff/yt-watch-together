<template>
  <form
    @submit.prevent="sendMessage"
    class="flex flex-col justify-center border-2 rounded-lg p-2 m-2 "
  >
    <div
      style="height: 385px; max-width: 269px;"
      class="w-full items-start overflow-y-auto md:max-w-full"
    >
      <div class="flex-col p-1 break-all">
        <p
          v-for="message in messages"
          :key="message.username + message.message"
        >
          <span class="text-blue-800">{{ message.user }}</span>
          : {{ message.message }}
        </p>
        <div ref="scroll"></div>
      </div>
    </div>
    <div class="flex flex-row justify-center items-center">
      <Input
        class="sm:w-48 w-48"
        v-model:value="message"
        placeholder="Message"
      />
      <button
        class="text-center font-bold text-lg border-2 w-max h-10 rounded-lg ml-1 px-3"
        type="submit"
        @click="sendMessage"
      >
        Send
      </button>
    </div>
  </form>
</template>
<script>
import { mapState } from "vuex";
import Input from "./Input.vue";
export default {
  components: { Input },
  name: "Messages",
  data() {
    return {
      username: this.$store.state.username,
      message: "",
    };
  },
  methods: {
    sendMessage() {
      let filteredMessage = this.message.replace(/\s/g, "");
      if (filteredMessage !== "") {
        let data = { user: this.username, message: this.message };
        this.$socket.client.emit("chatMessage", data);
      }
      this.message = "";
    },
    scrollDown() {
      const el = this.$refs.scroll;

      // console.log(this.$el.getElementsByClassName("message").length);
      // if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      // }
    },
  },
  computed: mapState({
    messages: (state) => state.messages,
  }),
  mounted() {
    this.$nextTick(() => {
      this.unsubscribe = this.$store.subscribe((mutation) => {
        if (mutation.type === "SOCKET_CHATMESSAGE") {
          console.log("low");
          this.scrollDown();
        }
      });
    });
  },
  beforeUnmount() {
    this.unsubscribe();
  },
};
</script>
