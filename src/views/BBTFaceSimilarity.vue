<script setup>
import * as faceapi from "face-api.js";
import { onMounted, reactive } from "vue";

/**属性状态 */
const state = reactive({
  /**初始化模型加载 */
  netsLoadModel: true,
  /**目标图与识别图的差值，越小越匹配 */
  distance: 0.0,
  /**目标图片元素 */
  targetImgEl: null,
  /**目标数据矩阵 */
  targetDesc: [],
  /**识别图片元素 */
  discernImgEl: null,
  /**识别数据矩阵 */
  discernDesc: [],
});

/**初始化模型加载 */
async function fnLoadModel() {
  // 面部识别模型
  await faceapi.loadFaceRecognitionModel(`${import.meta.env.BASE_URL}/models`);

  // 节点元素
  state.targetImgEl = document.getElementById("page_draw-img-target");
  state.discernImgEl = document.getElementById("page_draw-img-discern");

  // 关闭模型加载
  state.netsLoadModel = false;
}

/**根据模型参数识别绘制 */
async function fnRedraw(keyEl) {
  // 图片数据矩阵
  if (keyEl === "target") {
    state.targetDesc = await faceapi.computeFaceDescriptor(state.targetImgEl);
  }
  if (keyEl === "discern") {
    state.discernDesc = await faceapi.computeFaceDescriptor(state.discernImgEl);
  }
  if (state.targetDesc.length > 0 && state.discernDesc.length > 0) {
    // 对比图片误差值，越小越精确
    state.distance = faceapi
      .euclideanDistance(state.targetDesc, state.discernDesc)
      .toFixed(2);
  }
}

/**更换图片 */
async function fnChange(e, keyEl) {
  if (!e.target || !e.target.files.length) return;
  // 将文件显示为图像并识别
  const img = await faceapi.bufferToImage(e.target.files[0]);
  state[`${keyEl}ImgEl`].src = img.src;
  await fnRedraw(keyEl);
}

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
        <label>偏差值（越小越精确）：</label>
        <strong style="color: #55b881" v-text="state.distance"></strong>
      </div>
    </div>
    <div class="page_load" v-show="state.netsLoadModel">Load Model...</div>
    <div class="page_draw" v-show="!state.netsLoadModel">
      <h3>识别目标图像：</h3>
      <div class="page_draw-target">
        <img id="page_draw-img-target" src="/images/zxx/zxx02.jpg" />
      </div>
      <h3>识别匹配图像：</h3>
      <div class="page_draw-discern">
        <img id="page_draw-img-discern" src="/images/zxx/zxx04.jpg" />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
