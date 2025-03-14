import React, { useState, KeyboardEvent } from 'react';
import { Send, Square } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';

interface ChatInputProps {
  isDarkMode: boolean;
  isLoading: boolean;
  isTyping: boolean;
  onSendMessage: (message: string) => void;
  onStopTyping: () => void;
}

export function ChatInput({
  isDarkMode,
  isLoading,
  isTyping,
  onSendMessage,
  onStopTyping,
}: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim() && !isLoading && !isTyping) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
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
            onClick={onStopTyping}
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
  );
}