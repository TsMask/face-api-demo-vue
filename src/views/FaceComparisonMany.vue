<template>
  <div class="FaceComparisonMany">
    <p>不好意思，请打开浏览器看控制台查看输出日志</p>
    <br>
    <img id="face1" src="../assets/images/安悦溪1.jpg" width="300">
    <img id="face2" src="../assets/images/安悦溪2.jpg" width="300">
    <img id="face3" src="../assets/images/张杰1.jpg" width="300">
    <img id="face4" src="../assets/images/张杰2.jpg" width="300">
    <br>
    <img id="face5" src="../assets/images/张杰3.jpg" width="300">
    <img id="face6" src="../assets/images/张杰4.jpg" width="300">
  </div>
</template>

<script>
import * as faceapi from "face-api.js";
// 本地图片
import 安悦溪1 from "../assets/images/安悦溪1.jpg";
import 安悦溪2 from "../assets/images/安悦溪2.jpg";
import 张杰1 from "../assets/images/张杰1.jpg";
import 张杰2 from "../assets/images/张杰2.jpg";
import 张杰3 from "../assets/images/张杰3.jpg";
import 张杰4 from "../assets/images/张杰4.jpg";

export default {
  name: "FaceComparisonMany",
  props: {
    msg: String
  },
  data() {
    return {
      // 人脸对比模型数组对象
      faceMatcher: null
    };
  },
  mounted() {
    // 同步执行避免报错
    this.init();
  },
  methods: {
    // 同步执行避免报错
    async init() {
      await faceapi.loadFaceRecognitionModel("/models");
      this.faceMatcher = await this.createFaceMatcher();
      await this.runArray();
    },
    // 人脸对比模型数组对象
    async createFaceMatcher() {
      // 模型里的图片，一人多张图片
      // const picArray = [
      //   {
      //     name: "安悦溪",
      //     img: ["https://dwz.cn/Fi5mUbYK", "https://dwz.cn/kXUrwcGG"]
      //   },
      //   {
      //     name: "张杰",
      //     img: ["https://dwz.cn/PVtFiWoI"]
      //   }
      // ];
      const picArray = [
        {
          name: "安悦溪",
          img: [安悦溪1, 安悦溪2]
        },
        {
          name: "张杰",
          img: [张杰1, 张杰2]
        }
      ];

      // 预存图片转码数组
      const labeledFaceDescriptors = await Promise.all(
        picArray.map(async (pic, index) => {
          console.log(pic.name, pic.img);
          // 用数组存储图片转码数据
          const descriptors = [];
          for (const imgage of pic.img) {
            const img = await faceapi.fetchImage(imgage);
            descriptors.push(await faceapi.computeFaceDescriptor(img));
          }
          // 返回图片用户和图片转码数组
          return new faceapi.LabeledFaceDescriptors(pic.name, descriptors);
        })
      );
      console.log("图片转码数组对象", labeledFaceDescriptors);
      return new faceapi.FaceMatcher(labeledFaceDescriptors);
    },
    // 对比图片
    async runArray() {
      // 使用对比模型里的图片，用几张张图片与模型组里做对比
      // const picArrays = ["https://dwz.cn/ZggSBEtL", "https://dwz.cn/U7nR0no0"];
      const picArrays = [张杰3, 张杰4, 张杰1];
      // 遍历对比里图片
      for (const key in picArrays) {
        if (picArrays.hasOwnProperty(key)) {
          const element = picArrays[key];
          // 数组遍历开始
          console.log("开始对比：", element);
          const ts = Date.now();
          // 获取图片base64
          const input = await faceapi.fetchImage(element);
          // 图片转码
          const descriptor = await faceapi.computeFaceDescriptor(input);
          // 图片鉴别
          const bestMatch = await this.faceMatcher.findBestMatch(descriptor);
          // 鉴别效果
          console.log(
            "鉴别结果：" + bestMatch.toString(),
            "鉴别时间：" + `${Date.now() - ts} ms`,
            "FPS：" + faceapi.round(1000 / (Date.now() - ts))
          );
          // 数组遍历结束
        }
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
