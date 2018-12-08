import About from "@/views/About.vue";

export default [
  {
    path: "/",
    name: "about",
    component: About
  },
  {
    path: "/rtc",
    name: "RTC",
    component: () => import("@/views/RTC.vue")
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
    path: "/rtc_face_trackimg",
    name: "rtc_face_trackimg",
    component: () => import("@/views/RTCFaceTrackimg.vue")
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
