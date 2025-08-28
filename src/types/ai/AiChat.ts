import {TdChatItemProps} from "@tdesign-vue-next/chat";


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

export interface AiChatItem extends TdChatItemProps {
  // 时间
  time: number;
  // 内容
  content: string;
  // 思考
  think?: string;

  // 使用的模型
  model: string;
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