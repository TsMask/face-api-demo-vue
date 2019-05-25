<template>
  <div class="FaceComparison">
    <p>不好意思，请打开浏览器看控制台查看输出日志</p>
    <br>
    <!-- <img id="face1" src="https://dwz.cn/kXUrwcGG">
    <img id="face2" src="https://dwz.cn/Fi5mUbYK">-->
    <img id="face1" src="../assets/images/安悦溪1.jpg">
    <img id="face1" src="../assets/images/安悦溪2.jpg">
  </div>
</template>

<script>
import * as faceapi from "face-api.js";
import 安悦溪1 from "../assets/images/安悦溪1.jpg";
import 安悦溪2 from "../assets/images/安悦溪2.jpg";

export default {
  name: "FaceComparison",
  data() {
    return {
      // 差值
      threshold: 0.6,
      descriptors: {
        desc1: null,
        desc2: null
      }
    };
  },
  mounted() {
    // 同步执行避免报错
    this.init();
  },
  methods: {
    // 初始加载数据模型
    async init() {
      await faceapi.loadFaceRecognitionModel("/models");
      await this.run();
    },
    // 运行对比
    async run() {
      console.log("对比识别");
      // 图片一
      const input1 = await faceapi.fetchImage(安悦溪1);
      this.descriptors[`desc1`] = await faceapi.computeFaceDescriptor(input1);
      // 图片二
      const input2 = await faceapi.fetchImage(安悦溪2);
      this.descriptors[`desc2`] = await faceapi.computeFaceDescriptor(input2);
      // 图片相识度
      const distance = faceapi.round(
        faceapi.euclideanDistance(
          this.descriptors.desc1,
          this.descriptors.desc2
        )
      );
      // 判断
      console.log("值越小越相似:", distance);
      if (distance > this.threshold) {
        console.log(distance, "相似度<0.6 不比配");
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
