<template>
  <div class="face_recognition">
    <div class="option">
      <div class="org">
        <label>更换图片org</label>
        <input
          type="file"
          accept="image/png, image/jpeg"
          @change="fnChange($event, 'org')"
        />
      </div>
      <div class="det">
        <label>更换图片det</label>
        <input
          type="file"
          accept="image/png, image/jpeg"
          @change="fnChange($event, 'det')"
        />
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
      <div class="org">
        <img id="orgImg" src="images/xxm/xxm03.jpg" />
        <canvas id="orgCanvas" />
      </div>
      <div class="det">
        <img id="detImg" src="images/cp02.jpg" />
        <canvas id="detCanvas" />
      </div>
    </div>
  </div>
</template>

<script>
import * as faceapi from "face-api.js";
export default {
  name: "FaceRecognition",
  data() {
    return {
      nets: "ssdMobilenetv1",
      faceMatcher: null,
      orgImgEl: null,
      orgCanvasEl: null,
      detImgEl: null,
      detCanvasEl: null,
    };
  },
  watch: {
    nets(val) {
      this.nets = val;
      this.fnInit()
        .then(() => this.fnRun("org"))
        .then(() => this.fnRun("det"));
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.fnInit()
        .then(() => this.fnRun("org"))
        .then(() => this.fnRun("det"));
    });
  },
  methods: {
    // 初始化模型加载
    async fnInit() {
      await faceapi.nets[this.nets].loadFromUri("/models");
      await faceapi.loadFaceLandmarkModel("/models");
      await faceapi.loadFaceRecognitionModel("/models");
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
            minFaceSize: 20, // 1 ~ 50
            scaleFactor: 0.709, // 0.1 ~ 0.9
          });
          break;
      }
      // 节点对象
      this.orgImgEl = document.getElementById("orgImg");
      this.orgCanvasEl = document.getElementById("orgCanvas");
      this.detImgEl = document.getElementById("detImg");
      this.detCanvasEl = document.getElementById("detCanvas");
    },
    // 执行识别绘制
    async fnRun(el) {
      if (!this.faceMatcher && el === "det") return;
      const fullFaceDescriptions = await faceapi
        .detectAllFaces(this[el + "ImgEl"], this.options)
        .withFaceLandmarks()
        .withFaceDescriptors();
      if (!fullFaceDescriptions.length) {
        this.faceMatcher = null;
        return;
      }
      // 目标原图，转匹配矩阵
      if (el === "org") {
        this.faceMatcher = await new faceapi.FaceMatcher(fullFaceDescriptions);
      }
      // 识别图像绘制
      faceapi.matchDimensions(this[el + "CanvasEl"], this[el + "ImgEl"]);
      const resizedResults = faceapi.resizeResults(
        fullFaceDescriptions,
        this[el + "ImgEl"]
      );
      resizedResults.forEach(({ detection, descriptor }) => {
        let best = this.faceMatcher.findBestMatch(descriptor);
        let label = el === "org" ? best["label"] : best.toString();
        new faceapi.draw.DrawBox(detection.box, { label }).draw(
          this[el + "CanvasEl"]
        );
      });
    },
    // 更换图片,将文件显示为图像并识别
    fnChange(e, el) {
      if (!e.target.files.length) return;
      const canvas = this[el + "CanvasEl"];
      faceapi.bufferToImage(e.target.files[0]).then((img) => {
        this[el + "ImgEl"].src = img.src;
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        el === "org"
          ? this.fnRun("org").then(() => this.fnRun("det"))
          : this.fnRun("det");
      });
    },
  },
};
</script>

<style scoped>
.see .org,
.see .det {
  position: relative;
}
.see .org img,
.see .det img {
  max-width: 600px;
  max-height: 400px;
}
.see .org canvas,
.see .det canvas {
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
