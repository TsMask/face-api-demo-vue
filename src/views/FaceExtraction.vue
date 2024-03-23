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
  /**图片元素 */
  imgEl: null,
  /**画布元素盒子 */
  canvasBoxEl: null,
});

/**初始化模型加载 */
async function fnLoadModel() {
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
  state.imgEl = document.getElementById("page_draw-img");
  state.canvasBoxEl = document.getElementById("page_draw-canvas-box");

  // 关闭模型加载
  state.netsLoadModel = false;
}

/**根据模型参数识别绘制 */
async function fnRedraw() {
  if (!state.imgEl || !state.canvasBoxEl) return;
  // 匹配出人脸进行提取输出canvas对象
  const detections = await faceapi.detectAllFaces(
    state.imgEl,
    state.netsOptions[state.netsType]
  );
  const faceImages = await faceapi.extractFaces(state.imgEl, detections);
  faceImages.forEach((canvasEl) => state.canvasBoxEl.appendChild(canvasEl));
  // 添加虚线
  state.canvasBoxEl.appendChild(document.createElement("HR"));
}

/**更换图片 */
async function fnChange(e) {
  if (!state.imgEl || !state.canvasBoxEl) return;
  if (!e.target || !e.target.files.length) return;
  // 将文件显示为图像并识别
  const img = await faceapi.bufferToImage(e.target.files[0]);
  state.imgEl.src = img.src;
  await fnRedraw();
}

// 模型变更
watch(
  () => state.netsType,
  () => {
    fnRedraw();
  }
);

onMounted(() => {
  fnLoadModel().finally(() => fnRedraw());
});
</script>

<template>
  <div class="page">
    <div class="page_option">
      <div>
        <label>更换图片：</label>
        <input
          type="file"
          accept="image/png, image/jpeg"
          @change="fnChange($event)"
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
      <img id="page_draw-img" src="/images/cp/cp01.jpg" />
      <h3>提取出的人脸图像：</h3>
      <div id="page_draw-canvas-box"></div>
    </div>
  </div>
</template>

<style scoped></style>
