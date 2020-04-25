<template>
  <div class="face_extraction">
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
      <p>截取出的人脸图像：</p>
      <div id="myCanvasBox"></div>
    </div>
  </div>
</template>

<script>
import * as faceapi from "face-api.js";
export default {
  name: "FaceExtraction",
  data() {
    return {
      nets: "ssdMobilenetv1", // 模型
      options: null, // 模型参数
      imgEl: null,
      canvasBoxEl: null,
    };
  },
  watch: {
    nets(val) {
      this.nets = val;
      this.fnInit().then(() => this.fnRun());
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
            minFaceSize: 20, // 0.1 ~ 0.9
            scaleFactor: 0.709, // 0.1 ~ 0.9
          });
          break;
      }
      // 节点属性化
      this.imgEl = document.getElementById("myImg");
      this.canvasBoxEl = document.getElementById("myCanvasBox");
    },
    // 执行识别绘制
    async fnRun() {
      // 匹配出人脸进行提取输出canvas对象
      const detections = await faceapi.detectAllFaces(this.imgEl, this.options);
      const faceImages = await faceapi.extractFaces(this.imgEl, detections);
      faceImages.forEach((canvas) => this.canvasBoxEl.appendChild(canvas));
      this.canvasBoxEl.appendChild(document.createElement("HR"));
    },
    // 更换图片
    fnChange(e) {
      if (!e.target.files.length) return;
      // 将文件显示为图像并识别
      faceapi.bufferToImage(e.target.files[0]).then((img) => {
        this.canvasBoxEl.innerHTML = "";
        this.imgEl.src = img.src;
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
