export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  animated?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}
