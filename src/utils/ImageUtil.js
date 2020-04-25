/**
 * 媒体流转base64数据
 * @param {stream} videoStream 媒体流
 * @returns base64编码
 */
export const canvasToDataURL = (videoStream) => {
  if (typeof videoStream !== "object") return "";
  // 创建画布
  let canvas = document.createElement("canvas");
  canvas.width = videoStream.videoWidth;
  canvas.height = videoStream.videoHeight;
  // 画布绘制
  var ctx = canvas.getContext("2d");
  ctx.drawImage(videoStream, 0, 0, canvas.width, canvas.height);
  // 绘制信息
  var linearGradient = ctx.createLinearGradient(0, 0, 300, 0);
  linearGradient.addColorStop("0", "#40E0D0");
  linearGradient.addColorStop("0.5", "#FF8C00");
  linearGradient.addColorStop("1.0", "#f7797d");
  ctx.font = "35px FZShuTi";
  ctx.fillStyle = linearGradient;
  ctx.fillText("Face-Api 简单使用", 20, 50);
  return canvas.toDataURL();
};

/**
 * base64字符串转二进制文件
 * @param {String} base64Date base64字符串
 * @returns Blob文件对象
 */
export const base64ToBlob = (base64Date) => {
  let byteString = atob(base64Date.split(",")[1]);
  let mimeString = base64Date.split(",")[0].split(":")[1].split(";")[0];
  let ab = new ArrayBuffer(byteString.length);
  let ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], {
    type: mimeString,
  });
};

/**
 * 图片文件转base64
 * @param {Object} img 图片
 * @param {function} callback 回调函数
 */
export const fileToBase64 = (img, callback) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result));
  reader.readAsDataURL(img);
};

/**
 * 保存base64字符串到文件下载 通过构建a链接方式
 * @param {String} data Base64字符串
 * @param {String} fileName 保存文件名
 */
export const saveBase64ToFileObjectURL = (data, fileName) => {
  // 创建隐藏的可下载链接
  let eleLink = document.createElement("a");
  eleLink.download = fileName;
  eleLink.style.display = "none";
  eleLink.href = URL.createObjectURL(base64ToBlob(data));
  // 触发点击
  document.body.appendChild(eleLink);
  eleLink.click();
  // 然后移除
  document.body.removeChild(eleLink);
};
