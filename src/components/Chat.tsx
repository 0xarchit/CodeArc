import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Send, AlertCircle, Sun, Moon, Copy, Check, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import TextareaAutosize from 'react-textarea-autosize';
import { useStore } from '../store/useStore';

export const Chat: React.FC = () => {
  const [input, setInput] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { messages, sendMessage, isLoading, error, clearError, isDarkMode, toggleDarkMode, userName, clearAllData, clearChatHistory } = useStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim() && !isLoading) {
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

  const handleOpenDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const handleClearChatHistory = () => {
    clearChatHistory();
    setIsDeleteModalOpen(false);
  };

  const handleClearAllData = () => {
    clearAllData();
    setIsDeleteModalOpen(false);
  };

  return (
    <div className={`flex flex-col h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="border-b dark:border-gray-700 bg-white dark:bg-gray-800 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">CodeArc🚀</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Toggle dark mode"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-gray-200" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600" />
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
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
              <h2 className="text-2xl font-bold mb-2">
                Namaste {userName ? `${userName} Bhai` : 'Bhai'}! 🙏
              </h2>
              <p>Koi bhi programming question pucho, main help kar dunga!</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[90%] md:max-w-[70%] rounded-2xl p-4 ${
                    message.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : isDarkMode
                      ? 'bg-gray-800 text-gray-100'
                      : 'bg-white text-gray-800 shadow-md'
                  }`}
                >
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
                      blockquote: ({ children }) => (
                        <blockquote
                          className={`border-l-4 ${
                            message.role === 'user'
                              ? 'border-white/30 bg-indigo-700/30'
                              : isDarkMode
                              ? 'border-gray-600 bg-gray-700/30'
                              : 'border-indigo-500 bg-indigo-50'
                          } pl-4 py-2 my-4 italic rounded-r-lg`}
                        >
                          {children}
                        </blockquote>
                      ),
                      p: ({ children }) => (
                        <p className="mb-4 last:mb-0">{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc pl-6 mb-4 last:mb-0 space-y-2">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal pl-6 mb-4 last:mb-0 space-y-2">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="leading-relaxed">{children}</li>
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
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
                    Generating response...
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

      <div className={`border-t dark:border-gray-700 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
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
            disabled={isLoading}
            maxRows={8}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Delete Data Modal */}
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
                Delete Chat History Only
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