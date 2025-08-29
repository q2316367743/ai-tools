import {AiTool, AiToolContent} from "@/types";

export interface AiToolInfo extends AiTool, AiToolContent {
  // 是否小窗打开
  mini: boolean;
  content: string;
}
