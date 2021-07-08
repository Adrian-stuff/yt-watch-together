import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import VueSocketIOExt from "vue-socket.io-extended";
import Youtube from "vue3-youtube";
import { io } from "socket.io-client";
const socket = io("http://localhost:8000");

createApp(App)
  .use(store)
  .use(router)
  .use(VueSocketIOExt, socket, { store })
  .component("Youtube", Youtube)
  .mount("#app");
