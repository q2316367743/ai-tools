
export interface AiToolPost {

  icon: string;
  title: string;
  description: string;
  // 标签，数组
  tags: Array<string>;

  sessionId: string;

  // 内容
  content: string;

}
export interface AiTool {
  id: string;
  created_at: number;
  updated_at: number;

  // 头像
  icon: string;
  title: string;
  description: string;
  // 标签，数组
  tags: Array<string>;

  sessionId: string;

  is_liked: boolean;
  run_count: number;
}



export interface AiToolInfo extends AiTool {
  content: string;
}


