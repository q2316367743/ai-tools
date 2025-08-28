
/**
 * 聊天分组
 * /list/ai/group
 */
export interface AiChatGroup {
  id: string;
  name: string;
}


/**
 * 聊天分组
 * /item/ai/group/${groupId}
 */
export interface AiChatGroupItem {
  prompt: string;
}

export interface AiChatGroupPostWrap {
  name: string;
  prompt: string;
}
export interface AiChatGroupWrap extends AiChatGroup, AiChatGroupItem{
  rev?: string;
}

export function buildAiChatGroupWrap(): AiChatGroupWrap {
  return {
    id: '0',
    name: '默认分组',
    prompt: ''
  };
}