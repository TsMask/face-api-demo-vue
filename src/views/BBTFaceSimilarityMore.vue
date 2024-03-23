<script setup>
import * as faceapi from "face-api.js";
import { onMounted, reactive } from "vue";

/**属性状态 */
const state = reactive({
  /**初始化模型加载 */
  netsLoadModel: true,
  // 预设样本图，支持本地，网络，beas64
  sampleArr: [
    {
      name: "张伟",
      imgs: [
        "/images/zw/zw01.jpg",
        "/images/zw/zw02.jpg",
        "/images/zw/zw03.jpg",
        "/images/zw/zw04.jpg",
      ],
    },
    {
      name: "曾小贤",
      imgs: [
        "/images/zxx/zxx01.jpg",
        "/images/zxx/zxx02.jpg",
        "/images/zxx/zxx03.jpg",
        "/images/zxx/zxx04.jpg",
      ],
    },
  ],
  // 匹配图，支持本地，网络，beas64
  detArr: [
    "/images/zw/zw04.jpg",
    "/images/zw/zw02.jpg",
    "/images/zxx/zxx02.jpg",
    "/images/zxx/zxx04.jpg",
  ],
  // 匹配结果
  resultArr: [],
  // 人脸匹配矩阵数组对象转码结果
  faceMatcher: null,
});

/**初始化模型加载 */
async function fnLoadModel() {
  // 面部识别模型
  await faceapi.loadFaceRecognitionModel("/models");

  // 关闭模型加载
  state.netsLoadModel = false;
}

// 样本图片数据矩阵，生成人脸匹配对象
async function fnFaceMatcherDesc() {
  const labeledFaceDescriptors = await Promise.all(
    state.sampleArr.map(async (item) => {
      // 临时图片转码数据，将图片对象转数据矩阵对象
      const descriptors = [];
      for (const image of item.imgs) {
        const imageEl = await faceapi.fetchImage(image);
        descriptors.push(await faceapi.computeFaceDescriptor(imageEl));
      }
      // 返回图片用户和图片转码数组
      return new faceapi.LabeledFaceDescriptors(item.name, descriptors);
    })
  );
  // 人脸匹配矩阵数组对象转码结果
  state.faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors);
}

/**根据模型参数识别绘制 */
async function fnRedraw() {
  // 清空结果
  state.resultArr = [];
  for (const img of state.detArr) {
    const milliseconds = Date.now();
    // 将图片转为图片元素对象
    const imageEl = await faceapi.fetchImage(img);
    // 将图片对象转数据矩阵对象，进行匹配
    const desc = await faceapi.computeFaceDescriptor(imageEl);
    const best = await state.faceMatcher.findBestMatch(desc);
    const ms = Date.now() - milliseconds;
    // 结果
    state.resultArr.push({
      imgUrl: imageEl.src,
      result: best.toString(),
      time: `${ms} ms`,
      fps: Math.round(1000 / ms),
    });
  }
}

/**更换匹配图 */
async function fnChangeDet(e) {
  if (!e.target || !e.target.files.length) return;
  state.detArr = [];
  // 将文件显示为图像并识别
  for (const file of e.target.files) {
    const inputEl = await faceapi.bufferToImage(file);
    state.detArr.push(inputEl.src);
  }
  await fnRedraw();
}

/**新增样本图 */
async function fnChangeSample(e) {
  if (!e.target || !e.target.files.length) return;
  // 将文件显示为图像并识别
  let sampleItme = {
    name: `${Date.now()}`,
    imgs: [],
  };
  for (const file of e.target.files) {
    const inputEl = await faceapi.bufferToImage(file);
    sampleItme.imgs.push(inputEl.src);
  }
  state.sampleArr.push(sampleItme);
  await fnFaceMatcherDesc();
}

onMounted(() => {
  fnLoadModel()
    .then(() => fnFaceMatcherDesc())
    .then(() => fnRedraw());
});
</script>

<template>
  <div class="page" style="display: flex; justify-content: space-between">
    <div class="page_option" style="flex-basis: 60%">
      <div>
        <label>新增样本图多选择：</label>
        <input
          type="file"
          accept="image/png, image/jpeg"
          multiple="multiple"
          @change="fnChangeSample($event)"
        />
      </div>
      <div>
        <label>更换匹配图多选择：</label>
        <input
          type="file"
          accept="image/png, image/jpeg"
          multiple="multiple"
          @change="fnChangeDet($event)"
        />
      </div>
      <h3>识别匹配图像：</h3>
      <div class="draw">
        <img v-for="(det, i) in state.detArr" :key="i" :src="det" alt="det" />
      </div>
      <h3>样本库：</h3>
      <template v-for="item in state.sampleArr" :key="item.name">
        <span style="color: #55b881" v-text="item.name"></span>
        <div class="draw">
          <img
            v-for="img in item.imgs"
            :key="img"
            :src="img"
            :alt="item.name"
          />
        </div>
      </template>
    </div>
    <div class="page_load" style="flex-basis: 38%" v-show="state.netsLoadModel">
      Load Model...
    </div>
    <div
      class="page_draw"
      style="flex-basis: 38%"
      v-show="!state.netsLoadModel"
    >
      <h3>识别结果（误差值越小越准确）：</h3>
      <div v-for="(res, i) in state.resultArr" :key="i" class="draw result">
        <img :src="res.imgUrl" :alt="res.result" />
        <div class="info">
          <span>结果: {{ res.result }}</span>
          <span>时间: {{ res.time }}</span>
          <span>FPS: {{ res.fps }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.draw {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin-bottom: 20px;
}
.draw img {
  width: 90px;
  height: 90px;
  margin: 10px;
}
.draw.result {
  display: flex;
  flex-direction: row;
  margin: unset;
}
.draw.result .info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  min-width: 200px;
}
</style>
