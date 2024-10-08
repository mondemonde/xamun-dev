export type ApiProvider = 'anthropic' | 'openai' | 'openrouter' | 'bedrock' | 'vertex' | 'ollama';

export type XamunSay = 'text' | 'error' | 'api_req_started' | 'api_req_finished' | 'api_req_retried' | 'user_feedback' | 'user_feedback_diff' | 'completion_result' | 'inspect_site_result' | 'shell_integration_warning';

export interface XamunMessage {
  ts: number;
  type: 'say';
  say: XamunSay;
  text?: string;
  images?: string[];
}

export interface XamunAskMessage {
  ts: number;
  type: 'ask';
  ask: string;
  text: string;
  images?: string[];
}

export type XamunChatMessage = XamunMessage | XamunAskMessage;

export interface HistoryItem {
  id: string;
  ts: number;
  task: string;
  tokensIn: number;
  tokensOut: number;
  cacheWrites?: number;
  cacheReads?: number;
  totalCost: number;
  messages: XamunChatMessage[];
}

export interface ApiConfiguration {
  apiProvider: ApiProvider;
  apiModelId: string;
  apiKey: string;
}