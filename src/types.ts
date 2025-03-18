export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  message: string;
}

export interface ChatRequest {
  sources: string[];
  messages: ChatMessage[];
}
