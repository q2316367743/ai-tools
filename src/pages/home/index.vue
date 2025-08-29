<template>
  <div class="tools-list-container">
    <!-- 搜索栏 -->
    <div class="search-container">
      <t-space size="small" class="search">
        <t-input v-model="keyword" placeholder="搜索工具名称、描述..." clearable class="search-input">
          <template #prefix-icon>
            <SearchIcon/>
          </template>
        </t-input>
        <t-select v-model="tag" placeholder="选择标签" clearable class="search-select">
          <t-option v-for="tag in tags" :value="tag" :key="tag">{{ tag }}</t-option>
        </t-select>
      </t-space>
      <t-space size="small">
        <t-button theme="primary" shape="square" @click="handleChat">
          <template #icon>
            <chat-icon/>
          </template>
        </t-button>
        <t-button theme="primary" shape="square" @click="handleAdd">
          <template #icon>
            <AddIcon/>
          </template>
        </t-button>
      </t-space>
    </div>

    <div class="list-container">
      <t-row :gutter="[8, 8]" v-if="list.length > 0">
        <t-col flex="393px" v-for="tool in list" :key="tool.id">
          <t-card hover shadow>
            <div class="card-content">
              <!-- 工具图标和标题 -->
              <div class="tool-header">
                <div class="tool-icon">
                  <UtoolsImage :url="`/attachment/${tool.id}`" :alt="tool.title"/>
                </div>
                <div class="tool-info">
                  <t-link class="tool-name" theme="primary" @click="handlePreview(tool)">{{ tool.title }}</t-link>

                  <p class="tool-description">{{ tool.description || '暂无描述' }}</p>
                </div>
              </div>

              <t-space size="small">
                <t-tag v-for="tag in tool.tags" theme="primary">{{ tag }}</t-tag>
              </t-space>

              <!-- 操作按钮 -->
              <div class="tool-actions justify-between items-center" @click.stop>
                <t-space size="small">
                  <t-button size="small" variant="text" theme="primary" @click="handleEdit(tool)">
                    <template #icon>
                      <EditIcon/>
                    </template>
                    编辑
                  </t-button>
                  <t-button size="small" variant="text" theme="danger" @click="handleDelete(tool)">
                    <template #icon>
                      <DeleteIcon/>
                    </template>
                    删除
                  </t-button>
                </t-space>
                <t-tooltip content="注册为uTools关键字">
                  <t-switch :value="codes.includes(`/tool/${tool.id}`)" @change="toggleFeature(tool, $event)"
                            :loading="featureLoading[tool.id]"/>
                </t-tooltip>
              </div>
            </div>
          </t-card>
        </t-col>
      </t-row>
      <!-- 工具列表 -->

      <!-- 空状态 -->
      <div v-else-if="list.length === 0 && keyword" class="empty-state">
        <EmptyResult title="未找到相关工具" :description="`没有找到包含 '${keyword}' 的工具`"/>
      </div>
      <div v-else class="empty-state">
        <EmptyResult title="暂无工具"/>
      </div>
    </div>

  </div>
</template>
<script lang="ts" setup>
import {useAiToolsStore} from "@/store";
import {useFuse} from "@vueuse/integrations/useFuse";
import {AddIcon, ChatIcon, DeleteIcon, EditIcon, SearchIcon} from "tdesign-icons-vue-next";
import {AiTool} from "@/types/AiTool";
import MessageBoxUtil from "@/utils/modal/MessageBoxUtil";
import MessageUtil from "@/utils/modal/MessageUtil";
import {openCodeRunner, openCodeRunnerWindow} from "@/components/CodeRunnerDrawer";
import {SwitchValue} from "tdesign-vue-next";
import {getAttachmentByAsync} from "@/utils/utools/AttachmentUtil";
import {blobToDataURL} from "@/utils/file/CovertUtil";

const router = useRouter();
const ctrl = useKeyModifier('Control');

const keyword = ref('');
const tag = ref('');
const codes = ref(new Array<string>());
const featureLoading = ref<Record<string, boolean>>({})

const aiTools = computed(() => useAiToolsStore().aiTools);
const tags = computed(() => useAiToolsStore().tags);

const {results} = useFuse(keyword, aiTools, {
  matchAllWhenSearchEmpty: true,
  fuseOptions: {
    keys: ['title', 'tags']
  }
});
const list = computed(() => {
  if (!tag.value) return results.value.map(e => e.item);
  return results.value.filter(e => e.item.tags.includes(tag.value)).map(e => e.item);
})

const handleEdit = (row: AiTool) => router.push('/edit/' + row.id);
const handlePreview = (row: AiTool) => {
  if (ctrl.value) {
    useAiToolsStore().getOne(row.id).then(info => {
      openCodeRunnerWindow(info)
    }).catch(e => MessageUtil.error("预览失败", e))
  } else {
    openCodeRunner(row.id);
  }
}
const handleAdd = () => router.push('/edit/0');
const handleChat = () => router.push('/chat');
const handleDelete = (row: AiTool) => {
  // 删除
  MessageBoxUtil.confirm(`是否立即删除工具「${row.title}」，删除后无法恢复`, "删除工具")
    .then(() => {
      useAiToolsStore().remove(row.id)
        .then(() => MessageUtil.success("删除成果"))
        .catch(e => MessageUtil.error("删除失败", e));
    })
}

const featureFeatures = () => {
  codes.value = utools.getFeatures().map(feature => feature.code)
}

const toggleFeature = async (tool: AiTool, val: SwitchValue) => {
  if (featureLoading.value[tool.id]) return;
  featureLoading.value[tool.id] = true;
  try {
    const code = `/tool/${tool.id}`;
    if (val) {
      const attachment = await getAttachmentByAsync(`/attachment/${tool.id}`);
      // 将blob转为data url
      let icon: string | undefined = undefined;
      if (attachment) {
        icon = await blobToDataURL(attachment);
      }
      utools.setFeature({
        code,
        icon,
        explain: 'AI工具箱',
        cmds: [tool.title]
      })
    } else {
      utools.removeFeature(code);
    }
    featureFeatures();
  } finally {
    featureLoading.value[tool.id] = false;
  }
}

onMounted(() => featureFeatures());

</script>
<style scoped lang="less">
.tools-list-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.search-container {
  display: flex;
  justify-content: space-between;
  padding: 8px;

  .search {
    width: clamp(300px, 50%, 500px);

    .search-select {
      width: 120px;
    }
  }

}

.list-container {
  position: absolute;
  top: 48px;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 8px;
  overflow-y: auto;
  overflow-x: hidden;
}


.tool-card {
  cursor: pointer;
}

.tool-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;

  .tool-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--td-brand-color-light);
    border-radius: 8px;
    margin-right: 12px;
    flex-shrink: 0;

    :deep(.t-icon) {
      font-size: 24px;
      color: var(--td-brand-color);
    }
  }

  .tool-info {
    flex: 1;
    min-width: 0;

    .tool-name {
      margin: 0 0 4px 0;
      font-size: 18px;
      font-weight: 600;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .tool-description {
      margin: 0;
      font-size: 14px;
      color: var(--td-text-color-secondary);
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }
}


.tool-actions {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--td-border-level-1-color);
  margin-top: 12px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}
</style>
