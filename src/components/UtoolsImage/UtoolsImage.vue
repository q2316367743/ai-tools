<template>
  <t-avatar :image="src" shape="round" size="48px" v-if="src" />
  <ToolsIcon v-else />
</template>
<script lang="ts" setup>
import { ToolsIcon } from 'tdesign-icons-vue-next'
import {getAttachmentByAsync} from "@/utils/utools/AttachmentUtil";

const props = defineProps({
  url: String,
  alt: String,
});

const src = ref('');


onMounted(async () => {
  // 先把之前的干掉
  if (src.value) {
    URL.revokeObjectURL(src.value);
    src.value = '';
  }
  const { url } = props;
  if (!url) return;
  const blob = await getAttachmentByAsync(url);
  if (!blob) return;
  src.value = URL.createObjectURL(blob);
});
onBeforeUnmount(() => {
  if (src.value) {
    URL.revokeObjectURL(src.value);
  }
});
</script>
<style scoped lang="less"></style>
