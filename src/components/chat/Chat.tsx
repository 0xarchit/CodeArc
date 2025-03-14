import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { ChatHeader } from './ChatHeader';
import { ChatSidebar } from './ChatSidebar';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { DeleteModal } from './DeleteModal';
import { AlertCircle } from 'lucide-react';

export function Chat() {
  const [input, setInput] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [displayedResponse, setDisplayedResponse] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lastAnimatedMessageId, setLastAnimatedMessageId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const {
    chats,
    currentChatId,
    sendMessage,
    setMessages,
    isLoading,
    error,
    clearError,
    isDarkMode,
    toggleDarkMode,
    userName,
    clearAllData,
    clearChatHistory,
    deleteMessage,
    newChat,
    switchChat,
    deleteChat,
  } = useStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const currentChat = chats.find(chat => chat.id === currentChatId) || { messages: [], title: "New Chat" };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat.messages]);

  const stopTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    const lastMessage = currentChat.messages[currentChat.messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant' && !lastMessage.animated) {
      setDisplayedResponse(lastMessage.content);
      setIsTyping(false);
      setLastAnimatedMessageId(lastMessage.id);
      const updatedMessages = currentChat.messages.map((msg) =>
        msg.id === lastMessage.id ? { ...msg, animated: true } : msg
      );
      setMessages(updatedMessages);
    }
  };

  useEffect(() => {
    if (currentChat.messages.length === 0) {
      setDisplayedResponse('');
      setIsTyping(false);
      setLastAnimatedMessageId(null);
      return;
    }

    const lastMessage = currentChat.messages[currentChat.messages.length - 1];

    if (
      lastMessage.role === 'assistant' &&
      !lastMessage.animated &&
      lastAnimatedMessageId !== lastMessage.id &&
      !isTyping
    ) {
      setIsTyping(true);
      let currentText = '';
      const words = lastMessage.content.split(' ');
      let currentIndex = 0;

      const typeWord = () => {
        if (currentIndex < words.length) {
          currentText += (currentIndex > 0 ? ' ' : '') + words[currentIndex];
          setDisplayedResponse(currentText);
          currentIndex++;
          typingTimeoutRef.current = setTimeout(typeWord, 50);
        } else {
          setIsTyping(false);
          setLastAnimatedMessageId(lastMessage.id);
          const updatedMessages = currentChat.messages.map((msg) =>
            msg.id === lastMessage.id ? { ...msg, animated: true } : msg
          );
          setMessages(updatedMessages);
        }
      };

      typeWord();

      return () => {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      };
    } else {
      setDisplayedResponse(lastMessage.content);
      setIsTyping(false);
    }
  }, [currentChat.messages, setMessages]);

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCopyMessage = async (message: string) => {
    await navigator.clipboard.writeText(message);
    setCopiedMessage(message);
    setTimeout(() => setCopiedMessage(null), 2000);
  };

  const handleDownloadChat = () => {
    const chatContent = currentChat.messages.map(msg => 
      `${msg.role.toUpperCase()}:\n${msg.content}\n\n`
    ).join('---\n\n');
    
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentChat.title}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getFirstName = (name: string) => {
    return name.split(' ')[0];
  };

  return (
    <div className={`fixed inset-0 flex ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <ChatSidebar
        isOpen={isSidebarOpen}
        isDarkMode={isDarkMode}
        chats={chats}
        currentChatId={currentChatId}
        onNewChat={newChat}
        onSwitchChat={switchChat}
        onDeleteChat={deleteChat}
        onToggleSidebar={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <ChatHeader
          title={currentChat.title}
          isDarkMode={isDarkMode}
          hasMessages={currentChat.messages.length > 0}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onToggleDarkMode={toggleDarkMode}
          onDownloadChat={handleDownloadChat}
          onOpenDeleteModal={() => setIsDeleteModalOpen(true)}
        />

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {currentChat.messages.length === 0 ? (
              <div className="text-center mt-8">
                <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-400">
                  Namaste {userName ? `${getFirstName(userName).charAt(0).toUpperCase() + getFirstName(userName).slice(1).toLowerCase()} Bhai` : 'Bhai'}! 🙏
                </h2>
                <p className="text-gray-900 dark:text-gray-400">
                  Koi bhi programming question pucho, main help kar dunga!
                </p>
              </div>
            ) : (
              <div className="space-y-4 p-4">
                {currentChat.messages.map((message, index) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isDarkMode={isDarkMode}
                    isTyping={isTyping}
                    displayedResponse={displayedResponse}
                    isLastMessage={index === currentChat.messages.length - 1}
                    copiedCode={copiedCode}
                    copiedMessage={copiedMessage}
                    onCopyCode={handleCopyCode}
                    onCopyMessage={handleCopyMessage}
                    onDeleteMessage={() => deleteMessage(index)}
                  />
                ))}
              </div>
            )}
            {isLoading && (
              <div className="flex justify-start p-4">
                <div className={`max-w-[90%] md:max-w-[70%] rounded-2xl p-4 ${
                  isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800 shadow-md'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                      Thinking...
                    </span>
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="flex justify-start p-4">
                <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 max-w-[90%] md:max-w-[70%]">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="flex-1">{error}</p>
                  <button 
                    onClick={clearError}
                    className="ml-auto text-sm underline hover:no-underline"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <ChatInput
          isDarkMode={isDarkMode}
          isLoading={isLoading}
          isTyping={isTyping}
          onSendMessage={sendMessage}
          onStopTyping={stopTyping}
        />
      </div>

      {isDeleteModalOpen && (
        <DeleteModal
          isDarkMode={isDarkMode}
          onClearChatHistory={() => {
            clearChatHistory();
            setIsDeleteModalOpen(false);
          }}
          onClearAllData={() => {
            clearAllData();
            setIsDeleteModalOpen(false);
          }}
          onClose={() => setIsDeleteModalOpen(false)}
        />
      )}
    </div>
  );
}