import {createApp} from 'vue'
import {createPinia} from 'pinia';
import App from './App.vue'
import {router} from './plugin/router';
import {closeCodeRunner, openCodeRunner, openCodeRunnerWindow} from "@/components/CodeRunnerDrawer";
import {fetchAiTool} from "@/store";

import 'virtual:uno.css'
import 'tdesign-vue-next/es/style/index.css';
import '@/assets/style/global.less';
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css';
import MessageUtil from "@/utils/modal/MessageUtil";

// 额外引入图标库
createApp(App)
  .use(createPinia())
  .use(router)
  .mount('#app');

utools.onPluginEnter(async action => {
  console.log('插件启动', action);
  // 对关键字进行处理
  const {code} = action;
  if (code === '/app/launch') {
    closeCodeRunner()
  } else if (/^\/tool\//.test(code)) {
    try {
      const id = code.replace(/^\/tool\//, '');
      const content = await fetchAiTool(id);
      if (content.mini) {
        // 小窗
        console.log("小窗打开")
        await openCodeRunnerWindow(content);
      } else {
        console.log("大窗打开")
        await openCodeRunner(content);
      }
    } catch (e) {
      console.error(e);
      MessageUtil.error("AI工具打开失败")
    }
  }
});