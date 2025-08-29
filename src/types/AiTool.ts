
export interface AiToolPost {

  icon: string;
  title: string;
  description: string;
  // 标签，数组
  tags: Array<string>;

  sessionId: string;

  // 是否小窗打开
  mini: boolean;
  width?: number,
  height?: number,
  x?: number
  y?: number
  center?: boolean
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
