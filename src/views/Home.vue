<script setup>
import HelloWorld from "@/components/HelloWorld.vue";
</script>

<template>
  <div style="text-align: center">
    <div style="text-align: left">
      <div>
        模型文件放在public/models目录下，部署需要根据情况放置到服务器静态资源确保能访问正常。
      </div>
      <div>
        由于浏览器隐私安全权限问题可能导致无法调用摄像头，需要<mark>HTTPS</mark>认证，电脑端可用<mark>127.0.0.1</mark>访问。
      </div>
      <a href="https://github.com/TsMask/face-api-demo">
        本人仓库 browser 示例 0.13.8 含 dist/文档/模型/示例
      </a>
      <br />
      <a
        href="https://justadudewhohacks.github.io/face-api.js/docs/globals.html"
      >
        face-api仓库 API文档
      </a>
      <br />
      <a href="https://justadudewhohacks.github.io/face-api.js">
        face-api作者 在线示例
      </a>
      <br />
      <a href="https://github.com/justadudewhohacks/face-api.js">
        face-api作者 Github
      </a>
    </div>

    <!-- 分割线 -->
    <hr />

    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="@/assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
    <HelloWorld msg="Vite + Vue" />
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
