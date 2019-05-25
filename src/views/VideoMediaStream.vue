<template>
  <video
    class="videoStyle"
    poster="https://ss0.bdstatic.com/94oJfD_bAAcT8t7mm9GUKT-xh_/timg?image&quality=100&size=b4000_4000&sec=1558759758&di=ccd0b08f63f2b6ea3ca08b651c4fa5f1&src=http://b-ssl.duitang.com/uploads/item/201610/05/20161005105402_xiLsK.thumb.700_0.jpeg"
    ref="video"
    playsinline
    autoplay
  ></video>
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
    },
    getMediaStreamError(error) {
      alert("视频媒体流获取错误" + error);
    },
    // 结束媒体流
    stopMediaStreamTrack() {
      if (typeof window.stream === "object") {
        this.videoDom.srcObject = null;
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
.videoStyle {
  max-height: 860px;
  height: 100%;
  width: 100%;
  display: block;
  background-color: #242424;
}
</style>
