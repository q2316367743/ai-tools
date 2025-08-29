export interface AiToolContent {
  id: string;

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