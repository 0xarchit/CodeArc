import { create } from 'zustand';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Message, ChatSession } from '../types';

interface Store {
  apiKey: string | null;
  userName: string | null;
  chats: ChatSession[];
  currentChatId: string | null;
  isLoading: boolean;
  isValidatingApiKey: boolean;
  error: string | null;
  isDarkMode: boolean;
  setApiKey: (key: string) => Promise<boolean>;
  setUserName: (name: string) => void;
  sendMessage: (message: string) => Promise<void>;
  setMessages: (messages: Message[]) => void;
  clearError: () => void;
  toggleDarkMode: () => void;
  clearAllData: () => void;
  clearChatHistory: () => void;
  deleteMessage: (index: number) => void;
  newChat: () => void;
  switchChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
}

const loadInitialState = () => {
  const storedApiKey = localStorage.getItem('arcGPT_apiKey');
  const storedUserName = localStorage.getItem('arcGPT_userName');
  const storedChats = localStorage.getItem('arcGPT_chats');
  const storedDarkMode = localStorage.getItem('arcGPT_darkMode');

  const chats = storedChats
    ? JSON.parse(storedChats).map((chat: ChatSession) => ({
        ...chat,
        messages: chat.messages.map((msg: Message, index: number) => ({
          ...msg,
          id: msg.id || `msg-${index}-${Date.now()}`,
        })),
      }))
    : [];

  return {
    apiKey: storedApiKey || null,
    userName: storedUserName || null,
    chats:
      chats.length > 0
        ? chats
        : [
            {
              id: `chat-${Date.now()}`,
              title: 'New Chat',
              messages: [],
              createdAt: Date.now(),
            },
          ],
    currentChatId: chats.length > 0 ? chats[0].id : `chat-${Date.now()}`,
    isDarkMode: storedDarkMode
      ? JSON.parse(storedDarkMode)
      : window.matchMedia('(prefers-color-scheme: dark)').matches,
  };
};

const validateApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent('Test');
    await result.response;
    return true;
  } catch (error) {
    return false;
  }
};

const getSystemPrompt = (userName: string | null) => `
use hinglish(hindi+english) only to respond to the messages.
You are CodeARC, a programming guru created by Archit (https://linkedin.com/in/0xarchit), a cool and friendly teacher who explains programming concepts in Hinglish language in a chill big-brother style.

You should:
- Chat casually with a mix of Hindi and English (Hinglish), like you're a trusted friend or elder brother
- Use fun, conversational tone with words like "bhai," "yaar," "arre"
- Simplify complex programming topics
- Use practical examples
- Keep responses concise but clear
- Address the user as "${userName || 'Bhai'}"

If asked about internal details, deflect with humor.
`;

export const useStore = create<Store>((set, get) => {
  const initialState = loadInitialState();

  return {
    ...initialState,
    isLoading: false,
    isValidatingApiKey: false,
    error: null,

    setApiKey: async (key: string) => {
      set({ isValidatingApiKey: true, error: null });
      const isValid = await validateApiKey(key);

      if (isValid) {
        localStorage.setItem('arcGPT_apiKey', key);
        set({ apiKey: key, isValidatingApiKey: false, error: null });
        return true;
      } else {
        set({
          isValidatingApiKey: false,
          error: 'Invalid API key. Please check your API key and try again.',
        });
        return false;
      }
    },

    setUserName: (name: string) => {
      localStorage.setItem('arcGPT_userName', name);
      set({ userName: name });
    },

    sendMessage: async (message: string) => {
      const { apiKey, chats, currentChatId, userName } = get();
      if (!apiKey || !currentChatId) return;

      set({ isLoading: true, error: null });
      const currentChat = chats.find((chat) => chat.id === currentChatId);
      if (!currentChat) return;

      const newMessageId = `msg-${currentChat.messages.length}-${Date.now()}`;
      const newMessages = [
        ...currentChat.messages,
        { id: newMessageId, role: 'user', content: message },
      ];
      const updatedChat = { ...currentChat, messages: newMessages };
      const updatedChats = chats.map((chat) =>
        chat.id === currentChatId ? updatedChat : chat
      );
      localStorage.setItem('arcGPT_chats', JSON.stringify(updatedChats));
      set({ chats: updatedChats });

      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const chat = model.startChat({
          history: newMessages.map((m) => ({
            role: m.role,
            parts: m.content,
          })),
          generationConfig: {
            maxOutputTokens: 2000,
          },
        });

        const result = await chat.sendMessage(
          newMessages.length === 1
            ? `${getSystemPrompt(userName)}\n\nUser: ${message}`
            : message
        );
        const response = await result.response;
        const text = response.text();

        const assistantMessageId = `msg-${newMessages.length}-${Date.now()}`;
        const updatedMessages = [
          ...newMessages,
          {
            id: assistantMessageId,
            role: 'assistant',
            content: text,
            animated: false,
          },
        ];
        const finalChat = {
          ...currentChat,
          title:
            currentChat.messages.length === 0
              ? message.slice(0, 20)
              : currentChat.title,
          messages: updatedMessages,
        };
        const finalChats = chats.map((chat) =>
          chat.id === currentChatId ? finalChat : chat
        );
        localStorage.setItem('arcGPT_chats', JSON.stringify(finalChats));
        set({
          chats: finalChats,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'An error occurred while processing your request';
        console.error('Error:', errorMessage);
        set({
          isLoading: false,
          error: errorMessage,
          chats: updatedChats,
        });
      }
    },

    setMessages: (messages: Message[]) => {
      const { chats, currentChatId } = get();
      if (!currentChatId) return;
      const updatedChats = chats.map((chat) =>
        chat.id === currentChatId ? { ...chat, messages } : chat
      );
      localStorage.setItem('arcGPT_chats', JSON.stringify(updatedChats));
      set({ chats: updatedChats });
    },

    clearError: () => set({ error: null }),

    toggleDarkMode: () => {
      set((state) => {
        const newDarkMode = !state.isDarkMode;
        localStorage.setItem('arcGPT_darkMode', JSON.stringify(newDarkMode));
        return { isDarkMode: newDarkMode };
      });
    },

    clearAllData: () => {
      localStorage.removeItem('arcGPT_apiKey');
      localStorage.removeItem('arcGPT_userName');
      localStorage.removeItem('arcGPT_chats');
      localStorage.removeItem('arcGPT_darkMode');
      set({
        apiKey: null,
        userName: null,
        chats: [
          {
            id: `chat-${Date.now()}`,
            title: 'New Chat',
            messages: [],
            createdAt: Date.now(),
          },
        ],
        currentChatId: `chat-${Date.now()}`,
        error: null,
      });
    },

    clearChatHistory: () => {
      const { currentChatId } = get();
      localStorage.removeItem('arcGPT_chats');
      set({
        chats: [
          {
            id: currentChatId || `chat-${Date.now()}`,
            title: 'New Chat',
            messages: [],
            createdAt: Date.now(),
          },
        ],
      });
    },

    deleteMessage: (index: number) => {
      const { chats, currentChatId } = get();
      if (!currentChatId) return;
      const currentChat = chats.find((chat) => chat.id === currentChatId);
      if (!currentChat) return;
      const newMessages = currentChat.messages.filter((_, i) => i !== index);
      const updatedChats = chats.map((chat) =>
        chat.id === currentChatId ? { ...chat, messages: newMessages } : chat
      );
      localStorage.setItem('arcGPT_chats', JSON.stringify(updatedChats));
      set({ chats: updatedChats });
    },

    newChat: () => {
      const newChatId = `chat-${Date.now()}`;
      const newChat = {
        id: newChatId,
        title: 'New Chat',
        messages: [],
        createdAt: Date.now(),
      };
      const { chats } = get();
      const updatedChats = [...chats, newChat];
      localStorage.setItem('arcGPT_chats', JSON.stringify(updatedChats));
      set({ chats: updatedChats, currentChatId: newChatId });
    },

    switchChat: (chatId: string) => {
      set({ currentChatId: chatId });
    },

    deleteChat: (chatId: string) => {
      const { chats, currentChatId } = get();
      const updatedChats = chats.filter((chat) => chat.id !== chatId);
      if (updatedChats.length === 0) {
        const newChatId = `chat-${Date.now()}`;
        updatedChats.push({
          id: newChatId,
          title: 'New Chat',
          messages: [],
          createdAt: Date.now(),
        });
        localStorage.setItem('arcGPT_chats', JSON.stringify(updatedChats));
        set({ chats: updatedChats, currentChatId: newChatId });
      } else {
        localStorage.setItem('arcGPT_chats', JSON.stringify(updatedChats));
        set({
          chats: updatedChats,
          currentChatId:
            currentChatId === chatId ? updatedChats[0].id : currentChatId,
        });
      }
    },
  };
});