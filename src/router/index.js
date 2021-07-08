import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Room from "../views/Room.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/room/:roomID",
    name: "room",
    component: Room,
  },
  { path: "/:pathMatch(.*)*", redirect: () => "/" },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
