<script setup>
import { onMounted, onUnmounted, reactive, watch } from "vue";

/**属性状态 */
const state = reactive({
  /**视频媒体参数配置 */
  constraints: {
    audio: false,
    video: {
      /**ideal（应用最理想的） */
      width: {
        min: 320,
        ideal: 720,
        max: 1280,
      },
      height: {
        min: 200,
        ideal: 480,
        max: 720,
      },
      /**frameRate 受限带宽传输时，低帧率可能更适宜 */
      frameRate: {
        min: 7,
        ideal: 15,
        max: 30,
      },
      /**facingMode 摄像头前后切换 */
      facingMode: "environment",
    },
  },
  /**视频流 */
  stream: null,
  /**视频元素 */
  videoEl: null,
});

/**启动摄像头视频媒体 */
async function fnOpen() {
  if (state.stream !== null) return;
  try {
    state.stream = {}; // 置为空对象，避免重复点击
    const stream = await navigator.mediaDevices.getUserMedia(state.constraints);
    state.stream = stream;
    state.videoEl.srcObject = stream;
    state.videoEl.play();
  } catch (error) {
    state.stream = null; // 置为空，可点击
    console.error(error);
    alert("视频媒体流获取错误: " + error);
  }
}

/**结束摄像头视频媒体 */
function fnClose() {
  if (state.stream === null) return;
  state.videoEl.pause();
  state.videoEl.srcObject = null;
  state.stream.getTracks().forEach((track) => track.stop());
  state.stream = null;
}

// 摄像头前后切换 启用时，关闭后重开
watch(
  () => state.constraints.video.facingMode,
  () => {
    if (state.stream !== null) {
      fnClose();
      fnOpen();
    } else {
      fnClose();
    }
  }
);

onMounted(() => {
  // 节点元素
  state.videoEl = document.getElementById("page_draw-video");
});

onUnmounted(() => {
  fnClose();
});
</script>

<template>
  <div class="page">
    <div class="page_option">
      <div>
        <label>摄像头视频媒体：</label>
        <button @click="fnOpen()" :disabled="state.stream !== null">
          启动
        </button>
        &nbsp;
        <button @click="fnClose()">结束</button>
      </div>
      <div>
        <label>前置or后置切换：</label>
        <select v-model="state.constraints.video.facingMode">
          <option value="user">前置</option>
          <option value="environment">后置</option>
        </select>
      </div>
    </div>
    <div class="page_draw">
      <video
        id="page_draw-video"
        poster="/images/720x480.png"
        muted
        loop
        playsinline
      ></video>
    </div>
  </div>
</template>

<style scoped></style>
