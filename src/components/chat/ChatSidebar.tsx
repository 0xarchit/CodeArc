import React from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import { ChatSession } from '../../types';
import { Promo } from '../promo/Promo';

interface ChatSidebarProps {
  isOpen: boolean;
  isDarkMode: boolean;
  chats: ChatSession[];
  currentChatId: string;
  onNewChat: () => void;
  onSwitchChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onToggleSidebar: () => void;
}

export function ChatSidebar({
  isOpen,
  isDarkMode,
  chats,
  currentChatId,
  onNewChat,
  onSwitchChat,
  onDeleteChat,
  onToggleSidebar,
}: ChatSidebarProps) {
  return (
    <div
      className={`absolute top-0 left-0 h-full w-64 ${
        isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
      } border-r ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} transform transition-transform duration-300 ease-in-out z-10 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="p-4 flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={onNewChat}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-500 hover:bg-indigo-600'
            } text-white transition-colors`}
          >
            <Plus className="w-5 h-5" />
            New Chat
          </button>
          <button
            onClick={onToggleSidebar}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chats.map(chat => (
            <div
              key={chat.id}
              className={`flex items-center justify-between p-2 rounded-lg cursor-pointer ${
                chat.id === currentChatId
                  ? isDarkMode
                    ? 'bg-gray-700'
                    : 'bg-gray-200'
                  : isDarkMode
                  ? 'hover:bg-gray-700'
                  : 'hover:bg-gray-200'
              }`}
            >
              <span
                onClick={() => onSwitchChat(chat.id)}
                className={`flex-1 truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}
              >
                {chat.title}
              </span>
              <button
                onClick={() => onDeleteChat(chat.id)}
                className="p-1 rounded-full hover:bg-red-500/20 transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
              </button>
            </div>
          ))}
        </div>
        <Promo isDarkMode={isDarkMode} />
      </div>
    </div>
  );
}