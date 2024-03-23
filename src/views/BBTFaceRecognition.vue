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
  // 预设样本图，支持本地，网络，beas64
  sampleArr: [
    {
      name: "张伟",
      imgs: [
        `${import.meta.env.BASE_URL}/images/zw/face/zw01.png`,
        `${import.meta.env.BASE_URL}/images/zw/face/zw02.png`,
        `${import.meta.env.BASE_URL}/images/zw/face/zw03.png`,
        `${import.meta.env.BASE_URL}/images/zw/face/zw04.png`,
      ],
    },
    {
      name: "曾小贤",
      imgs: [
        `${import.meta.env.BASE_URL}/images/zxx/face/zxx01.png`,
        `${import.meta.env.BASE_URL}/images/zxx/face/zxx02.png`,
        `${import.meta.env.BASE_URL}/images/zxx/face/zxx03.png`,
        `${import.meta.env.BASE_URL}/images/zxx/face/zxx04.png`,
      ],
    },
  ],
});

/**初始化模型加载 */
async function fnLoadModel() {
  // 面部轮廓模型
  await faceapi.loadFaceLandmarkModel(`${import.meta.env.BASE_URL}/models`);
  // 面部识别模型
  await faceapi.loadFaceRecognitionModel(`${import.meta.env.BASE_URL}/models`);

  // 模型参数-ssdMobilenetv1
  await faceapi.nets.ssdMobilenetv1.loadFromUri(
    `${import.meta.env.BASE_URL}/models`
  );
  state.netsOptions.ssdMobilenetv1 = new faceapi.SsdMobilenetv1Options({
    minConfidence: 0.6, // 0.1 ~ 0.9
  });
  // 模型参数-tinyFaceDetector
  await faceapi.nets.tinyFaceDetector.loadFromUri(
    `${import.meta.env.BASE_URL}/models`
  );
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
  const detect = await faceapi
    .detectAllFaces(state.targetImgEl, state.netsOptions[state.netsType])
    // 需引入面部轮廓模型
    .withFaceLandmarks()
    // 需引入面部识别模型
    .withFaceDescriptors();
  if (!detect.length) {
    state.faceMatcher = null;
    fnFaceMatcherDesc();
    return;
  }
  // 识别图像绘制
  const dims = faceapi.matchDimensions(state.targetCanvasEl, state.targetImgEl);
  const resizedResults = faceapi.resizeResults(detect, dims);
  resizedResults.forEach(({ detection, descriptor }) => {
    // 最佳匹配 distance越小越匹配
    const best = state.faceMatcher.findBestMatch(descriptor);
    // 识别图绘制框
    const label = best.toString();
    // 绘制框
    new faceapi.draw.DrawBox(detection.box, {
      label,
      boxColor: "#55b881",
    }).draw(state.targetCanvasEl);
  });
}

/**更换目标图片 */
async function fnChangeTarget(e) {
  if (!e.target || !e.target.files.length) return;
  // 将文件显示为图像并识别
  const img = await faceapi.bufferToImage(e.target.files[0]);
  state.targetImgEl.src = img.src;
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

  state.faceMatcher = null;
  fnFaceMatcherDesc();
}

// 模型变更
watch(
  () => state.netsType,
  () => {
    fnRedraw();
  }
);

onMounted(() => {
  fnLoadModel()
    .then(() => fnFaceMatcherDesc())
    .then(() => fnRedraw());
});
</script>

<template>
  <div class="page">
    <div class="page_option">
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
        <label>更换匹配图单选择：</label>
        <input
          type="file"
          accept="image/png, image/jpeg"
          @change="fnChangeTarget($event)"
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
      <div style="color: #f44336">
        <label>注意：</label>
        <span>请使用人脸提取得到的图像作为样本进行识别</span>
      </div>
    </div>
    <div class="page_load" v-show="state.netsLoadModel">Load Model...</div>
    <div class="page_draw" v-show="!state.netsLoadModel">
      <h3>匹配图：</h3>
      <div class="page_draw-target">
        <img id="page_draw-img-target" src="/images/cp/cp03.jpg" />
        <canvas id="page_draw-canvas-target"></canvas>
      </div>
      <h3>样本库：</h3>
      <div v-for="(item, i) in state.sampleArr" :key="i">
        <span style="color: #55b881" v-text="item.name"></span>
        <div class="draw">
          <img
            v-for="img in item.imgs"
            :key="img"
            :src="img"
            :alt="item.name"
          />
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
}
.draw img {
  max-width: 90px;
  max-height: 90px;
  margin: 10px;
}
</style>
