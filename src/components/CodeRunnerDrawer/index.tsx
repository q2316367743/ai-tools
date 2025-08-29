import {DrawerPlugin, Loading} from 'tdesign-vue-next'
import {CloseIcon, MoreIcon} from "tdesign-icons-vue-next";
import {fetchAiToolContent} from "@/store";
import {AiToolContent, AiToolInfo} from "@/types";
import MessageUtil from "@/utils/modal/MessageUtil";
import './CodeRunner.less';
import {LocalNameEnum} from "@/global/LocalNameEnum";
import {cacheManage} from "@/plugin/CacheManage";

interface DrawerOptions {
  width?: string
  title?: string
  closable?: boolean
  maskClosable?: boolean;
  footer?: boolean
}

// 使用TDesign的DrawerPlugin打开抽屉
export const openCodeRunnerDrawer = async (html: string, options: DrawerOptions = {}) => {

  const url = ref("");
  cacheManage.handle(html).then(safeHtml => {
    const blob = new Blob([safeHtml], {type: 'text/html'})
    url.value = URL.createObjectURL(blob)
  });

  const dp = DrawerPlugin({
    header: options.title || '抽屉',
    size: options.width || '50vw',
    closeOnOverlayClick: false,
    footer: options.footer ?? true,
    confirmBtn: '添加到工具',
    closeBtn: true,
    onCancel() {
      dp.destroy?.();
    },
    default: () => <>
      <div class="iframe-container">
        {url.value ? <iframe
          src={url.value}
          class="preview-iframe w-full"
          frameborder="0"
          style={{height: (options.footer ?? true) ? 'calc(100vh - 121px)' : 'calc(100vh - 94px)', marginTop: '-6px'}}
          sandbox="allow-scripts allow-same-origin allow-forms"
        ></iframe> : <Loading loading={true} text={'正在缓存远程资源'} class={'w-full h-full'}/>}
      </div>
    </>,
    onClose() {
      URL.revokeObjectURL(url.value);
      dp.destroy?.();
    },
    onConfirm() {
    },
  });
}

let closer: (() => void) | null = null;

export async function openCodeRunner(id: string | AiToolContent) {
  let content: AiToolContent | null;
  if (typeof id === 'string') {
    content = await fetchAiToolContent(id);
  } else {
    content = id;
  }
  if (!content) {
    MessageUtil.error("AI工具不存在");
    return;
  }

  if (closer) {
    closer();
    closer = null;
  }

  const url = ref("");
  cacheManage.handle(content.content).then(safeHtml => {
    const blob = new Blob([safeHtml], {type: 'text/html'})
    url.value = URL.createObjectURL(blob)
  });


  const com = defineComponent({
    setup() {
      return () => <>
        <div class="code-runner w-100vw h-100vh">
          <div class={'code-runner-container w-full h-full overflow-auto'}>
            {url.value ? <iframe
              src={url.value}
              class="preview-iframe w-full h-full"
              frameborder="0"
              sandbox="allow-scripts allow-same-origin allow-forms"
            ></iframe> : <Loading loading={true} text={'正在缓存远程资源'} class={'w-full h-full'}/>}
          </div>
          <div class={'code-runner-operator'}>
            <div class={'code-runner-btn code-runner-more'}>
              <MoreIcon/>
            </div>
            <div class={'code-runner-btn code-runner-close'} onClick={handleClose}>
              <CloseIcon/>
            </div>
          </div>
        </div>
      </>
    }
  });

  const app = createApp(com);
  const wrapper = document.createElement('div');
  document.body.appendChild(wrapper);
  app.mount(wrapper);

  function handleClose() {
    app.unmount();
    wrapper.remove();
    URL.revokeObjectURL(url.value)
  }

  closer = handleClose;
}

export async function openCodeRunnerWindow(info: AiToolInfo) {
  const bw = utools.createBrowserWindow('src/tool.html', {
    width: info.width || 800,
    height: info.height || 600,
    x: info.x,
    y: info.y,
    center: info.center,
    title: 'AI工具 | ' + info.title,
    webPreferences: {
      preload: 'preload.js',
    }
  }, () => {
    console.log("打开成功");
    if (utools.isDev()) {
      bw.webContents.openDevTools();
    }
    // 发送消息
    window.preload.sendTo(bw.webContents.id, 'open-ai-tool', LocalNameEnum.ITEM_AI_TOOL_ + info.id);
    utools.hideMainWindow();
    utools.outPlugin(false);
  })
}

export function closeCodeRunner() {
  closer?.();
}