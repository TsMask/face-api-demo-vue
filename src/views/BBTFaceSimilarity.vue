<template>
  <div class="face_similarity">
    <div class="option">
      <div class="org">
        <label>更换图片org</label>
        <input
          type="file"
          accept="image/png, image/jpeg"
          @change="fnChange($event, 'org')"
        />
      </div>
      <div class="det">
        <label>更换图片det</label>
        <input
          type="file"
          accept="image/png, image/jpeg"
          @change="fnChange($event, 'det')"
        />
      </div>
      <div>
        <label>相识度（越小越精确）：</label>
        <strong style="color: #42b983;" v-text="distance"></strong>
      </div>
    </div>
    <div>
      <img id="orgImg" src="images/xxm/xxm02.jpg" />
      <br />
      <img id="detImg" src="images/xxbb/xxbb02.jpg" />
    </div>
  </div>
</template>

<script>
import * as faceapi from "face-api.js";
export default {
  name: "FaceSimilarity",
  data() {
    return {
      distance: 0, // 对比误差值
      desc: [], // 样本矩阵
      orgImgEl: null,
      detImgEl: null,
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.fnInit();
    });
  },
  methods: {
    // 初始化模型加载
    async fnInit() {
      await faceapi.loadFaceRecognitionModel("/models");
      // 节点属性化
      this.orgImgEl = document.getElementById("orgImg");
      this.detImgEl = document.getElementById("detImg");
      //转图片矩阵数据
      this.desc = [
        await faceapi.computeFaceDescriptor(this.orgImgEl),
        await faceapi.computeFaceDescriptor(this.detImgEl),
      ];
      // 图片误差值，越小越精确
      this.distance = faceapi
        .euclideanDistance(this.desc[0], this.desc[1])
        .toFixed(2);
    },
    // 运行对比
    async fnRun(el) {
      this.desc[+(el === "det")] = await faceapi.computeFaceDescriptor(
        this[el + "ImgEl"]
      );
      this.distance = faceapi
        .euclideanDistance(this.desc[0], this.desc[1])
        .toFixed(2);
    },
    // 更换图片
    fnChange(e, el) {
      if (!e.target.files.length) return;
      // 将文件显示为图像并识别
      faceapi.bufferToImage(e.target.files[0]).then((img) => {
        this[el + "ImgEl"].src = img.src;
        this.fnRun(el);
      });
    },
  },
};
</script>

<style scoped>
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
