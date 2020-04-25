<template>
  <div class="face_recognition_library">
    <div class="option">
      <div>
        <label>匹配图选择：</label>
        <input
          type="file"
          accept="image/png, image/jpeg"
          @change="fnChange($event)"
        />
      </div>
      <div>
        <label>选择算法模型</label>
        <label>
          ssdMobilenetv1
          <input type="radio" v-model="nets" value="ssdMobilenetv1" />
        </label>
        <label>
          tinyFaceDetector
          <input type="radio" v-model="nets" value="tinyFaceDetector" />
        </label>
        <label>
          mtcnn
          <input type="radio" v-model="nets" value="mtcnn" />
        </label>
      </div>
    </div>
    <h3>匹配图：</h3>
    <div class="target">
      <img id="targetImg" src="images/xxm/xxm03.jpg" />
      <canvas id="targetCanvas" />
    </div>
    <h3>样本库：</h3>
    <div v-for="(item, i) in sampleArr" :key="i">
      <span style="color: #42b983;" v-text="item.name"></span>
      <div class="pic">
        <img v-for="img in item.img" :key="img" :src="img" :alt="item.name" />
      </div>
    </div>
  </div>
</template>

<script>
import * as faceapi from "face-api.js";
export default {
  name: "BBTFaceRecognition",
  data() {
    return {
      nets: "ssdMobilenetv1",
      options: null,
      // 预设样本图，支持本地，网络，beas64
      sampleArr: [
        {
          name: "欣小萌",
          img: [
            "images/xxm/face/xxm01.png",
            "images/xxm/face/xxm02.png",
            "images/xxm/face/xxm03.png",
            "images/xxm/face/xxm04.png",
          ],
        },
        {
          name: "旭旭宝宝",
          img: [
            "images/xxbb/face/xxbb01.png",
            "images/xxbb/face/xxbb02.png",
            "images/xxbb/face/xxbb03.png",
            "images/xxbb/face/xxbb04.png",
          ],
        },
      ],
      // 样本人脸匹配矩阵数组对象转码结果
      faceMatcher: null,
      imgEl: null,
      canvasEl: null,
    };
  },
  watch: {
    nets(val) {
      this.nets = val;
      this.fnInit().then(() => this.fnRun());
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.fnInit().then(() => this.fnRun());
    });
  },
  methods: {
    // 初始化模型加载
    async fnInit() {
      await faceapi.nets[this.nets].loadFromUri("/models");
      await faceapi.loadFaceLandmarkModel("/models");
      await faceapi.loadFaceRecognitionModel("/models");
      // 根据模型参数识别调整结果
      switch (this.nets) {
        case "ssdMobilenetv1":
          this.options = new faceapi.SsdMobilenetv1Options({
            minConfidence: 0.5, // 0.1 ~ 0.9
          });
          break;
        case "tinyFaceDetector":
          this.options = new faceapi.TinyFaceDetectorOptions({
            inputSize: 512, // 160 224 320 416 512 608
            scoreThreshold: 0.5, // 0.1 ~ 0.9
          });
          break;
        case "mtcnn":
          this.options = new faceapi.MtcnnOptions({
            minFaceSize: 20, // 0.1 ~ 0.9
            scaleFactor: 0.709, // 0.1 ~ 0.9
          });
          break;
      }
      // 节点对象
      this.imgEl = document.getElementById("targetImg");
      this.canvasEl = document.getElementById("targetCanvas");
      await this.fnfaceMatcher();
    },
    // 生成人脸匹配矩阵数组对象，样本图片同步转码
    async fnfaceMatcher() {
      const labeledFaceDescriptors = await Promise.all(
        this.sampleArr.map(async (item) => {
          // 临时图片转码数据，将图片对象转数据矩阵对象
          let descriptors = [];
          for (let image of item.img) {
            const imageEl = await faceapi.fetchImage(image);
            descriptors.push(await faceapi.computeFaceDescriptor(imageEl));
          }
          // 返回图片用户和图片转码数组
          return new faceapi.LabeledFaceDescriptors(item.name, descriptors);
        })
      );
      // 人脸匹配矩阵数组对象转码结果
      this.faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors);
    },
    // 执行识别匹配图片，数值误差越小越精确
    async fnRun() {
      const results = await faceapi
        .detectAllFaces(this.imgEl, this.options)
        .withFaceLandmarks()
        .withFaceDescriptors();
      faceapi.matchDimensions(this.canvasEl, this.imgEl);
      const resizedResults = faceapi.resizeResults(results, this.imgEl);
      resizedResults.forEach(({ detection, descriptor }) => {
        const label = this.faceMatcher.findBestMatch(descriptor).toString();
        new faceapi.draw.DrawBox(detection.box, { label }).draw(this.canvasEl);
      });
    },
    // 更换匹配图
    fnChange(e) {
      if (!e.target.files.length) return;
      // 将文件显示为图像并识别
      faceapi.bufferToImage(e.target.files[0]).then((img) => {
        this.imgEl.src = img.src;
        this.canvasEl
          .getContext("2d")
          .clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);
        this.fnRun();
      });
    },
  },
};
</script>

<style scoped>
.target {
  position: relative;
}
.target img {
  max-width: 600px;
  max-height: 400px;
}
.target canvas {
  position: absolute;
  top: 0;
  left: 0;
}
.pic {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}
.pic img {
  max-width: 90px;
  max-height: 90px;
  margin: 10px;
}
.option {
  padding-bottom: 20px;
}
.option div {
  padding: 10px;
  border-bottom: 2px #42b983 solid;
}
.option div label {
  margin-right: 20px;
}
</style>
