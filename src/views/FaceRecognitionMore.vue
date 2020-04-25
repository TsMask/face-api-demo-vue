<template>
  <div class="face_recognition_more">
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
        <label>更换图片det多图</label>
        <input
          type="file"
          accept="image/png, image/jpeg"
          multiple="multiple"
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
      <hr />
      <div id="detBox"></div>
    </div>
  </div>
</template>

<script>
import * as faceapi from "face-api.js";
export default {
  name: "FaceRecognitionMore",
  data() {
    return {
      nets: "ssdMobilenetv1", // 算法模型
      options: null, // 模型参数
      faceMatcher: null, // 原图样本人脸矩阵结果
      orgImgEl: null,
      orgCanvasEl: null,
      detBoxEl: null,
    };
  },
  watch: {
    nets(val) {
      this.nets = val;
      document.getElementById("detBox").innerHTML = "";
      this.fnInit();
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.fnInit();
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
            minFaceSize: 20, // 0.1 ~ 0.9
            scaleFactor: 0.709, // 0.1 ~ 0.9
          });
          break;
      }
      // 节点对象
      this.orgImgEl = document.getElementById("orgImg");
      this.orgCanvasEl = document.getElementById("orgCanvas");
      this.detBoxEl = document.getElementById("detBox");
      // 原图人脸识别和人脸匹配
      await this.fnRunOrg();
      await this.fnRunDet();
    },
    // 执行原图样本识别绘制
    async fnRunOrg() {
      const fullFaceDescriptions = await faceapi
        .detectAllFaces(this.orgImgEl, this.options)
        .withFaceLandmarks()
        .withFaceDescriptors();
      if (!fullFaceDescriptions.length) {
        this.faceMatcher = null;
        return;
      }
      // 原图人脸矩阵结果
      this.faceMatcher = await new faceapi.FaceMatcher(fullFaceDescriptions);
      // 显示的图像维度小于=原始尺寸,并与org原图人脸矩阵结果进行匹配绘制
      faceapi.matchDimensions(this.orgCanvasEl, this.orgImgEl);
      const resizedResults = faceapi.resizeResults(
        fullFaceDescriptions,
        this.orgImgEl
      );
      resizedResults.forEach(({ detection, descriptor }) => {
        let { label } = this.faceMatcher.findBestMatch(descriptor);
        new faceapi.draw.DrawBox(detection.box, { label }).draw(
          this.orgCanvasEl
        );
      });
    },
    // 执行目标图与原图多样本图识别绘制
    async fnRunDet(index = 0, src = "images/cp03.jpg") {
      if (!this.faceMatcher) return;
      // 节点对象创建
      let img = document.createElement("IMG");
      img.id = "detImg" + index;
      img.src = src;
      let canvas = document.createElement("CANVAS");
      canvas.id = "detCanvas" + index;
      let div = document.createElement("DIV");
      div.className = "det";
      div.appendChild(img);
      div.appendChild(canvas);
      this.detBoxEl.appendChild(div);
      // 识别人脸
      const fullFaceDescriptions = await faceapi
        .detectAllFaces(img, this.options)
        .withFaceLandmarks()
        .withFaceDescriptors();
      if (!fullFaceDescriptions.length) return;
      // 显示的图像维度小于=原始尺寸,并与org原图人脸矩阵结果进行匹配绘制
      faceapi.matchDimensions(canvas, img);
      const resizedResults = faceapi.resizeResults(fullFaceDescriptions, img);
      resizedResults.forEach(({ detection, descriptor }) => {
        let label = this.faceMatcher.findBestMatch(descriptor).toString();
        new faceapi.draw.DrawBox(detection.box, { label }).draw(canvas);
      });
    },
    // 更换图片
    fnChange(e, el) {
      if (!e.target.files.length) return;
      // 清空识别图区，遍历识别
      this.detBoxEl.innerHTML = "";
      if (el === "org") {
        faceapi.bufferToImage(e.target.files[0]).then(async (img) => {
          this.orgImgEl.src = img.src;
          this.orgCanvasEl
            .getContext("2d")
            .clearRect(0, 0, this.orgCanvasEl.width, this.orgCanvasEl.height);
          this.fnRunOrg().then(() => this.fnRunDet());
        });
      } else {
        e.target.files.forEach((file, index) => {
          faceapi.bufferToImage(file).then((img) => {
            this.fnRunDet(index, img.src);
          });
        });
      }
    },
  },
};
</script>

<style>
.see .org,
.see #detBox .det {
  position: relative;
}
.see .org img,
.see #detBox .det img {
  max-width: 600px;
  max-height: 400px;
}
.see .org canvas,
.see #detBox .det canvas {
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
