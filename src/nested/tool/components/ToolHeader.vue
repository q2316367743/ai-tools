<template>
  <div id="main-header">
    <div id="main-title">AI工具箱</div>
    <div id="main-operator">
      <button id="main-top" @click="handleTop">置顶</button>
      <button id="main-close" @click="handleClose">关闭</button>
    </div>
  </div>
</template>
<script lang="ts" setup>
const handleTop = () => utools.sendToParent('handle-ai-tool', {
  event: 'top'
});
const handleClose = () => utools.sendToParent('handle-ai-tool', {
  event: 'close'
});
</script>
<style scoped lang="less">
#app-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 32px;
  background-color: white;
  user-select: none;
  -webkit-app-region: drag;
}

#app-title {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  text-align: center;
  line-height: 32px;
}

#app-operator {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  -webkit-app-region: no-drag;
}
</style>
