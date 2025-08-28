import {defineStore} from "pinia";
import {AiTool, AiToolInfo, AiToolPost} from "@/types/AiTool";
import {
  getFromOneByAsync,
  listByAsync,
  removeOneByAsync,
  saveListByAsync,
  saveOneByAsync
} from "@/utils/utools/DbStorageUtil";
import {LocalNameEnum} from "@/global/LocalNameEnum";
import {useSnowflake} from "@/hooks";
import {AiToolContent} from "@/types/AiToolContent";

export const useAiToolsStore = defineStore('ai-tool', () => {

  // ai工具列表
  const aiTools = ref(new Array<AiTool>());
  const rev = ref<string>();

  const tags = computed<Set<string>>(() => {
    return new Set(aiTools.value.flatMap(item => item.tags));
  })

  listByAsync<AiTool>(LocalNameEnum.LIST_AI_TOOL).then(res => {
    aiTools.value = res.list;
    rev.value = res.rev;
  });

  // 新增
  const add = async (res: AiToolPost) => {
    const id = useSnowflake().nextId();
    const now = Date.now();

    aiTools.value.push({
      icon: res.icon,
      title: res.title,
      description: res.description,
      tags: res.tags,
      sessionId: res.sessionId,
      is_liked: false,
      run_count: 0,
      created_at: now,
      updated_at: now,
      id
    });

    rev.value = await saveListByAsync(LocalNameEnum.LIST_AI_TOOL, aiTools.value, rev.value);

    // 新增详情
    await saveOneByAsync<AiToolContent>(LocalNameEnum.ITEM_AI_TOOL + id, {
      id, created_at: now, content: res.content
    });
  }

  // 更新
  const update = async (id: string, res: AiToolPost) => {
    const index = aiTools.value.findIndex(item => item.id === id);
    if (index >= 0) {
      aiTools.value[index] = {
        ...aiTools.value[index],
        icon: res.icon,
        title: res.title,
        description: res.description,
        tags: res.tags,
        is_liked: false,
        run_count: 0,
        created_at: aiTools.value[index].created_at,
        updated_at: Date.now(),
        id
      };
      rev.value = await saveListByAsync(LocalNameEnum.LIST_AI_TOOL, aiTools.value, rev.value);
      await saveOneByAsync<AiToolContent>(LocalNameEnum.ITEM_AI_TOOL + id, {
        id, created_at: aiTools.value[index].created_at, content: res.content
      })
    }
  }

  // 删除
  const remove = async (id: string) => {
    const index = aiTools.value.findIndex(item => item.id === id);
    if (index >= 0) {
      // 删除附件
      const {icon} = aiTools.value[index];
      if (icon) {
        await removeOneByAsync(icon, true);
      }
      // 删除列表
      aiTools.value.splice(index, 1);
      rev.value = await saveListByAsync(LocalNameEnum.LIST_AI_TOOL, aiTools.value, rev.value);
      // 删除详情
      await removeOneByAsync(LocalNameEnum.ITEM_AI_TOOL + id);
      // 删除可能存在的关键字
      utools.removeFeature(`/tool/${id}`)
    }
  }

  const getOne = async (id: string): Promise<AiToolInfo> => {
    const index = aiTools.value.findIndex(item => item.id === id);
    if (index === -1) {
      return Promise.reject(new Error("AI工具不存在"))
    }
    const res = await getFromOneByAsync<AiToolContent>(LocalNameEnum.ITEM_AI_TOOL + id);
    return {
      ...aiTools.value[index],
      content: res.record?.content || ''
    }

  }

  return {
    aiTools, tags,
    add, update, remove, getOne
  }

})