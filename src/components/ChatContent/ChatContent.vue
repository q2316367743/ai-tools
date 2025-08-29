<template>
  <div class="chat-content">
    <div ref="messageBodyRef" class="message-body markdown-content" v-html="renderedContent"></div>
  </div>
</template>

<script setup lang="ts">
import {marked} from 'marked'
import hljs from 'highlight.js'
import MessageUtil from '@/utils/modal/MessageUtil'
import {openCodeRunnerDrawer} from '@/components/CodeRunnerDrawer'

// 动态导入highlight.js样式
const loadHighlightStyle = () => {
  // 移除现有的highlight.js样式
  const existingStyle = document.querySelector('link[data-highlight-theme]')
  if (existingStyle) {
    existingStyle.remove()
  }

  // 检测当前主题模式
  const isDarkMode = document.documentElement.getAttribute('theme-mode') === 'dark'

  // 创建新的样式链接
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.setAttribute('data-highlight-theme', 'true')
  link.href = isDarkMode
    ? './github-dark.min.css'
    : './github.min.css'

  document.head.appendChild(link)
}

// 监听主题变化
const observeThemeChange = () => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'theme-mode') {
        loadHighlightStyle()
        // 重新高亮所有代码块
        nextTick(() => {
          highlightCode()
        })
      }
    })
  })

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['theme-mode']
  })

  return observer
}

const props = defineProps({
  content: String
})

const messageBodyRef = ref<HTMLElement>()

// 配置marked选项
marked.setOptions({
  breaks: true, // 支持换行
  gfm: true, // 支持GitHub风格的Markdown
})

// 渲染Markdown内容
const renderedContent = computed(() => {
  if (!props.content) return ''

  try {
    return marked(props.content)
  } catch (error) {
    console.error('Markdown渲染错误:', error)
    return props.content.replace(/\n/g, '<br>')
  }
})

// 高亮代码块并添加工具栏
const highlightCode = () => {
  if (messageBodyRef.value) {
    const preBlocks = messageBodyRef.value.querySelectorAll('pre:not(.code-block-enhanced)')
    preBlocks.forEach((pre) => {
      const codeBlock = pre.querySelector('code')
      if (codeBlock && !codeBlock.classList.contains('hljs')) {
        // 高亮代码
        hljs.highlightElement(codeBlock as HTMLElement)

        // 获取语言信息
        const language = getLanguageFromCode(codeBlock)

        // 创建工具栏
        const toolbar = createCodeToolbar(language, codeBlock.textContent || '')

        // 包装代码块
        const wrapper = document.createElement('div')
        wrapper.className = 'code-block-wrapper'

        pre.parentNode?.insertBefore(wrapper, pre)
        wrapper.appendChild(toolbar)
        wrapper.appendChild(pre)

        // 标记为已处理
        pre.classList.add('code-block-enhanced')
      }
    })
  }
}

// 获取代码语言
const getLanguageFromCode = (codeElement: HTMLElement): string => {
  // 从class中获取语言信息
  const classes = codeElement.className.split(' ')
  for (const cls of classes) {
    if (cls.startsWith('language-')) {
      return cls.replace('language-', '')
    }
    if (cls.startsWith('hljs-')) {
      continue
    }
    if (cls !== 'hljs' && cls !== '') {
      return cls
    }
  }

  // 尝试从hljs检测结果获取
  const hljsResult = hljs.highlightAuto(codeElement.textContent || '')
  return hljsResult.language || 'text'
}

// 创建代码工具栏
const createCodeToolbar = (language: string, code: string): HTMLElement => {
  const toolbar = document.createElement('div')
  toolbar.className = 'code-toolbar'

  // 左侧语言标签
  const languageLabel = document.createElement('span')
  languageLabel.className = 'language-label'
  languageLabel.textContent = language.toUpperCase()

  // 右侧按钮组
  const buttonGroup = document.createElement('div')
  buttonGroup.className = 'button-group'

  // 复制按钮
  const copyButton = document.createElement('button')
  copyButton.className = 'code-button copy-button'
  copyButton.innerHTML = '📋'
  copyButton.title = '复制代码'
  copyButton.onclick = () => copyCode(code, copyButton)

  buttonGroup.appendChild(copyButton)

  // 支持多种语言的运行按钮
  if (['html'].includes(language.toLowerCase())) {
    const runButton = document.createElement('button')
    runButton.className = 'code-button run-button'
    runButton.innerHTML = '▶️'
    runButton.title = '运行代码'
    runButton.onclick = () => openCodeRunner(code, language)
    buttonGroup.appendChild(runButton)
  }

  toolbar.appendChild(languageLabel)
  toolbar.appendChild(buttonGroup)

  return toolbar
}

// 复制代码功能
const copyCode = async (code: string, button: HTMLElement) => {
  try {
    await navigator.clipboard.writeText(code)
    const originalText = button.innerHTML
    button.innerHTML = '✅'
    button.style.color = 'var(--td-success-color)'
    setTimeout(() => {
      button.innerHTML = originalText
      button.style.color = ''
    }, 2000);
    MessageUtil.success("赋值成功")
  } catch (err) {
    console.error('复制失败:', err)
    button.innerHTML = '❌'
    setTimeout(() => {
      button.innerHTML = '📋'
    }, 2000)
  }
}

// 打开代码运行器抽屉
const openCodeRunner = (code: string, language: string) => {
  openCodeRunnerDrawer(code, {
    width: '80vw',
    title: '代码运行器',
    maskClosable: true
  })
}

let themeObserver: MutationObserver | null = null

// 监听内容变化，重新高亮代码
watch(() => props.content, () => {
  nextTick(() => {
    highlightCode()
  })
}, {flush: 'post'})

onMounted(() => {
  // 初始化样式
  loadHighlightStyle()

  // 开始监听主题变化
  themeObserver = observeThemeChange()

  nextTick(() => {
    highlightCode()
  })
})

onUnmounted(() => {
  // 清理主题监听器
  if (themeObserver) {
    themeObserver.disconnect()
  }
})

</script>

<style scoped>
.chat-content {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px;
  border-radius: 8px;
  transition: background-color 0.2s;
  color: var(--td-text-color-primary);
}

.message-body {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 12px;
  background-color: var(--td-bg-color-container);
  border: 1px solid var(--td-border-level-1-color);
  word-wrap: break-word;
  overflow-wrap: break-word;
}


/* Markdown样式 */
.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  margin: 16px 0 8px 0;
  font-weight: 600;
  line-height: 1.25;
}

.markdown-content :deep(h1) {
  font-size: 1.5em;
}

.markdown-content :deep(h2) {
  font-size: 1.3em;
}

.markdown-content :deep(h3) {
  font-size: 1.1em;
}

.markdown-content :deep(p) {
  margin: 8px 0;
  line-height: 1.6;
}

.markdown-content :deep(code) {
  background-color: var(--td-bg-color-component);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.9em;
}

/* 代码块包装器 */
.markdown-content :deep(.code-block-wrapper) {
  position: relative;
  margin: 12px 0;
  border-radius: 8px;
  border: 1px solid var(--td-border-level-1-color);
  background-color: var(--td-bg-color-secondarycontainer);
  overflow: hidden;
}

/* 代码工具栏 */
.markdown-content :deep(.code-toolbar) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: var(--td-bg-color-component);
  border-bottom: 1px solid var(--td-border-level-1-color);
  font-size: 12px;
}

.markdown-content :deep(.language-label) {
  color: var(--td-text-color-secondary);
  font-weight: 500;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

.markdown-content :deep(.button-group) {
  display: flex;
  gap: 8px;
}

.markdown-content :deep(.code-button) {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.2s;
  color: var(--td-text-color-secondary);
}

.markdown-content :deep(.code-button:hover) {
  background-color: var(--td-bg-color-container-hover);
  color: var(--td-text-color-primary);
}

.markdown-content :deep(.code-button:active) {
  transform: scale(0.95);
}

.markdown-content :deep(pre) {
  background-color: transparent;
  padding: 16px;
  border-radius: 0;
  overflow-x: auto;
  margin: 0;
  border: none;
}

.markdown-content :deep(pre code) {
  background: none;
  padding: 0;
  border-radius: 0;
  font-size: 14px;
  line-height: 1.45;
}

/* highlight.js 样式覆盖 - 确保背景透明 */
.markdown-content :deep(.hljs) {
  background: transparent !important;
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid var(--td-brand-color);
  padding-left: 12px;
  margin: 12px 0;
  color: var(--td-text-color-secondary);
  font-style: italic;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin: 8px 0;
  padding-left: 20px;
}

.markdown-content :deep(li) {
  margin: 4px 0;
  line-height: 1.6;
}

.markdown-content :deep(a) {
  color: var(--td-brand-color);
  text-decoration: none;
}

.markdown-content :deep(a:hover) {
  text-decoration: underline;
}

.markdown-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 12px 0;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid var(--td-border-level-1-color);
  padding: 8px 12px;
  text-align: left;
}

.markdown-content :deep(th) {
  background-color: var(--td-bg-color-component);
  font-weight: 600;
}

.markdown-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 8px 0;
}

.markdown-content :deep(hr) {
  border: none;
  border-top: 1px solid var(--td-border-level-1-color);
  margin: 16px 0;
}
</style>