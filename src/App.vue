<template>
  <div class="main">
    <router-view/>
  </div>
</template>
<script lang="ts" setup>
import { useAiChatGroupStore, useAiChatListStore, useAiToolsStore} from "@/store";
useAiToolsStore().init();
useAiChatListStore().init();
useAiChatGroupStore().init();
</script>
<style scoped lang="less">
.main {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  color: var(--td-text-color-primary);
  background-color: var(--td-bg-color-container);
}
</style>
