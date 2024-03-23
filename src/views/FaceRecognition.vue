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
  /**识别图片元素 */
  discernImgEl: null,
  /**识别画布图层元素 */
  discernCanvasEl: null,
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
    inputSize: 512, // 160 224 320 416 512 608
    scoreThreshold: 0.5, // 0.1 ~ 0.9
  });
  // 模型参数-mtcnn 已弃用，将很快被删除
  await faceapi.nets.mtcnn.loadFromUri(`${import.meta.env.BASE_URL}/models`);
  state.netsOptions.mtcnn = new faceapi.MtcnnOptions({
    minFaceSize: 20, // 1 ~ 50
    scaleFactor: 0.709, // 0.1 ~ 0.9
  });

  // 节点元素
  state.targetImgEl = document.getElementById("page_draw-img-target");
  state.targetCanvasEl = document.getElementById("page_draw-canvas-target");
  state.discernImgEl = document.getElementById("page_draw-img-discern");
  state.discernCanvasEl = document.getElementById("page_draw-canvas-discern");

  // 关闭模型加载
  state.netsLoadModel = false;
}

/**根据模型参数识别绘制 */
async function fnRedraw(keyEl) {
  if (!state.faceMatcher && keyEl === "target") return;

  const detect = await faceapi
    .detectAllFaces(state[`${keyEl}ImgEl`], state.netsOptions[state.netsType])
    // 需引入面部轮廓模型
    .withFaceLandmarks()
    // 需引入面部识别模型
    .withFaceDescriptors();
  if (!detect.length) {
    state.faceMatcher = null;
    return;
  }

  // 目标原图 转匹配矩阵作为目标图片数据匹配对象
  if (keyEl === "target") {
    state.faceMatcher = new faceapi.FaceMatcher(detect);
  }

  // 识别图像绘制
  const dims = faceapi.matchDimensions(
    state[`${keyEl}CanvasEl`],
    state[`${keyEl}ImgEl`]
  );
  const resizedResults = faceapi.resizeResults(detect, dims);
  resizedResults.forEach(({ detection, descriptor }) => {
    // 最佳匹配 distance越小越匹配
    const best = state.faceMatcher.findBestMatch(descriptor);
    let options = {
      label: best.toString(),
    };
    // 目标原图
    if (keyEl === "target") {
      options = {
        label: best.label,
        boxColor: "#55b881",
      };
    }
    // 绘制框
    new faceapi.draw.DrawBox(detection.box, options).draw(
      state[`${keyEl}CanvasEl`]
    );
  });
}

/**更换图片 */
async function fnChange(e, keyEl) {
  if (!e.target || !e.target.files.length) return;
  // 将文件显示为图像并识别
  const img = await faceapi.bufferToImage(e.target.files[0]);
  state[`${keyEl}ImgEl`].src = img.src;
  if (keyEl === "target") {
    await fnRedraw("target");
    await fnRedraw("discern");
  } else {
    await fnRedraw("discern");
  }
}

// 模型变更
watch(
  () => state.netsType,
  () => {
    fnRedraw("target").then(() => fnRedraw("discern"));
  }
);

onMounted(() => {
  fnLoadModel()
    .then(() => fnRedraw("target"))
    .then(() => fnRedraw("discern"));
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
        <img id="page_draw-img-target" src="/images/cp/cp03.jpg" />
        <canvas id="page_draw-canvas-target"></canvas>
      </div>
      <h3>识别匹配图像：</h3>
      <div class="page_draw-discern">
        <img id="page_draw-img-discern" src="/images/cp/cp01.jpg" />
        <canvas id="page_draw-canvas-discern"></canvas>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
