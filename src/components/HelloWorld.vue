<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <div>
      通过浏览作者
      <a href="https://github.com/justadudewhohacks/face-api.js">GitHub</a>
      使用说明
      <h5>npm i --save face-api.js </h5>
      <h5>npm i --save webrtc-adapter </h5>
    </div>
    <h3>其余方法使用查阅作者doc，方法说明文件也在作者的GitHub里</h3>
    <h3>
      <a href="https://github.com/Slimmer/face-api-demo">我下载的代码实例</a> |
      <a href="https://github.com/justadudewhohacks/face-api.js">作者最新代码实例</a>
    </h3>
  </div>
</template>

<script>
export default {
  name: "HelloWorld",
  props: {
    msg: String
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
