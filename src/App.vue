<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">About</router-link>|
      <router-link to="/rtc">WebRTC</router-link>|
      <router-link to="/face_comparison">两张图对比</router-link>|
      <router-link to="/face_comparison_many">多张图对比</router-link>|
      <router-link to="/rtc_face_trackimg">WebRTC媒体人脸检测</router-link>
    </div>
    <router-view/>
  </div>
</template>

<style lang="less">
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#nav {
  padding: 30px;
  a {
    font-weight: bold;
    color: #2c3e50;
    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
