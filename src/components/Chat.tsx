import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Send, AlertCircle, Sun, Moon, Copy, Check, Trash2, Download, Code, Square, Plus, Menu, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import TextareaAutosize from 'react-textarea-autosize';
import { useStore } from '../store/useStore';

export const Chat: React.FC = () => {
  const [input, setInput] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [displayedResponse, setDisplayedResponse] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lastAnimatedMessageId, setLastAnimatedMessageId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar closed by default

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

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim() && !isLoading && !isTyping) {
      const message = input.trim();
      setInput('');
      await sendMessage(message);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

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

  const handleOpenDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const handleClearChatHistory = () => {
    clearChatHistory();
    setIsDeleteModalOpen(false);
    setDisplayedResponse('');
    setIsTyping(false);
    setLastAnimatedMessageId(null);
  };

  const handleClearAllData = () => {
    clearAllData();
    setIsDeleteModalOpen(false);
    setDisplayedResponse('');
    setIsTyping(false);
    setLastAnimatedMessageId(null);
  };

  const handleDeleteMessage = (index: number) => {
    deleteMessage(index);
    setIsTyping(false);
    if (currentChat.messages.length > 1) {
      const newLastMessage = currentChat.messages[currentChat.messages.length - 2];
      setDisplayedResponse(newLastMessage.content);
      setLastAnimatedMessageId(newLastMessage.id);
    } else {
      setDisplayedResponse('');
      setLastAnimatedMessageId(null);
    }
  };

  const getFirstName = (name: string) => {
    return name.split(' ')[0];
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={`flex flex-col h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'} relative`}>
      {/* Sidebar */}
      <div
        className={`absolute top-0 left-0 h-full w-64 ${
          isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
        } border-r ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} transform transition-transform duration-300 ease-in-out z-10 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={newChat}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-500 hover:bg-indigo-600'
              } text-white transition-colors`}
            >
              <Plus className="w-5 h-5" />
              New Chat
            </button>
            <button
              onClick={toggleSidebar}
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
                  onClick={() => switchChat(chat.id)}
                  className={`flex-1 truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}
                >
                  {chat.title}
                </span>
                <button
                  onClick={() => deleteChat(chat.id)}
                  className="p-1 rounded-full hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className={`border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} p-4 flex justify-between items-center`}>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSidebar}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-600'
              }`}
              title={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            >
              <Menu className="w-5 h-5" />
            </button>
            <Code className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`} />
            <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{currentChat.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            {currentChat.messages.length > 0 && (
              <button
                onClick={handleDownloadChat}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'hover:bg-gray-700 text-gray-200' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
                title="Download chat history"
              >
                <Download className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'hover:bg-gray-700 text-gray-200' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              title="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={handleOpenDeleteModal}
              className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
              title="Delete data"
            >
              <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-4xl mx-auto space-y-4">
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
              currentChat.messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[90%] md:max-w-[70%] rounded-2xl p-4 relative ${
                      message.role === 'user'
                        ? 'bg-indigo-600 text-white'
                        : isDarkMode
                        ? 'bg-gray-800 text-gray-100'
                        : 'bg-white text-gray-800 shadow-md'
                    }`}
                  >
                    <div className="relative">
                      <ReactMarkdown
                        className={`prose ${
                          message.role === 'user'
                            ? 'prose-invert'
                            : isDarkMode
                            ? 'prose-invert'
                            : 'prose-slate'
                        } max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:leading-7 prose-pre:bg-transparent prose-pre:p-0 prose-pre:my-0 prose-code:before:content-none prose-code:after:content-none`}
                        components={{
                          code: ({ node, inline, className, children, ...props }) => {
                            const match = /language-(\w+)/.exec(className || '');
                            const code = String(children).replace(/\n$/, '');
                            const hasNewlines = code.includes('\n');
                            const isCodeBlock = !inline && (hasNewlines || match);
                            
                            return isCodeBlock ? (
                              <div className="relative mt-4 mb-4">
                                <div className="absolute right-2 top-2">
                                  <button
                                    onClick={() => handleCopyCode(code)}
                                    className={`p-1 rounded-md transition-colors ${
                                      message.role === 'user'
                                        ? 'bg-white/10 hover:bg-white/20 text-white'
                                        : isDarkMode
                                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                    }`}
                                    title="Copy code"
                                  >
                                    {copiedCode === code ? (
                                      <Check className="w-3.5 h-3.5" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                                <pre
                                  className={`${
                                    message.role === 'user'
                                      ? 'bg-black/20 border border-white/10'
                                      : isDarkMode
                                      ? 'bg-gray-900 border border-gray-700'
                                      : 'bg-gray-50 border border-gray-200'
                                  } rounded-lg p-4 min-h-[40px] overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent`}
                                >
                                  <code
                                    className={`${match?.[1] || ''} text-sm font-mono ${
                                      message.role === 'user'
                                        ? 'text-white'
                                        : isDarkMode
                                        ? 'text-gray-100'
                                        : 'text-gray-800'
                                    } whitespace-pre break-words block`}
                                    {...props}
                                  >
                                    {code}
                                  </code>
                                </pre>
                              </div>
                            ) : (
                              <code
                                className={`${
                                  message.role === 'user'
                                    ? 'bg-black/20 border border-white/10'
                                    : isDarkMode
                                    ? 'bg-gray-900 border border-gray-700 text-gray-100'
                                    : 'bg-gray-50 border border-gray-200 text-gray-800'
                                } rounded-md px-1.5 py-0.5 text-sm font-mono`}
                                {...props}
                              >
                                {children}
                              </code>
                            );
                          },
                        }}
                      >
                        {message.role === 'assistant' && isTyping && index === currentChat.messages.length - 1
                          ? displayedResponse 
                          : message.content}
                      </ReactMarkdown>
                      <div className="flex justify-end gap-2 mt-4">
                        <button
                          onClick={() => handleCopyMessage(message.content)}
                          className={`p-1.5 rounded-md transition-colors ${
                            message.role === 'user'
                              ? 'bg-white/10 hover:bg-white/20'
                              : isDarkMode
                              ? 'bg-gray-700 hover:bg-gray-600'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                          title="Copy message"
                        >
                          {copiedMessage === message.content ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(index)}
                          className={`p-1.5 rounded-md transition-colors ${
                            message.role === 'user'
                              ? 'bg-white/10 hover:bg-white/20'
                              : isDarkMode
                              ? 'bg-gray-700 hover:bg-gray-600'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                          title="Delete message"
                        >
                          <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
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
              <div className="flex justify-start">
                <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 max-w-[90%] md:max-w-[70%]">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="flex-1">{error}</p>
                  <button 
                    onClick={() => clearError()}
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

        <div className={`border-t ${
          isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
        } p-4 flex justify-center`}>
          <form
            onSubmit={handleSubmit}
            className="flex items-start gap-2 w-full max-w-3xl px-4"
          >
            <TextareaAutosize
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Apna question type karo..."
              className={`flex-1 px-4 py-2 rounded-lg outline-none resize-none max-h-[200px] min-h-[44px] ${
                isDarkMode
                  ? 'bg-gray-700 text-gray-100 placeholder-gray-400 border-gray-600'
                  : 'bg-gray-50 text-gray-800 placeholder-gray-500 border-gray-200'
              } border focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
              disabled={isLoading || isTyping}
              maxRows={8}
            />
            {isTyping ? (
              <button
                type="button"
                onClick={stopTyping}
                className="bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 transition-colors flex-shrink-0"
                title="Stop typing"
              >
                <Square className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex-shrink-0"
              >
                <Send className="w-5 h-5" />
              </button>
            )}
          </form>
        </div>
      </div>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg shadow-lg max-w-sm w-full ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
            <h2 className="text-xl font-bold mb-4">Delete Data</h2>
            <p className="mb-4">What would you like to delete?</p>
            <div className="space-y-4">
              <button
                onClick={handleClearChatHistory}
                className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Delete All Chat History
              </button>
              <button
                onClick={handleClearAllData}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Everything (Chat, API Key, Name)
              </button>
              <button
                onClick={handleCloseDeleteModal}
                className={`w-full ${isDarkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} text-gray-800 dark:text-white py-2 px-4 rounded-lg transition-colors`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};