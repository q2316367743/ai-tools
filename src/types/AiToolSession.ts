
export interface AiToolSessionCore {

  title: string;

  // 使用的AI
  ai_id: string;
  // 使用的模型
  ai_model: string;
}

export interface AiToolSession extends AiToolSessionCore {
  id: string;
  created_at: number;
  updated_at: number;

}