<template>
  <div class="home" style="text-align: center;">
    <div>
      模型文件放在public\models目录下，npm主要安装以下：
      <h5>npm i --save face-api.js</h5>
      <h5>npm i --save webrtc-adapter</h5>
      <h5>如果localhost点击打不开，换127.0.0.1</h5>
    </div>
    <div>
      <p>
        <a href="https://github.com/TsMask/face-api-demo"
          >我仓库 browser 示例 0.13.8 含 dist/文档/模型/示例</a
        >
      </p>
      <p>
        <a
          href="https://justadudewhohacks.github.io/face-api.js/docs/globals.html"
          >face-api 使用文档</a
        >
      </p>
      <p>
        <a href="https://github.com/justadudewhohacks/face-api.js"
          >作者最新代码</a
        >
      </p>
      <p>
        <a href="https://justadudewhohacks.github.io/face-api.js"
          >作者在线示例</a
        >
      </p>
    </div>
    <hr />
    <img alt="Vue logo" src="../assets/logo.png" />
    <HelloWorld msg="Hello Vue" />
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from "@/components/HelloWorld.vue";

export default {
  name: "Home",
  components: {
    HelloWorld,
  },
};
</script>
