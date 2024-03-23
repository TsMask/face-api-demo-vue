import Home from "@/views/Home.vue";

export default [
  {
    path: "/",
    name: "Home",
    meta: { title: "首页" },
    component: Home,
  },
  {
    path: "/face-landmark-detection",
    name: "FaceLandmarkDetection",
    meta: { title: "脸标志检测" },
    component: () => import("@/views/FaceLandmarkDetection.vue"),
  },
  {
    path: "/face-expression-recognition",
    name: "FaceExpressionRecognition",
    meta: { title: "人脸表情识别" },
    component: () => import("@/views/FaceExpressionRecognition.vue"),
  },
  {
    path: "/age-gender-recognition",
    name: "AgeAndGenderRecognition",
    meta: { title: "年龄和性别识别" },
    component: () => import("@/views/AgeAndGenderRecognition.vue"),
  },
  {
    path: "/face-extraction",
    name: "FaceExtraction",
    meta: { title: "人脸提取" },
    component: () => import("@/views/FaceExtraction.vue"),
  },
  {
    path: "/face-recognition",
    name: "FaceRecognition",
    meta: { title: "人脸识别" },
    component: () => import("@/views/FaceRecognition.vue"),
  },
  {
    path: "/face-recognition-more",
    name: "FaceRecognitionMore",
    meta: { title: "人脸识别多图处理" },
    component: () => import("@/views/FaceRecognitionMore.vue"),
  },
  {
    path: "/bbt-face-recognition",
    name: "BBTFaceRecognition",
    meta: { title: "BBT人脸识别" },
    component: () => import("@/views/BBTFaceRecognition.vue"),
  },
  {
    path: "/bbt-face-similarity",
    name: "BBTFaceSimilarity",
    meta: { title: "BBT图片相似度" },
    component: () => import("@/views/BBTFaceSimilarity.vue"),
  },
  {
    path: "/bbt-face-similarity-more",
    name: "BBTFaceSimilarityMore",
    meta: { title: "BBT图片相似度多查找" },
    component: () => import("@/views/BBTFaceSimilarityMore.vue"),
  },
  {
    path: "/video-face-detector",
    name: "VideoFaceDetector",
    meta: { title: "Video人脸跟踪" },
    component: () => import("@/views/VideoFaceDetector.vue"),
  },
  {
    path: "/video-face-recognition",
    name: "VideoFaceRecognition",
    meta: { title: "Video人脸识别" },
    component: () => import("@/views/VideoFaceRecognition.vue"),
  },
  {
    path: "/webrtc-face-detector",
    name: "WebRTCFaceDetector",
    meta: { title: "WebRTC人脸跟踪" },
    component: () => import("@/views/WebRTCFaceDetector.vue"),
  },
  {
    path: "/webrtc-face-recognition",
    name: "WebRTCFaceRecognition",
    meta: { title: "WebRTC人脸识别" },
    component: () => import("@/views/WebRTCFaceRecognition.vue"),
  },
  {
    path: "/webrtc-media-stream",
    name: "WebRTCMediaStream",
    meta: { title: "WebRTC媒体流基础" },
    component: () => import("@/views/WebRTCMediaStream.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    name: "AnyException",
    meta: { title: "找不到匹配页面" },
    component: Home,
  },
];
