<script setup>
import * as faceapi from "face-api.js";
import { onMounted, onUnmounted, reactive } from "vue";

/**属性状态 */
const state = reactive({
  /**初始化模型加载 */
  netsLoadModel: true,
  /**算法模型 */
  netsType: "ssdMobilenetv1",
  /**模型参数 */
  netsOptions: {
    ssdMobilenetv1: undefined,
    tinyFaceDetector: undefined,
    mtcnn: undefined,
  },
  /**目标图片数据匹配对象 */
  faceMatcher: {},
  /**目标图片元素 */
  targetImgEl: null,
  /**目标画布图层元素 */
  targetCanvasEl: null,
  /**识别视频元素 */
  discernVideoEl: null,
  /**识别画布图层元素 */
  discernCanvasEl: null,
  /**绘制定时器 */
  timer: 0,
});

/**初始化模型加载 */
async function fnLoadModel() {
  // 面部轮廓模型
  await faceapi.loadFaceLandmarkModel(`${import.meta.env.BASE_URL}/models`);
  // 面部识别模型
  await faceapi.loadFaceRecognitionModel(`${import.meta.env.BASE_URL}/models`);

  // 模型参数-ssdMobilenetv1
  await faceapi.nets.ssdMobilenetv1.loadFromUri(`${import.meta.env.BASE_URL}/models`);
  state.netsOptions.ssdMobilenetv1 = new faceapi.SsdMobilenetv1Options({
    minConfidence: 0.5, // 0.1 ~ 0.9
  });
  // 模型参数-tinyFaceDetector
  await faceapi.nets.tinyFaceDetector.loadFromUri(`${import.meta.env.BASE_URL}/models`);
  state.netsOptions.tinyFaceDetector = new faceapi.TinyFaceDetectorOptions({
    inputSize: 224, // 160 224 320 416 512 608
    scoreThreshold: 0.5, // 0.1 ~ 0.9
  });
  // 模型参数-mtcnn 已弃用，将很快被删除
  await faceapi.nets.mtcnn.loadFromUri(`${import.meta.env.BASE_URL}/models`);
  state.netsOptions.mtcnn = new faceapi.MtcnnOptions({
    minFaceSize: 20, // 1 ~ 50
    scaleFactor: 0.56, // 0.1 ~ 0.9
  });

  // 节点元素
  state.targetImgEl = document.getElementById("page_draw-img-target");
  state.targetCanvasEl = document.getElementById("page_draw-canvas-target");
  state.discernVideoEl = document.getElementById("page_draw-video");
  state.discernCanvasEl = document.getElementById("page_draw-video-canvas");

  // 关闭模型加载
  state.netsLoadModel = false;
}

/**根据模型参数识别绘制--目标图 */
async function fnRedrawTarget() {
  console.log("Run Redraw Target");
  const detect = await faceapi
    .detectAllFaces(state.targetImgEl, state.netsOptions[state.netsType])
    // 需引入面部轮廓模型
    .withFaceLandmarks()
    // 需引入面部识别模型
    .withFaceDescriptors();
  if (!detect.length) {
    state.faceMatcher = null;
    return;
  }

  // 原图人脸矩阵结果
  state.faceMatcher = new faceapi.FaceMatcher(detect);

  // 识别图像绘制
  const dims = faceapi.matchDimensions(state.targetCanvasEl, state.targetImgEl);
  const resizedResults = faceapi.resizeResults(detect, dims);
  resizedResults.forEach(({ detection, descriptor }) => {
    const best = state.faceMatcher.findBestMatch(descriptor);
    // 目标原图绘制框
    new faceapi.draw.DrawBox(detection.box, {
      label: best.label,
      boxColor: "#55b881",
    }).draw(state.targetCanvasEl);
  });
}

/**根据模型参数识别绘制 */
async function fnRedrawDiscern() {
  if (!state.faceMatcher) return;
  console.log("Run Redraw Discern");

  // 暂停视频时清除定时
  if (state.discernVideoEl.paused) {
    clearTimeout(state.timer);
    state.timer = 0;
    return;
  }

  // 识别绘制人脸信息
  const detect = await faceapi
    .detectAllFaces(state.discernVideoEl, state.netsOptions[state.netsType])
    // 需引入面部轮廓模型
    .withFaceLandmarks()
    // 需引入面部识别模型
    .withFaceDescriptors();

  // 无识别数据时，清除定时重新再次识别
  if (!detect) {
    clearTimeout(state.timer);
    state.timer = 0;
    fnRedrawDiscern();
    return;
  }

  // 匹配元素大小
  const dims = faceapi.matchDimensions(
    state.discernCanvasEl,
    state.discernVideoEl,
    true
  );
  const result = faceapi.resizeResults(detect, dims);
  result.forEach(({ detection, descriptor }) => {
    // 最佳匹配 distance越小越匹配
    const best = state.faceMatcher.findBestMatch(descriptor);
    // 识别图绘制框
    const label = best.toString();
    new faceapi.draw.DrawBox(detection.box, { label }).draw(
      state.discernCanvasEl
    );
  });

  // 定时器句柄
  state.timer = setTimeout(() => fnRedrawDiscern(), 0);
}

/**
 * 视频暂停播放
 *
 * 播放视频，开始识别绘制
 *
 * 暂停视频，不清除画布
 */
function fnVidelPaused() {
  if (state.discernVideoEl.paused) {
    state.discernVideoEl.play();
    setTimeout(() => fnRedrawDiscern(), 300);
  } else {
    state.discernVideoEl.pause();
  }
}

/**更换图片 */
async function fnChangeTarget(e) {
  if (!state.targetImgEl || !state.targetCanvasEl) return;
  if (!e.target || !e.target.files.length) return;
  // 将文件显示为图像并识别
  const img = await faceapi.bufferToImage(e.target.files[0]);
  state.targetImgEl.src = img.src;
  fnRedrawTarget();
}

/**更换视频 */
function fnChangeDiscern(e) {
  if (!state.discernVideoEl || !state.discernCanvasEl) return;
  if (!e.target || !e.target.files.length) return;
  // 将文件显示为视频并识别
  state.discernVideoEl.pause();
  state.discernVideoEl.src = URL.createObjectURL(e.target.files[0]);
  clearTimeout(state.timer);
  state.timer = 0;

  setTimeout(() => {
    // 清空画布
    state.discernCanvasEl
      .getContext("2d")
      .clearRect(
        0,
        0,
        state.discernCanvasEl.width,
        state.discernCanvasEl.height
      );
  }, 300);
}

onMounted(() => {
  fnLoadModel().then(() => fnRedrawTarget());
});

onUnmounted(() => {
  clearTimeout(state.timer);
  state.timer = 0;
});
</script>

<template>
  <div class="page">
    <div class="page_option">
      <div>
        <label>更换目标图片：</label>
        <input
          type="file"
          accept="image/png, image/jpeg"
          @change="fnChangeTarget($event)"
        />
      </div>
      <div>
        <label>更换识别视频：</label>
        <input
          type="file"
          accept="video/mp4, video/ogg, video/webm"
          @change="fnChangeDiscern($event)"
        />
      </div>
      <div>
        <label>视频媒体：</label>
        <button @click="fnVidelPaused()">播放/暂停</button>
      </div>
      <div>
        <label>算法模型：</label>
        <select v-model="state.netsType">
          <option value="ssdMobilenetv1">SSD Mobilenet V1</option>
          <option value="tinyFaceDetector">Tiny Face Detector</option>
          <option value="mtcnn">MTCNN</option>
        </select>
      </div>
    </div>

    <div class="page_load" v-show="state.netsLoadModel">Load Model...</div>
    <div class="page_draw" v-show="!state.netsLoadModel">
      <h3>识别目标图像：</h3>
      <div class="page_draw-target">
        <img id="page_draw-img-target" src="/images/cp/cp01.jpg" />
        <canvas id="page_draw-canvas-target"></canvas>
      </div>
      <h3>识别匹配视频：</h3>
      <div class="page_draw-discern">
        <video
          id="page_draw-video"
          poster="/images/720x480.png"
          src="/videos/test.mp4"
          muted
          playsinline
        ></video>
        <canvas id="page_draw-video-canvas"></canvas>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
