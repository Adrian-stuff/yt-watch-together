import { createStore } from "vuex";

export default createStore({
  state: {
    isConnected: false,
    isAdmin: false,
    username: localStorage.getItem("username") || undefined,
    videoID: "",
    playStatus: null,
    messages: [],
  },
  mutations: {
    SET_USERNAME(state, username) {
      localStorage.setItem("username", username);
      state.username = username;
    },
    SOCKET_CONNECT(state) {
      state.isConnected = true;
    },
    SOCKET_JOINROOM(state, data) {
      state.videoID = data.videoID;
      state.isAdmin = data.isAdmin;
      console.log("joinRoom:", data);
    },
    SOCKET_USERJOINED(state, data) {
      state.messages = [
        ...state.messages,
        {
          user: "System",
          message: `${data.username} joined the room.`,
        },
      ];
    },
    SOCKET_SETVIDEODATA(state, data) {
      console.log(data);
      state.videoID = data.videoID;
    },
    SOCKET_PLAYSTATUS(state, data) {
      state.playStatus = data;
    },
    SOCKET_SETNEWADMIN(state, data) {
      if (state.username === data.username) {
        state.isAdmin = data.isAdmin;
      }
    },
    SOCKET_CHATMESSAGE(state, data) {
      state.messages = [...state.messages, data];
    },
    CLEARMESSAGES(state) {
      state.messages = [];
    },
  },
  actions: {
    setUsername({ commit }, username) {
      console.log("username dispatched:", username);
      commit("SET_USERNAME", username);
    },
    socket_connect({ commit }) {
      console.log("connected");
      commit("SOCKET_CONNECT");
    },
    socket_joinRoom({ commit }, data) {
      console.log("action", data);
      commit("SOCKET_JOINROOM", data);
    },
    socket_setVideoData({ commit }, data) {
      console.log("setVideoData", data);
      commit("SOCKET_SETVIDEODATA", data);
    },
    socket_playStatus({ commit }, data) {
      console.log("playStatus", data);
      commit("SOCKET_PLAYSTATUS", data);
    },
    socket_setNewAdmin({ commit }, data) {
      console.log("setNewAdmin", data);
      commit("SOCKET_SETNEWADMIN", data);
    },
    clearMessages({ commit }) {
      commit("CLEARMESSAGES");
    },
  },
  modules: {},
});
