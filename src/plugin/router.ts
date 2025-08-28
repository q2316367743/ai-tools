import {createRouter, createWebHashHistory, RouteRecordRaw} from 'vue-router';
// 引入路由

export const routes: Array<RouteRecordRaw> = [{
  name: "主页",
  path: '/home',
  alias: ['/'],
  component: () => import('@/pages/home/index.vue'),
}, {
  name: '编辑工具',
  path: '/edit/:id',
  component: () => import('@/pages/edit/index.vue'),
}, {
  name: '聊天工具',
  path: '/chat',
  component: () => import('@/pages/chat/index.vue'),
}];

export const router = createRouter({
  history: createWebHashHistory(),
  routes
});

