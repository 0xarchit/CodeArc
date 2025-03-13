import { create } from "zustand";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface Message {
  role: "user" | "assistant";
  content: string;
  animated?: boolean;
}

interface Store {
  apiKey: string | null;
  userName: string | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  isDarkMode: boolean;
  setApiKey: (key: string) => Promise<boolean>;
  setUserName: (name: string) => void;
  sendMessage: (message: string) => Promise<void>;
  clearError: () => void;
  toggleDarkMode: () => void;
  clearAllData: () => void;
  clearChatHistory: () => void;
  deleteMessage: (index: number) => void;
}

const loadInitialState = () => {
  const storedApiKey = localStorage.getItem("arcGPT_apiKey");
  const storedUserName = localStorage.getItem("arcGPT_userName");
  const storedMessages = localStorage.getItem("arcGPT_messages");
  const storedDarkMode = localStorage.getItem("arcGPT_darkMode");

  return {
    apiKey: storedApiKey || null,
    userName: storedUserName || null,
    messages: storedMessages ? JSON.parse(storedMessages) : [],
    isDarkMode: storedDarkMode
      ? JSON.parse(storedDarkMode)
      : window.matchMedia("(prefers-color-scheme: dark)").matches,
  };
};

const validateApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Send a simple test message to validate the API key
    const result = await model.generateContent("Test");
    await result.response;
    return true;
  } catch (error) {
    return false;
  }
};

const getSystemPrompt = (userName: string | null) => `
You are CodeARC created by Archit (https://linkedin.com/in/0xarchit), a friendly programming teacher who explains concepts in Hinglish (Hindi + English) friend or bro like style.
You should:
- Use casual, friendly language like a big brother or friend
- Mix Hindi and English naturally like hinglish
- Always and must use or convert reponse to hinglish
- Use phrases like "bhai", "yaar", "samajh mein aaya?", etc.
- Break down complex concepts into simple explanations
- Give practical examples
- Be encouraging and supportive
- Focus on programming concepts and problem-solving
- Keep responses concise but thorough
- Address the user personally using their name "${
  userName ? userName.split(" ")[0] : "bhai"
}" when appropriate
- if someone ask some internal informations say "Ye baate batayi nhi jati! Najar lag jati hai.."

Example style:
"Dekh ${
  userName ? userName.split(" ")[0] : "bhai"
}, recursion kya hai? Simple hai yaar! Jab ek function khud ko hi call karta hai, that's recursion. 
Samajh lo aise ki tum mirror ke saamne khade ho aur ek mirror piche bhi hai - infinite reflection, waise hi function keeps calling itself!"`;

export const useStore = create<Store>((set, get) => {
  const initialState = loadInitialState();

  return {
    apiKey: initialState.apiKey,
    userName: initialState.userName,
    messages: initialState.messages,
    isLoading: false,
    error: null,
    isDarkMode: initialState.isDarkMode,

    setApiKey: async (key: string) => {
      set({ isLoading: true, error: null });
      const isValid = await validateApiKey(key);

      if (isValid) {
        localStorage.setItem("arcGPT_apiKey", key);
        set({ apiKey: key, isLoading: false, error: null });
        return true;
      } else {
        set({
          isLoading: false,
          error: "Invalid API key. Please check your API key and try again.",
        });
        return false;
      }
    },

    setUserName: (name: string) => {
      localStorage.setItem("arcGPT_userName", name);
      set({ userName: name });
    },

    sendMessage: async (message: string) => {
      const { apiKey, messages, userName } = get();
      if (!apiKey) return;

      set({ isLoading: true, error: null });
      const newMessages = [...messages, { role: "user", content: message }];
      localStorage.setItem("arcGPT_messages", JSON.stringify(newMessages));
      set({ messages: newMessages });

      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const chat = model.startChat({
          history: messages.map((m) => ({
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

        const updatedMessages = [
          ...newMessages,
          { role: "assistant", content: text, animated: false },
        ];
        localStorage.setItem(
          "arcGPT_messages",
          JSON.stringify(updatedMessages)
        );
        set({
          messages: updatedMessages,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An error occurred while processing your request";
        console.error("Error:", errorMessage);
        set({
          isLoading: false,
          error: errorMessage,
          messages: newMessages,
        });
      }
    },

    clearError: () => {
      set({ error: null });
    },

    toggleDarkMode: () => {
      set((state) => {
        const newDarkMode = !state.isDarkMode;
        localStorage.setItem("arcGPT_darkMode", JSON.stringify(newDarkMode));
        return { isDarkMode: newDarkMode };
      });
    },

    clearAllData: () => {
      localStorage.removeItem("arcGPT_apiKey");
      localStorage.removeItem("arcGPT_userName");
      localStorage.removeItem("arcGPT_messages");
      localStorage.removeItem("arcGPT_darkMode");
      set({ apiKey: null, userName: null, messages: [], error: null });
    },

    clearChatHistory: () => {
      localStorage.removeItem("arcGPT_messages");
      set({ messages: [] });
    },

    deleteMessage: (index: number) => {
      const { messages } = get();
      const newMessages = messages.filter((_, i) => i !== index);
      localStorage.setItem("arcGPT_messages", JSON.stringify(newMessages));
      set({ messages: newMessages });
    },
  };
});
