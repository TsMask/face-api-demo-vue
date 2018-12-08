<template>
    <video class="videoStyle" 
    :poster="videoPoster" 
    ref="video"
    playsinline autoplay>
    </video>
</template>

<script>
export default {
  name: "VideoMediaStream",
  data() {
    return {
      videoDom: "",
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
          facingMode: this.facingMode ? "user" : "environment"
        }
      }
    };
  },
  computed: {
    videoPoster() {
      return this.$store.state.setting.videoPoster;
    }
  },
  mounted() {
    this.videoDom = this.$refs.video;
    // 启动摄像头视频媒体
    navigator.mediaDevices
      .getUserMedia(this.userMediaConstraints)
      .then(this.getMediaStreamSuccess)
      .catch(this.getMediaStreamError);
  },
  methods: {
    // 视频媒体流
    getMediaStreamSuccess(stream) {
      window.stream = stream; // make stream available to browser console
      this.videoDom.srcObject = stream;
      this.$store.commit("setVideoObject", this.videoDom);
    },
    getMediaStreamError(error) {
      alert("视频媒体流获取错误" + error);
    },
    // 结束媒体流
    stopMediaStreamTrack() {
      if (typeof window.stream === "object") {
        this.videoDom.srcObject = null;
        this.$store.commit("setVideoObject", " ");
        window.stream.getTracks().forEach(track => track.stop());
      }
    }
  },
  beforeDestroy() {
    this.stopMediaStreamTrack();
  }
};
</script>

<style lang="less" scoped>
.videoStyle {
  max-height: 860px;
  height: 100%;
  width: 100%;
  display: block;
  background-color: #242424;
}
</style>
