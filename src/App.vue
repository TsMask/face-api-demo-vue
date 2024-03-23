<script setup>
import { useRouter } from "vue-router";
const router = useRouter(); // 返回路由器实例
const routes = router.getRoutes();
</script>

<template>
  <div class="layout">
    <div class="layout_nav">
      <ul>
        <li v-for="(item, index) in routes" :key="index">
          <router-link :to="item.path" v-text="item.meta.title"></router-link>
        </li>
      </ul>
    </div>
    <div class="layout_content">
      <router-view />
    </div>
  </div>
</template>

<style>
:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  color-scheme: light dark;
  color: #242424;
  background-color: rgba(255, 255, 255, 0.87);

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

button,
input[type="file"] {
  border: 2px #55b881 solid;
  border-radius: 6px;
  background: #55b881;
  color: white;
}

/**全局布局 */
.layout {
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  flex-direction: row;
}

.layout .layout_nav {
  min-width: 200px;
  border: 2px #55b881 solid;
  border-radius: 6px;
  padding: 10px;
  margin-right: 20px;
}

.layout .layout_nav ul,
.layout .layout_nav li {
  list-style: none;
  margin: 10px 0;
  padding: 0;
  line-height: 30px;
}

.layout .layout_nav a {
  font-weight: bold;
  color: #2c3e50;
}

.layout .layout_nav a.router-link-exact-active {
  color: #55b881;
}

.layout .layout_content {
  flex: 1;
  border: 2px #55b881 solid;
  border-radius: 6px;
  padding: 20px;
}

/*单页面-通用样式 */
.page .page_option {
  padding-bottom: 20px;
}

.page .page_option div {
  padding: 10px;
  border-bottom: 2px #55b881 solid;
}

.page .page_draw-target,
.page .page_draw-discern,
.page .page_draw {
  position: relative;
}

.page .page_draw #page_draw-img,
.page .page_draw #page_draw-video {
  max-width: 720px;
  max-height: 480px;
}

.page .page_draw #page_draw-canvas-target,
.page .page_draw #page_draw-canvas-discern,
.page .page_draw #page_draw-canvas {
  position: absolute;
  top: 0;
  left: 0;
}

.page .page_draw #page_draw-video-canvas {
  position: absolute;
  top: 0;
  left: 0;
  max-width: 720px;
  max-height: 480px;
}

.page .page_draw #page_draw-canvas-box {
  border: 1px #9a9a9a solid;
}
</style>
