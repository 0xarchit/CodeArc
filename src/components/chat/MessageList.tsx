import React, { useState, useEffect, RefObject } from 'react';
import { ChatMessage } from './ChatMessage';
import { Message } from '../../types';
import { useStore } from '../../store/useStore';
import { AlertCircle } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  isDarkMode: boolean;
  userName: string | null;
  userGender: 'male' | 'female';
  messagesEndRef: RefObject<HTMLDivElement>;
  isTyping: boolean;
  setIsTyping: (typing: boolean) => void;
}

export function MessageList({ 
  messages, 
  isDarkMode, 
  userName, 
  userGender,
  messagesEndRef, 
  isTyping, 
  setIsTyping 
}: MessageListProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);
  const [displayedResponse, setDisplayedResponse] = useState('');
  const [lastAnimatedMessageId, setLastAnimatedMessageId] = useState<string | null>(null);

  const { isLoading, error, clearError, setMessages, deleteMessage } = useStore();
  const typingTimeoutRef = React.useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (messages.length === 0) {
      setDisplayedResponse('');
      setIsTyping(false);
      setLastAnimatedMessageId(null);
      return;
    }

    const lastMessage = messages[messages.length - 1];
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
          const updatedMessages = messages.map((msg) =>
            msg.id === lastMessage.id ? { ...msg, animated: true } : msg
          );
          setMessages(updatedMessages);
        }
      };

      typeWord();

      return () => {
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      };
    } else {
      setDisplayedResponse(lastMessage.content);
    }
  }, [messages, setMessages, setIsTyping]);

  const handleCopyCode = (code: string) => {
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCopyMessage = (message: string) => {
    setCopiedMessage(message);
    setTimeout(() => setCopiedMessage(null), 2000);
  };

  const getFirstName = (name: string) => name.split(' ')[0];
  const siblingTerm = userGender === 'male' ? 'Bhai' : 'Bahen';

  return (
    <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
      <div className="max-w-4xl mx-auto">
        {messages.length === 0 ? (
          <div className="text-center mt-8">
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-400">
              Namaste {userName 
                ? `${getFirstName(userName).charAt(0).toUpperCase() + getFirstName(userName).slice(1).toLowerCase()} ${userGender === 'male' ? 'Bhai' : 'Bahen'}` 
                : siblingTerm}! 🙏
            </h2>
            <p className="text-gray-900 dark:text-gray-400">
              Koi bhi programming question pucho, main help kar dunga!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <ChatMessage
                key={message.id}
                message={message}
                isDarkMode={isDarkMode}
                isTyping={isTyping}
                displayedResponse={displayedResponse}
                isLastMessage={index === messages.length - 1}
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
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Thinking...</span>
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="flex justify-start p-4">
            <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 max-w-[90%] md:max-w-[70%]">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="flex-1">{error}</p>
              <button onClick={clearError} className="ml-auto text-sm underline hover:no-underline">Dismiss</button>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}