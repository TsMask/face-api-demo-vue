import { createRouter, createWebHashHistory } from "vue-router";
import routes from "./routes";

const router = new createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

/**全局路由-前置守卫 */
router.beforeEach((to, from, next) => {
  next();
});

/**全局路由-后置守卫 */
router.afterEach((to, from, failure) => {
  // 设置标题
  if (to.meta?.title) {
    document.title = to.meta.title;
  }
});

export default router;
