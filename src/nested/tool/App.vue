<template>
  <div id="main">
    <tool-header/>
    <div id="main-content"></div>
  </div>
</template>
<script lang="ts" setup>
import ToolHeader from "@/nested/tool/components/ToolHeader.vue";
</script>
<style scoped lang="less">


#app-container {
  position: absolute;
  top: 32px;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}
</style>
