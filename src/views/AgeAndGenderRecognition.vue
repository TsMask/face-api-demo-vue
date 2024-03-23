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
  /**box面框分值, landmark面部轮廓, ageGender年龄性别 */
  draws: ["box", "ageGender"],
  /**图片元素 */
  imgEl: null,
  /**画布图层元素 */
  canvasEl: null,
});

/**初始化模型加载 */
async function fnLoadModel() {
  // 面部轮廓模型
  await faceapi.loadFaceLandmarkModel("/models");
  // 年龄性别模型
  await faceapi.loadAgeGenderModel("/models");

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
    scaleFactor: 0.66, // 0.1 ~ 0.9
  });

  // 节点元素
  state.imgEl = document.getElementById("page_draw-img");
  state.canvasEl = document.getElementById("page_draw-canvas");

  // 关闭模型加载
  state.netsLoadModel = false;
}

/**根据模型参数识别绘制 */
async function fnRedraw() {
  if (!state.imgEl || !state.canvasEl) return;
  const detect = await faceapi
    .detectAllFaces(state.imgEl, state.netsOptions[state.netsType])
    // 需引入面部轮廓模型
    .withFaceLandmarks()
    // 需引入年龄性别模型
    .withAgeAndGender();

  // 匹配元素大小
  const dims = faceapi.matchDimensions(state.canvasEl, state.imgEl, false);
  const result = faceapi.resizeResults(detect, dims);

  // 面框分值
  if (state.draws.includes("box")) {
    faceapi.draw.drawDetections(state.canvasEl, result);
  }
  // 面部轮廓
  if (state.draws.includes("landmark")) {
    // 需引入面部轮廓模型
    faceapi.draw.drawFaceLandmarks(state.canvasEl, result);
  }
  // 年龄性别
  if (state.draws.includes("ageGender")) {
    // 需引入年龄性别模型模型
    result.forEach((item) => {
      const { age, gender, genderProbability } = item;
      new faceapi.draw.DrawTextField(
        [
          `${Math.round(age)} Age`,
          `${gender} (${Math.round(genderProbability)})`,
        ],
        item.detection.box.bottomLeft
      ).draw(state.canvasEl);
    });
  }
}

/**更换图片 */
async function fnChange(e) {
  if (!state.imgEl || !state.canvasEl) return;
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

// 面框变更
watch(
  () => state.draws,
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
        <label>面框分值：</label>
        <input type="checkbox" value="box" v-model="state.draws" />
      </div>
      <div>
        <label>面部轮廓：</label>
        <input type="checkbox" value="landmark" v-model="state.draws" />
      </div>
      <div>
        <label>年龄性别：</label>
        <input type="checkbox" value="ageGender" v-model="state.draws" />
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
      <canvas id="page_draw-canvas"></canvas>
    </div>
  </div>
</template>

<style scoped></style>
