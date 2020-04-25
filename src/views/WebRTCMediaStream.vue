<template>
  <div class="webrtc_media_stream">
    <div>
      <button @click="fnOpen">启动摄像头视频媒体</button>
      <button @click="fnClose">结束摄像头视频媒体</button>
      <div>
        <span style="margin-right: 20px;"
          >前置后置切换（重新启动摄像头）：</span
        >
        <label>
          前置
          <input
            type="radio"
            v-model="constraints.video.facingMode"
            value="user"
          />
        </label>
        <label>
          后置
          <input
            type="radio"
            v-model="constraints.video.facingMode"
            value="environment"
          />
        </label>
      </div>
    </div>
    <hr />
    <video
      id="myVideo"
      poster="https://dummyimage.com/1280x720"
      muted
      loop
      playsinline
    ></video>
  </div>
</template>

<script>
export default {
  name: "WebRTCMediaStream",
  data() {
    return {
      videoEl: null,
      device: null,
      // 视频媒体参数配置
      constraints: {
        audio: false,
        video: {
          // ideal（应用最理想的）
          width: {
            min: 320,
            ideal: 1280,
            max: 1920,
          },
          height: {
            min: 240,
            ideal: 720,
            max: 1080,
          },
          // frameRate受限带宽传输时，低帧率可能更适宜
          frameRate: {
            min: 15,
            ideal: 30,
            max: 60,
          },
          facingMode: "environment",
        },
      },
    };
  },
  mounted() {
    this.videoEl = document.getElementById("myVideo");
  },
  methods: {
    // 启动摄像头视频媒体
    fnOpen() {
      if (typeof window.stream === "object") return;
      clearTimeout(this.device);
      this.device = setTimeout(() => {
        clearTimeout(this.device);
        navigator.mediaDevices
          .getUserMedia(this.constraints)
          .then(this.fnSuccess)
          .catch(this.fnError);
      }, 500);
    },
    // 成功启动视频媒体流
    fnSuccess(stream) {
      window.stream = stream; // 使流对浏览器控制台可用
      this.videoEl.srcObject = stream;
      this.videoEl.play();
    },
    // 失败启动视频媒体流
    fnError(error) {
      console.log(error);
      alert("视频媒体流获取错误" + error);
    },
    // 结束摄像头视频媒体
    fnClose() {
      this.videoEl.pause();
      if (typeof window.stream === "object") {
        this.videoEl.srcObject = null;
        window.stream.getTracks().forEach((track) => track.stop());
        window.stream = "";
        this.videoEl.srcObject = null;
      }
    },
  },
  beforeDestroy() {
    this.fnClose();
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
</style>
