<script setup>
import * as faceapi from "face-api.js";
import { onMounted, reactive, watch } from "vue";

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
  /**识别图片元素盒子 */
  discernCanvasBoxEl: null,
});

/**初始化模型加载 */
async function fnLoadModel() {
  // 面部轮廓模型
  await faceapi.loadFaceLandmarkModel("/models");
  // 面部识别模型
  await faceapi.loadFaceRecognitionModel("/models");

  // 模型参数-ssdMobilenetv1
  await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
  state.netsOptions.ssdMobilenetv1 = new faceapi.SsdMobilenetv1Options({
    minConfidence: 0.5, // 0.1 ~ 0.9
  });
  // 模型参数-tinyFaceDetector
  await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
  state.netsOptions.tinyFaceDetector = new faceapi.TinyFaceDetectorOptions({
    inputSize: 512, // 160 224 320 416 512 608
    scoreThreshold: 0.5, // 0.1 ~ 0.9
  });
  // 模型参数-mtcnn 已弃用，将很快被删除
  await faceapi.nets.mtcnn.loadFromUri("/models");
  state.netsOptions.mtcnn = new faceapi.MtcnnOptions({
    minFaceSize: 20, // 1 ~ 50
    scaleFactor: 0.709, // 0.1 ~ 0.9
  });

  // 节点元素
  state.targetImgEl = document.getElementById("page_draw-img-target");
  state.targetCanvasEl = document.getElementById("page_draw-canvas-target");
  state.discernCanvasBoxEl = document.getElementById("page_draw-canvas-box");

  // 关闭模型加载
  state.netsLoadModel = false;
}

/**根据模型参数识别绘制--目标图 */
async function fnRedrawTarget() {
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
async function fnRedrawDiscern(src) {
  if (!state.faceMatcher) return;

  // 节点对象创建-识别项盒子
  const divEl = document.createElement("DIV");
  divEl.className = "page_draw-discern";
  // 节点对象创建-识别图片
  const imgEl = document.createElement("IMG");
  imgEl.id = "page_draw-img-discern";
  imgEl.src = src;
  divEl.appendChild(imgEl);
  // 节点对象创建-识别图层
  const canvasEl = document.createElement("CANVAS");
  canvasEl.id = "page_draw-canvas-discern";
  divEl.appendChild(canvasEl);
  state.discernCanvasBoxEl.appendChild(divEl);
  // 添加虚线
  state.discernCanvasBoxEl.appendChild(document.createElement("HR"));

  // 识别人脸
  const detect = await faceapi
    .detectAllFaces(imgEl, state.netsOptions[state.netsType])
    // 需引入面部轮廓模型
    .withFaceLandmarks()
    // 需引入面部识别模型
    .withFaceDescriptors();
  if (!detect.length) return;

  // 显示的图层匹配图片尺寸
  const dims = faceapi.matchDimensions(canvasEl, imgEl);
  const resizedResults = faceapi.resizeResults(detect, dims);
  resizedResults.forEach(({ detection, descriptor }) => {
    // 最佳匹配 distance越小越匹配
    const best = state.faceMatcher.findBestMatch(descriptor);
    // 识别图绘制框
    const label = best.toString();
    new faceapi.draw.DrawBox(detection.box, { label }).draw(canvasEl);
  });
}

/**更换图片 */
async function fnChange(e, keyEl) {
  if (!e.target || !e.target.files.length) return;
  // 清空识别图区
  state.discernCanvasBoxEl.innerHTML = "";
  if (keyEl === "target") {
    const img = await faceapi.bufferToImage(e.target.files[0]);
    state.targetImgEl.src = img.src;
    fnRedrawTarget().then(() => fnRedrawDiscern(state.targetImgEl.src));
  } else {
    for (const file of e.target.files) {
      const img = await faceapi.bufferToImage(file);
      fnRedrawDiscern(img.src);
    }
  }
}

// 模型变更
watch(
  () => state.netsType,
  () => {
    state.discernCanvasBoxEl.innerHTML = "";
    fnRedrawTarget().then(() => fnRedrawDiscern(state.targetImgEl.src));
  }
);

onMounted(() => {
  fnLoadModel()
    .then(() => fnRedrawTarget())
    .then(() => fnRedrawDiscern(state.targetImgEl.src));
});
</script>

<template>
  <div class="page">
    <div class="page_option">
      <div>
        <label>更换目标图：</label>
        <input
          type="file"
          accept="image/png, image/jpeg"
          @change="fnChange($event, 'target')"
        />
      </div>
      <div>
        <label>更换匹配图：</label>
        <input
          type="file"
          accept="image/png, image/jpeg"
          multiple="multiple"
          @change="fnChange($event, 'discern')"
        />
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
        <img id="page_draw-img-target" src="/images/cp/cp04.jpg" />
        <canvas id="page_draw-canvas-target"></canvas>
      </div>
      <h3>识别匹配图像：</h3>
      <div id="page_draw-canvas-box"></div>
    </div>
  </div>
</template>

<style scoped></style>
