import { create } from 'zustand';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Store {
  apiKey: string | null;
  userName: string | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  isDarkMode: boolean;
  setApiKey: (key: string) => void;
  setUserName: (name: string) => void;
  sendMessage: (message: string) => Promise<void>;
  clearError: () => void;
  toggleDarkMode: () => void;
  clearAllData: () => void;
  clearChatHistory: () => void; // New function to clear only chat history
}

const loadInitialState = () => {
  const storedApiKey = localStorage.getItem('arcGPT_apiKey');
  const storedUserName = localStorage.getItem('arcGPT_userName');
  const storedMessages = localStorage.getItem('arcGPT_messages'); // Changed to localStorage
  
  return {
    apiKey: storedApiKey || null,
    userName: storedUserName || null,
    messages: storedMessages ? JSON.parse(storedMessages) : [],
  };
};

const getSystemPrompt = (userName: string | null) => `
You are CodeARC created by Archit (https://linkedin.com/in/0xarchit), a friendly programming teacher who explains concepts in Hinglish (Hindi + English) using "bhai lang" style.
You should:
- Use casual, friendly language like a big brother
- Mix Hindi and English naturally
- Use phrases like "bhai", "yaar", "samajh mein aaya?"
- Break down complex concepts into simple explanations
- Give practical examples
- Be encouraging and supportive
- Focus on programming concepts and problem-solving
- Keep responses concise but thorough
- Address the user personally using their name "${userName || 'bhai'}" when appropriate if full name given like Rohan Agarwal then use only Rohan
- Use humor and fun examples to make learning enjoyable

Example style:
"Dekh ${userName || 'bhai'}, recursion kya hai? Simple hai yaar! Jab ek function khud ko hi call karta hai, that's recursion. 
Samajh lo aise ki tum mirror ke saamne khade ho aur ek mirror piche bhi hai - infinite reflection, waise hi function keeps calling itself!"`;

export const useStore = create<Store>((set, get) => {
  const initialState = loadInitialState();

  return {
    apiKey: initialState.apiKey,
    userName: initialState.userName,
    messages: initialState.messages,
    isLoading: false,
    error: null,
    isDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,

    setApiKey: (key: string) => {
      localStorage.setItem('arcGPT_apiKey', key);
      set({ apiKey: key, error: null });
    },

    setUserName: (name: string) => {
      localStorage.setItem('arcGPT_userName', name);
      set({ userName: name });
    },

    sendMessage: async (message: string) => {
      const { apiKey, messages, userName } = get();
      if (!apiKey) return;

      set({ isLoading: true, error: null });
      const newMessages = [...messages, { role: 'user', content: message }];
      localStorage.setItem('arcGPT_messages', JSON.stringify(newMessages)); // Changed to localStorage
      set({ messages: newMessages });

      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const chat = model.startChat({
          history: messages.map(m => ({
            role: m.role,
            parts: m.content,
          })),
          generationConfig: {
            maxOutputTokens: 2000,
          },
        });

        const result = await chat.sendMessage(
          messages.length === 0 
            ? `${getSystemPrompt(userName)}\n\nUser: ${message}`
            : message
        );
        const response = await result.response;
        const text = response.text();

        const updatedMessages = [...newMessages, { role: 'assistant', content: text }];
        localStorage.setItem('arcGPT_messages', JSON.stringify(updatedMessages)); // Changed to localStorage
        set({
          messages: updatedMessages,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred while processing your request';
        console.error('Error:', errorMessage);
        set({ 
          isLoading: false,
          error: errorMessage,
          messages: newMessages
        });
      }
    },

    clearError: () => {
      set({ error: null });
    },

    toggleDarkMode: () => {
      set(state => ({ isDarkMode: !state.isDarkMode }));
    },

    clearAllData: () => {
      localStorage.removeItem('arcGPT_apiKey');
      localStorage.removeItem('arcGPT_userName');
      localStorage.removeItem('arcGPT_messages');
      set({ apiKey: null, userName: null, messages: [], error: null });
    },

    clearChatHistory: () => {
      localStorage.removeItem('arcGPT_messages');
      set({ messages: [] });
    },
  };
});