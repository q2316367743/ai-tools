<template>
  <t-select v-model="activeKey" :options="serviceOptions" :auto-width="true" :filterable="true"
            placeholder="请选择 AI 服务" class="home-assistant-select"/>
</template>
<script lang="ts" setup>
import {Avatar, SelectOption, Space} from "tdesign-vue-next";

const activeKey = defineModel<string>({
  default: ''
})

const serviceOptions = computedAsync<Array<SelectOption>>(async () => {
  const models = await utools.allAiModels();
  return models.map(e => ({
    label: e.label,
    value: e.id,
    content: (h) => h(Space, {size: 'small', title: e.description, class: 'items-center'}, () => ([
      h(Avatar, {image: e.icon}),
      h('span', {}, e.label)
    ]))
  }))
});

</script>
<style scoped lang="less">
.home-assistant-select {
  :deep(.t-select) {
    width: 112px;
    height: var(--td-comp-size-m);
    margin-right: var(--td-comp-margin-s);

    .t-input {
      border-radius: 32px;
      padding: 0 15px;
    }

    .t-input.t-is-focused {
      box-shadow: none;
    }
  }
}
</style>
