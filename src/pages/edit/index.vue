<template>
  <div class="edit">
    <header class="edit-header">
      <t-space size="small" class="edit-header__left">
        <t-button theme="primary" variant="text" shape="square" @click="handlerClick">
          <template #icon>
            <chevron-left-icon/>
          </template>
        </t-button>
        <div class="edit-header__title">
          编辑
        </div>
        <div class="ml-8px">
          <t-radio-group v-model="activeKey" variant="default-filled">
            <t-radio-button value="base">基础信息</t-radio-button>
            <t-radio-button value="html">HTML内容</t-radio-button>
          </t-radio-group>
        </div>
      </t-space>
      <div class="edit-header__right">
        <t-space size="small">
          <t-button v-if="activeKey === 'html'" theme="primary" @click="handleRunPreview" :loading="previewing">
            <template #icon>
              <PlayIcon/>
            </template>
            运行预览
          </t-button>
          <t-button theme="primary" variant="text" shape="square" @click="handleSave">
            <template #icon>
              <save-icon/>
            </template>
          </t-button>
        </t-space>
      </div>
    </header>

    <div class="edit-container">

      <!-- 基础信息区域 -->
      <div v-show="activeKey === 'base'" class="info-section">
        <t-form ref="formRef" :data="formData" :rules="formRules" layout="vertical">
          <t-form-item label="图标" name="icon">
            <ImageUpload v-model="formData.icon"/>
          </t-form-item>
          <t-form-item label="标题" name="title">
            <t-input v-model="formData.title" placeholder="请输入工具标题"/>
          </t-form-item>

          <t-form-item label="描述" name="description">
            <t-textarea v-model="formData.description" placeholder="请输入工具描述"
                        :autosize="{ minRows: 3, maxRows: 6 }"/>
          </t-form-item>

          <t-form-item label="标签" name="tags">
            <t-tag-input v-model="formData.tags" placeholder="请输入标签，按回车添加" clearable/>
          </t-form-item>
        </t-form>
      </div>

      <!-- HTML内容编辑区域 -->
      <div v-show="activeKey === 'html'" class="content-section">

        <div class="editor-container">
          <div class="monaco-editor-wrapper">
            <div ref="editorRef" class="monaco-editor"></div>
          </div>
        </div>

      </div>


    </div>
    <t-back-top container=".edit .edit-container"/>
  </div>
</template>
<script lang="ts" setup>
import {FormInstanceFunctions, TdFormProps} from 'tdesign-vue-next';
import {ChevronLeftIcon, SaveIcon, PlayIcon} from 'tdesign-icons-vue-next';
import * as monaco from 'monaco-editor';
import type {AiToolPost} from '@/types/AiTool';
import MessageUtil from '@/utils/modal/MessageUtil';
import {isDark, useAiToolsStore} from '@/store';
import {openCodeRunnerDrawer} from "@/components/CodeRunnerDrawer/CodeRunnerDrawer";

const route = useRoute();
const router = useRouter();

function handlerClick() {
  router.push('/')
}

const activeKey = ref('base');
// 表单数据
const formData = ref<AiToolPost>({
  icon: '',
  title: '',
  description: '',
  tags: [],
  content: '',
  sessionId: '',
});

// 表单验证规则
const formRules: TdFormProps['rules'] = {
  title: [{required: true, message: '请输入工具标题', trigger: 'blur'}],
  content: [{required: true, message: '请输入HTML内容', trigger: 'blur'}]
};

// 组件状态
const formRef = ref<FormInstanceFunctions>();
const editorRef = ref();
const previewRef = ref();
const saving = ref(false);
const previewing = ref(false);
const previewContent = ref('');

let editor: monaco.editor.IStandaloneCodeEditor | null = null;

// 初始化Monaco编辑器
const initMonacoEditor = async () => {
  if (!editorRef.value) return;

  editor = monaco.editor.create(editorRef.value, {
    value: formData.value.content,
    language: 'html',
    theme: isDark.value ? 'vs-dark' : 'vs-light',
    automaticLayout: true,
    minimap: {enabled: true},
    scrollBeyondLastLine: false,
    fontSize: 14,
    lineNumbers: 'on',
    wordWrap: 'on',
    folding: true,
    selectOnLineNumbers: true,
    roundedSelection: false,
    readOnly: false,
    cursorStyle: 'line',
    glyphMargin: false,
    contextmenu: true,
    mouseWheelZoom: true,
    formatOnPaste: true,
    formatOnType: true,
    autoIndent: 'full',
    tabSize: 2,
    insertSpaces: true
  });

  // 监听内容变化
  editor.onDidChangeModelContent(() => {
    formData.value.content = editor?.getValue() || '';
  });
};


// 运行预览
const handleRunPreview = async () => {
  if (!formData.value.content.trim()) {
    MessageUtil.warning('请先输入HTML内容');
    return;
  }
  openCodeRunnerDrawer(formData.value.content, {
    width: '80vw',
    title: '代码运行器',
    maskClosable: true,
    footer: false
  })

};

// 保存工具
const handleSave = async () => {
  try {
    const valid = await formRef.value?.validate();
    if (!valid) return;

    if (!formData.value.content.trim()) {
      MessageUtil.warning('请输入HTML内容');
      return;
    }

    saving.value = true;
    if (route.params.id === '0') {
      await useAiToolsStore().add(formData.value)
    } else {
      await useAiToolsStore().update(route.params.id as string, formData.value)
    }
    MessageUtil.success('保存成功');
    await router.push('/');
  } catch (error) {
    MessageUtil.error('保存失败');
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  nextTick(() => {
    initMonacoEditor();
  });
  const {id} = route.params;
  if (id !== '0') {
    useAiToolsStore().getOne(id as string).then((res) => {
      formData.value = {
        icon: res.icon,
        title: res.title,
        description: res.description,
        tags: res.tags,
        content: res.content,
        sessionId: res.sessionId,
      };
      editor?.setValue(res.content);
    })
  }
});

onUnmounted(() => {
  if (editor) {
    editor.dispose();
  }
});
</script>
<style scoped lang="less">
.edit {
  position: relative;
  width: 100%;
  height: 100%;

  .edit-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid var(--td-border-level-2-color);
    height: 50px;
    box-sizing: border-box;

    &__left {
      display: flex;
      align-items: center;
      padding-left: 8px;
    }

    &__title {
      display: flex;
      align-items: center;
    }

    &__right {
      padding-right: 16px;
    }

  }

  .edit-container {
    position: absolute;
    top: 51px;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: auto;
  }
}

.page-content {
  max-width: 1400px;
  margin: 0 auto;
}

.info-section {

  margin-top: 16px;

  .icon-preview {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid var(--td-border-level-2-color);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}

.content-section {
  .editor-toolbar {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--td-border-level-2-color);
  }

  .editor-container {
    display: flex;
    gap: 24px;
    height: calc(100vh - 51px);

    .monaco-editor-wrapper {
      flex: 1;
      border: 1px solid var(--td-border-level-2-color);
      border-radius: 6px;
      overflow: hidden;

      .monaco-editor {
        height: 100%;
      }
    }

    .preview-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      border: 1px solid var(--td-border-level-2-color);
      border-radius: 6px;
      overflow: hidden;

      .preview-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background: var(--td-bg-color-container);
        border-bottom: 1px solid var(--td-border-level-2-color);
        font-size: 14px;
        font-weight: 500;
        color: var(--td-text-color-primary);
      }

      .preview-iframe {
        flex: 1;
        border: none;
        background: var(--td-bg-color-container);
      }
    }
  }
}

</style>
