<template>
  <div class="video_face_recognition">
    <div class="option">
      <div>
        <label>视频控制：</label>
        <button @click="fnPaused">暂停Or播放</button>
      </div>
      <div>
        <label>更换视频：</label>
        <input
          type="file"
          accept="video/mp4, video/ogg, video/webm"
          @change="fnChange($event)"
        />
      </div>
      <div>
        <span style="margin-right: 20px;">检测识别类型：</span>
        <label>
          轮廓检测
          <input type="radio" v-model="detection" value="landmark" />
        </label>
        <label>
          表情检测
          <input type="radio" v-model="detection" value="expression" />
        </label>
        <label>
          年龄性别检测
          <input type="radio" v-model="detection" value="age_gender" />
        </label>
      </div>
      <div>
        <label>边框Or面部轮廓：</label>
        <input type="checkbox" v-model="withBoxes" />
      </div>
      <div>
        <label>检测人脸：</label>
        <label>
          可信单
          <input type="radio" v-model="detectFace" value="detectSingleFace" />
        </label>
        <label>
          模糊多
          <input type="radio" v-model="detectFace" value="detectAllFaces" />
        </label>
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
      <video id="myVideo" src="videos/test.mp4" muted playsinline></video>
      <canvas id="myCanvas" />
    </div>
  </div>
</template>

<script>
import * as faceapi from "face-api.js";
export default {
  name: "VideoAgeAndGenderRecognition",
  data() {
    return {
      nets: "tinyFaceDetector", // 模型
      options: null, // 模型参数
      withBoxes: true, // 框or轮廓
      detectFace: "detectSingleFace", // 单or多人脸
      detection: "landmark",
      videoEl: null,
      canvasEl: null,
      timeout: 0,
    };
  },
  watch: {
    nets(val) {
      this.nets = val;
      this.fnInit();
    },
    detection(val) {
      this.detection = val;
      if (!this.videoEl.paused) {
        this.videoEl.pause();
        setTimeout(() => {
          this.videoEl.play();
          setTimeout(() => this.fnRun(), 300);
        }, 300);
      }
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
      await faceapi.nets[this.nets].loadFromUri("/models"); // 算法模型
      await faceapi.loadFaceLandmarkModel("/models"); // 轮廓模型
      await faceapi.loadFaceExpressionModel("/models"); // 表情模型
      await faceapi.loadAgeGenderModel("/models"); // 年龄模型
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
      this.videoEl = document.getElementById("myVideo");
      this.canvasEl = document.getElementById("myCanvas");
    },
    // 人脸面部勘探轮廓识别绘制
    async fnRunFaceLandmark() {
      console.log("RunFaceLandmark");
      if (this.videoEl.paused) return clearTimeout(this.timeout);
      // 识别绘制人脸信息
      const result = await faceapi[this.detectFace](
        this.videoEl,
        this.options
      ).withFaceLandmarks();
      if (result) {
        const dims = faceapi.matchDimensions(this.canvasEl, this.videoEl, true);
        const resizeResult = faceapi.resizeResults(result, dims);
        this.withBoxes
          ? faceapi.draw.drawDetections(this.canvasEl, resizeResult)
          : faceapi.draw.drawFaceLandmarks(this.canvasEl, resizeResult);
      } else {
        this.canvasEl
          .getContext("2d")
          .clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);
      }
      this.timeout = setTimeout(() => this.fnRunFaceLandmark());
    },
    // 人脸表情识别绘制
    async fnRunFaceExpression() {
      console.log("RunFaceExpression");
      if (this.videoEl.paused) return clearTimeout(this.timeout);
      // 识别绘制人脸信息
      const result = await faceapi[this.detectFace](this.videoEl, this.options)
        .withFaceLandmarks()
        .withFaceExpressions();
      if (result) {
        const dims = faceapi.matchDimensions(this.canvasEl, this.videoEl, true);
        const resizeResult = faceapi.resizeResults(result, dims);
        faceapi.draw.drawFaceExpressions(this.canvasEl, resizeResult, 0.5);
        this.withBoxes
          ? faceapi.draw.drawDetections(this.canvasEl, resizeResult)
          : faceapi.draw.drawFaceLandmarks(this.canvasEl, resizeResult);
      } else {
        this.canvasEl
          .getContext("2d")
          .clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);
      }
      this.timeout = setTimeout(() => this.fnRunFaceExpression());
    },
    // 年龄性别识别绘制
    async fnRunFaceAgeAndGender() {
      console.log("RunFaceAgeAndGender");
      if (this.videoEl.paused) return clearTimeout(this.timeout);
      // 识别绘制人脸信息
      const result = await faceapi[this.detectFace](this.videoEl, this.options)
        .withFaceLandmarks()
        .withAgeAndGender();
      if (result) {
        const dims = faceapi.matchDimensions(this.canvasEl, this.videoEl, true);
        const resizeResult = faceapi.resizeResults(result, dims);
        this.withBoxes
          ? faceapi.draw.drawDetections(this.canvasEl, resizeResult)
          : faceapi.draw.drawFaceLandmarks(this.canvasEl, resizeResult);
        if (Array.isArray(resizeResult)) {
          resizeResult.forEach((result) => {
            const { age, gender, genderProbability } = result;
            new faceapi.draw.DrawTextField(
              [
                `${Math.round(age, 0)} years`,
                `${gender} (${Math.round(genderProbability)})`,
              ],
              result.detection.box.bottomLeft
            ).draw(this.canvasEl);
          });
        } else {
          const { age, gender, genderProbability } = resizeResult;
          new faceapi.draw.DrawTextField(
            [
              `${Math.round(age, 0)} years`,
              `${gender} (${Math.round(genderProbability)})`,
            ],
            resizeResult.detection.box.bottomLeft
          ).draw(this.canvasEl);
        }
      } else {
        this.canvasEl
          .getContext("2d")
          .clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);
      }
      this.timeout = setTimeout(() => this.fnRunFaceAgeAndGender());
    },
    // 执行检测识别类型
    fnRun() {
      if (this.detection === "landmark") {
        this.fnRunFaceLandmark();
        return;
      }
      if (this.detection === "expression") {
        this.fnRunFaceExpression();
        return;
      }
      if (this.detection === "age_gender") {
        this.fnRunFaceAgeAndGender();
        return;
      }
    },
    // 视频暂停播放
    fnPaused() {
      if (this.videoEl.paused) {
        this.videoEl.play();
        setTimeout(() => this.fnRun(), 300);
      } else {
        this.videoEl.pause();
      }
    },
    // 更换视频,清空绘制
    fnChange(e) {
      if (!e.target.files.length) return;
      this.videoEl.pause();
      setTimeout(() => {
        this.canvasEl
          .getContext("2d")
          .clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);
        this.videoEl.src = URL.createObjectURL(e.target.files[0]);
      }, 300);
    },
  },
  beforeDestroy() {
    this.videoEl.pause();
    clearTimeout(this.timeout);
  },
};
</script>

<style scoped>
.see {
  position: relative;
}
.see img {
  max-width: 400px;
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
