<template>
  <div class="media">
    <video
      class="media-video"
      poster="https://ss0.bdstatic.com/94oJfD_bAAcT8t7mm9GUKT-xh_/timg?image&quality=100&size=b4000_4000&sec=1558759758&di=ccd0b08f63f2b6ea3ca08b651c4fa5f1&src=http://b-ssl.duitang.com/uploads/item/201610/05/20161005105402_xiLsK.thumb.700_0.jpeg"
      ref="videoDom"
      playsinline
      autoplay
    ></video>
    <canvas class="media-canvas" ref="canvasDOM"></canvas>
  </div>
</template>

<script>
import * as faceapi from "face-api.js";

export default {
  name: "VideoMediaCanvasStream",
  data() {
    return {
      videoEl: {},
      canvasEL: {},
      facingMode: false,
      userMediaConstraints: {
        audio: false,
        video: {
          // ideal（应用最理想的）
          width: {
            min: 320,
            ideal: 1280,
            max: 1920
          },
          height: {
            min: 240,
            ideal: 720,
            max: 1080
          },
          // frameRate受限带宽传输时，低帧率可能更适宜
          frameRate: {
            min: 15,
            ideal: 30,
            max: 60
          },
          // 摄像头翻转
          facingMode: this.facingMode ? "user" : "environment"
        }
      },
      timeInterval: 0,
      failCount: 0
    };
  },
  created() {
    this.init();
  },
  methods: {
    // 初始化
    async init() {
      // 加载模型
      await faceapi.loadTinyFaceDetectorModel("/models");
      // dom元素
      this.videoEl = this.$refs.videoDom;
      this.canvasEL = this.$refs.canvasDOM;
      // 启动WebRTC驱动摄像头视频媒体
      await navigator.mediaDevices
        .getUserMedia(this.userMediaConstraints)
        .then(this.getMediaStreamSuccess)
        .catch(this.getMediaStreamError);
      // 启动检测
      await this.onPlay();
    },
    // 视频绘制图像框
    async onPlay() {
      // 时间计时
      const ts = Date.now();
      // 判断视频对象是否暂停结束
      if (this.videoEl.paused || this.videoEl.ended) {
        this.timeInterval = setInterval(() => this.onPlay());
        return;
      }
      // 简单人脸检测扫描
      const faceDetectionTask = await faceapi.detectSingleFace(
        this.videoEl,
        new faceapi.TinyFaceDetectorOptions({
          inputSize: 512,
          scoreThreshold: 0.5
        })
      );
      // 判断人脸扫描结果
      if (faceDetectionTask) {
        this.failCount = 0;
        // 画布绘制人脸框
        this.drawDetections(this.videoEl, this.canvasEL, [faceDetectionTask]);
      } else {
        this.failCount += 1;
        if (this.failCount > 20) {
          this.canvasEL.width = this.videoEl.videoWidth;
          this.canvasEL.height = this.videoEl.videoHeight;
          // 画布绘制
          const ctx = this.canvasEL.getContext("2d");
          const linearGradient = ctx.createLinearGradient(0, 0, 300, 0);
          linearGradient.addColorStop("0", "#40E0D0");
          linearGradient.addColorStop("0.5", "#FF8C00");
          linearGradient.addColorStop("1.0", "#FF0080");
          // 绘制信息
          ctx.font = "35px FZShuTi";
          ctx.fillStyle = linearGradient;
          ctx.fillText("请将进入检测区", 20, 50);
        }
        console.log(this.failCount, "检测失败");
      }
      // 绘制刷新状态
      const runTime = {
        time: Math.round(Date.now() - ts),
        fps: faceapi.round(1000 / (Date.now() - ts))
      };
      // 绘制时间
      console.log("绘制时间:", runTime);
    },
    // 人脸框绘制
    drawDetections(dimensions, canvas, detections) {
      // 初始画布大小
      canvas.width = dimensions.videoWidth;
      canvas.height = dimensions.videoHeight;
      // 视频对象人脸框在画布中绘制
      detections.forEach(det => {
        const { x, y, width, height } = det.box;
        const ctx = canvas.getContext("2d");
        ctx.strokeStyle = "red";
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, width, height);
      });
    },
    // 视频媒体流成功
    getMediaStreamSuccess(stream) {
      window.stream = stream; // make stream available to browser console
      this.videoEl.srcObject = stream;
    },
    // 视频媒体流失败
    getMediaStreamError(error) {
      alert("视频媒体流获取错误" + error);
    },
    // 结束媒体流
    stopMediaStreamTrack() {
      clearInterval(this.timeInterval);
      if (typeof window.stream === "object") {
        this.videoEl.srcObject = null;
        window.stream.getTracks().forEach(track => track.stop());
      }
    }
  },
  beforeDestroy() {
    this.stopMediaStreamTrack();
  }
};
</script>

<style scoped>
.media {
  position: relative;
}
.media-video {
  max-height: 860px;
  height: 100%;
  width: 100%;
  display: block;
  background-color: #242424;
}
.media-canvas {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
}
</style>
