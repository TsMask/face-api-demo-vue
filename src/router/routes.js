export default [
  {
    path: "/",
    name: "about",
    component: () => import("@/views/About.vue")
  },
  {
    path: "/face_comparison",
    name: "faceComparison",
    component: () => import("@/views/FaceComparison.vue")
  },
  {
    path: "/face_comparison_many",
    name: "faceComparisonMany",
    component: () => import("@/views/FaceComparisonMany.vue")
  },
  {
    path: "/video_media_stream",
    name: "VideoMediaStream",
    component: () => import("@/views/VideoMediaStream.vue")
  },
  {
    path: "/video_media_canvas_stream",
    name: "VideoMediaCanvasStream",
    component: () => import("@/views/VideoMediaCanvasStream.vue")
  },
  {
    path: "*",
    name: "anyException",
    meta: {
      icon: "none",
      title: "任意异常"
    },
    component: () => import("@/views/About.vue")
  }
];
