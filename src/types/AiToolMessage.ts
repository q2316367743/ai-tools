export type AiToolMessageRole = 'user' | 'assistant' | 'code' | 'preview';

export interface AiToolMessage {
  id: string;
  created_at: number;

  // 会话ID
  session_id: string;
  role: AiToolMessageRole;

  content: string

}