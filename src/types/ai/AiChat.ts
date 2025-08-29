import {TdChatItemMeta} from "@tdesign-vue-next/chat";


/**
 * ai聊天列表
 * /list/ai/chat/${groupId}
 */
export interface AiChatList {
  // 聊天ID，用于获取内容
  id: string;
  name: string;
  createBy: number;
  top: boolean;
}

export interface AiChatItem extends TdChatItemMeta {
  // 时间
  time: number;
  // 内容
  content: string;
  // 思考
  think?: string;
  // 约束角色类型
  role?: 'user' | 'assistant' | 'error' | 'model-change' | 'system';

  // 使用的模型
  model: string;
}

export function transferAiChatItemToUtoolsAiMessage(items: Array<AiChatItem>): Array<UtoolsAiMessage> {
  const messages = new Array<UtoolsAiMessage>();
  for (let item of items) {
    if (item.role === 'system' || item.role === 'user' || item.role === 'assistant') {
      messages.push({
        role: item.role,
        content: item.content,
        reasoning_content: item.think,
      })
    }
  }
  return messages;
}

/**
 * 聊天项
 * /item/ai/chat/${chatId}
 */
export interface AiChatContent {

  // 聊天内容
  items: Array<AiChatItem>;
}

export interface AiChatWrap extends AiChatList, AiChatContent {
  groupId: string;
  rev?: string;
}