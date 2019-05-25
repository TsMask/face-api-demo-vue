<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">关于</router-link>|
      <router-link to="/face_comparison">两张图对比</router-link>|
      <router-link to="/face_comparison_many">多张图对比</router-link>|
      <router-link to="/video_media_stream">WebRTC媒体视频流</router-link>|
      <router-link to="/video_media_canvas_stream">WebRTC媒体人脸框绘制检测</router-link>
    </div>
    <router-view/>
  </div>
</template>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#nav {
  padding: 30px;
}
a {
  font-weight: bold;
  color: #2c3e50;
}
a.router-link-exact-active {
  color: #42b983;
}
</style>
