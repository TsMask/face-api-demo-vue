<template>
  <div class="face_landmark_detection">
    <div class="option">
      <div>
        <label>更换图片</label>
        <input
          type="file"
          accept="image/png, image/jpeg"
          @change="fnChange($event)"
        />
      </div>
      <div>
        <label>边框Or面部轮廓</label>
        <input type="checkbox" v-model="withBoxes" />
      </div>
      <div>
        <label>选择算法模型</label>
        <label>
          ssdMobilenetv1
          <input type="radio" v-model="nets" value="ssdMobilenetv1" />
        </label>
        <label>
          tinyFaceDetector
          <input type="radio" v-model="nets" value="tinyFaceDetector" />
        </label>
        <label>
          mtcnn
          <input type="radio" v-model="nets" value="mtcnn" />
        </label>
      </div>
    </div>
    <div class="see">
      <img id="myImg" src="images/xxm/xxm03.jpg" />
      <canvas id="myCanvas" />
    </div>
  </div>
</template>

<script>
import * as faceapi from "face-api.js";
export default {
  name: "FaceLandmarkDetection",
  data() {
    return {
      nets: "ssdMobilenetv1", // 模型
      options: null, // 模型参数
      withBoxes: true, // 边框or轮廓
      imgEl: null,
      canvasEl: null,
    };
  },
  watch: {
    nets(val) {
      this.nets = val;
      this.fnInit().then(() => this.fnRun());
    },
    withBoxes(val) {
      this.withBoxes = val;
      this.fnRun();
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.fnInit().then(() => this.fnRun());
    });
  },
  methods: {
    // 初始化模型加载
    async fnInit() {
      await faceapi.nets[this.nets].loadFromUri("/models");
      await faceapi.loadFaceLandmarkModel("/models");
      // 根据模型参数识别调整结果
      switch (this.nets) {
        case "ssdMobilenetv1":
          this.options = new faceapi.SsdMobilenetv1Options({
            minConfidence: 0.5, // 0.1 ~ 0.9
          });
          break;
        case "tinyFaceDetector":
          this.options = new faceapi.TinyFaceDetectorOptions({
            inputSize: 512, // 160 224 320 416 512 608
            scoreThreshold: 0.5, // 0.1 ~ 0.9
          });
          break;
        case "mtcnn":
          this.options = new faceapi.MtcnnOptions({
            minFaceSize: 20, // 1 - 50
            scaleFactor: 0.709, // 0.1 ~ 0.9
          });
          break;
      }
      // 节点属性化
      this.imgEl = document.getElementById("myImg");
      this.canvasEl = document.getElementById("myCanvas");
    },
    // 执行识别绘制
    async fnRun() {
      const results = await faceapi
        .detectAllFaces(this.imgEl, this.options)
        .withFaceLandmarks();
      faceapi.matchDimensions(this.canvasEl, this.imgEl);
      const resizedResults = faceapi.resizeResults(results, this.imgEl);
      this.withBoxes
        ? faceapi.draw.drawDetections(this.canvasEl, resizedResults)
        : faceapi.draw.drawFaceLandmarks(this.canvasEl, resizedResults);
    },
    // 更换图片
    fnChange(e) {
      if (!e.target.files.length) return;
      // 将文件显示为图像并识别
      faceapi.bufferToImage(e.target.files[0]).then((img) => {
        this.imgEl.src = img.src;
        this.canvasEl
          .getContext("2d")
          .clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);
        this.fnRun();
      });
    },
  },
};
</script>

<style scoped>
.see {
  position: relative;
}
.see img {
  max-width: 600px;
  max-height: 400px;
}
.see canvas {
  position: absolute;
  top: 0;
  left: 0;
}
.option {
  padding-bottom: 20px;
}
.option div {
  padding: 10px;
  border-bottom: 2px #42b983 solid;
}
.option div label {
  margin-right: 20px;
}
</style>
