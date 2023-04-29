import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import VueSocketIOExt from "vue-socket.io-extended";
import Youtube from "vue3-youtube";
import { io } from "socket.io-client";
import "./index.css";
// "http://localhost:8000"
//http://192.168.1.6:8000/
//https://dogewatch.herokuapp.com/
// const socket = io("https://dogewatch.herokuapp.com/", {
//   reconnection: true,
//   reconnectionAttempts: 5,
//   reconnectionDelay: 1000,
// });
const socket = io("https://petster-server-production.up.railway.app/", {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});
createApp(App)
  .use(store)
  .use(router)
  .use(VueSocketIOExt, socket, { store })
  .component("Youtube", Youtube)
  .mount("#app");
