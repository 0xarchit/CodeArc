import React from 'react';
import { Code, Download, Sun, Moon, Trash2, Menu } from 'lucide-react';

interface ChatHeaderProps {
  title: string;
  isDarkMode: boolean;
  hasMessages: boolean;
  onToggleSidebar: () => void;
  onToggleDarkMode: () => void;
  onDownloadChat: () => void;
  onOpenDeleteModal: () => void;
}

export function ChatHeader({
  title,
  isDarkMode,
  hasMessages,
  onToggleSidebar,
  onToggleDarkMode,
  onDownloadChat,
  onOpenDeleteModal,
}: ChatHeaderProps) {
  return (
    <div className={`border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} p-4 flex justify-between items-center`}>
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSidebar}
          className={`p-2 rounded-lg transition-colors ${
            isDarkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-600'
          }`}
          title="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Code className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`} />
        <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        {hasMessages && (
          <button
            onClick={onDownloadChat}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="Download chat history"
          >
            <Download className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={onToggleDarkMode}
          className={`p-2 rounded-lg transition-colors ${
            isDarkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-600'
          }`}
          title="Toggle dark mode"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <button
          onClick={onOpenDeleteModal}
          className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
          title="Delete data"
        >
          <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
        </button>
      </div>
    </div>
  );
}