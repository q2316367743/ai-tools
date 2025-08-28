import {defineConfig} from 'unocss'

export default defineConfig({
  // ...UnoCSS options
  rules: [
    [/^border-(\d+)$/, ([, d]) => ({border: `${d}px solid var(--td-border-level-2-color)`})],
    [/^radius-(\d+)$/, ([, d]) => ({'border-radius': `${d}px`})],
  ]
})