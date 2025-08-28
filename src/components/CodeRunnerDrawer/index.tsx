import {DrawerPlugin} from 'tdesign-vue-next'
import {CloseIcon, MoreIcon} from "tdesign-icons-vue-next";
import {useAiToolsStore} from "@/store";
import MessageUtil from "@/utils/modal/MessageUtil";
import './CodeRunner.less';

interface DrawerOptions {
  width?: string
  title?: string
  closable?: boolean
  maskClosable?: boolean;
  footer?: boolean
}

// 使用TDesign的DrawerPlugin打开抽屉
export const openCodeRunnerDrawer = (html: string, options: DrawerOptions = {}) => {
  const blob = new Blob([html], {type: 'text/html'})
  const url = URL.createObjectURL(blob)
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
        <iframe
          src={url}
          class="preview-iframe w-full"
          frameborder="0"
          style={{height: (options.footer ?? true) ? 'calc(100vh - 121px)' : 'calc(100vh - 94px)', marginTop: '-6px'}}
          sandbox="allow-scripts allow-same-origin allow-forms"
        ></iframe>
      </div>
    </>,
    onClose() {
      URL.revokeObjectURL(url);
      dp.destroy?.();
    },
    onConfirm() {
    },
  });
}

let closer: (() => void) | null = null;

export async function openCodeRunner(id: string) {
  const content = await useAiToolsStore().getContent(id);
  if (!content) {
    MessageUtil.error("AI工具不存在");
    return;
  }

  if (closer) {
    closer();
    closer = null;
  }

  const blob = new Blob([content], {type: 'text/html'})
  const url = URL.createObjectURL(blob)
  const com = defineComponent({
    setup() {
      return () => <>
        <div class="code-runner w-100vw h-100vh">
          <div class={'code-runner-container w-full h-full overflow-auto'}>
            <iframe
              src={url}
              class="preview-iframe w-full h-full"
              frameborder="0"
              sandbox="allow-scripts allow-same-origin allow-forms"
            ></iframe>
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
    URL.revokeObjectURL(url)
  }

  closer = handleClose;
}