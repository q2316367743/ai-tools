import {defineStore} from "pinia";
import {AiTool, AiToolInfo, AiToolPost} from "@/types";
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
import {deleteAttachment, getAttachmentByAsync, postAttachment} from "@/utils/utools/AttachmentUtil";

export const useAiToolsStore = defineStore('ai-tool', () => {

  // ai工具列表
  const aiTools = ref(new Array<AiTool>());
  const rev = ref<string>();

  const tags = computed<Set<string>>(() => {
    return new Set(aiTools.value.flatMap(item => item.tags));
  })

  const init = async () => {
    const res = await listByAsync<AiTool>(LocalNameEnum.LIST_AI_TOOL)
    aiTools.value = res.list;
    rev.value = res.rev;
  }

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
    await saveOneByAsync<AiToolContent>(LocalNameEnum.ITEM_AI_TOOL_ + id, {
      id,
      mini: res.mini,
      content: res.content,
      width: res.width,
      height: res.height,
      x: res.x,
      y: res.y,
      center: res.center
    });
    // 处理附件问题
    const icon = await getAttachmentByAsync('/attachment/0');
    if (icon) {
      // 保存附件
      await postAttachment(icon, '/attachment/' + id);
      // 删除临时
      await deleteAttachment('/attachment/0')
    }
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
      await saveOneByAsync<AiToolContent>(LocalNameEnum.ITEM_AI_TOOL_ + id, {
        id,
        mini: res.mini,
        content: res.content,
        width: res.width,
        height: res.height,
        x: res.x,
        y: res.y,
        center: res.center
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
      await removeOneByAsync(LocalNameEnum.ITEM_AI_TOOL_ + id);
      // 删除可能存在的附件
      await deleteAttachment('/attachment/' + id);
      // 删除可能存在的关键字
      utools.removeFeature(`/tool/${id}`)
    }
  }

  const getOne = async (id: string): Promise<AiToolInfo> => {
    const index = aiTools.value.findIndex(item => item.id === id);
    if (index === -1) {
      return Promise.reject(new Error("系统异常：AI工具不存在"))
    }
    const res = await getFromOneByAsync<AiToolContent>(LocalNameEnum.ITEM_AI_TOOL_ + id);
    if (!res.record) {
      return Promise.reject(new Error("系统异常：AI工具详情不存在"))
    }
    return {
      ...aiTools.value[index],
      ...res.record,
    }
  }

  return {
    aiTools, tags,
    init, add, update, remove, getOne
  }

});

export async function fetchAiTool(id: string): Promise<AiToolInfo> {
  // 直接获取全部ai列表
  const res = await listByAsync<AiTool>(LocalNameEnum.LIST_AI_TOOL)
  const index = res.list.findIndex(item => item.id === id);
  if (index === -1) {
    return Promise.reject(new Error("系统异常：AI工具不存在"))
  }
  const content = await getFromOneByAsync<AiToolContent>(LocalNameEnum.ITEM_AI_TOOL_ + id);
  if (!content.record) {
    return Promise.reject(new Error("系统异常：AI工具详情不存在"))
  }
  return {
    ...res.list[index],
    ...content.record,
  }
}

export async function fetchAiToolContent(id: string): Promise<AiToolContent | null> {
  const res = await getFromOneByAsync<AiToolContent>(LocalNameEnum.ITEM_AI_TOOL_ + id);
  return res.record;
}