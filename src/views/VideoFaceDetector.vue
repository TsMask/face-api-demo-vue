<template>
  <div class="video_face_detector">
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
  name: "VideoFaceDetector",
  data() {
    return {
      nets: "tinyFaceDetector", // 模型
      options: null, // 模型参数
      detectFace: "detectSingleFace", // 单or多人脸
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
    // 节点对象执行递归识别绘制
    async fnRun() {
      console.log("Run");
      if (this.videoEl.paused) return clearTimeout(this.timeout);
      // 识别绘制人脸信息
      const result = await faceapi[this.detectFace](this.videoEl, this.options);
      if (result && !this.videoEl.paused) {
        const dims = faceapi.matchDimensions(this.canvasEl, this.videoEl, true);
        const resizeResults = faceapi.resizeResults(result, dims);
        faceapi.draw.drawDetections(this.canvasEl, resizeResults);
      } else {
        this.canvasEl
          .getContext("2d")
          .clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);
      }
      this.timeout = setTimeout(() => this.fnRun());
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
button {
  height: 30px;
  border: 2px #42b983 solid;
  border-radius: 4px;
  background: #42b983;
  color: white;
  margin: 10px;
}
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
