declare module "@google/generative-ai" {
  export class GoogleGenerativeAI {
    constructor(apiKey: string);
    getGenerativeModel(options: { model: string }): GenerativeModel;
  }

  export class GenerativeModel {
    generateContent(prompt: string): Promise<GenerateContentResult>;
    startChat(options?: {
      history?: Array<{ role: "user" | "assistant"; parts: string }>;
      generationConfig?: { maxOutputTokens?: number };
    }): ChatSession;
  }

  export interface GenerateContentResult {
    response: Response;
  }

  export interface Response {
    text(): string;
  }

  export interface ChatSession {
    sendMessage(message: string): Promise<GenerateContentResult>;
  }
}
