import React from 'react';
import { Copy, Check, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../../types';

interface ChatMessageProps {
  message: Message;
  isDarkMode: boolean;
  isTyping: boolean;
  displayedResponse: string;
  isLastMessage: boolean;
  copiedCode: string | null;
  copiedMessage: string | null;
  onCopyCode: (code: string) => void;
  onCopyMessage: (message: string) => void;
  onDeleteMessage: () => void;
}

export function ChatMessage({
  message,
  isDarkMode,
  isTyping,
  displayedResponse,
  isLastMessage,
  copiedCode,
  copiedMessage,
  onCopyCode,
  onCopyMessage,
  onDeleteMessage,
}: ChatMessageProps) {
  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[90%] md:max-w-[70%] rounded-2xl p-4 relative ${
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
          } max-w-none`}
          remarkPlugins={[remarkGfm]}
          components={{
            table: ({ children }) => (
              <div className="overflow-x-auto my-4">
                <table className={`w-full border-collapse ${
                  message.role === 'user' || isDarkMode
                    ? 'border-gray-700'
                    : 'border-gray-200'
                }`}>
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className={`${
                message.role === 'user' || isDarkMode
                  ? 'bg-gray-800/50'
                  : 'bg-gray-50'
              }`}>
                {children}
              </thead>
            ),
            tr: ({ children }) => (
              <tr className={`border-b ${
                message.role === 'user' || isDarkMode
                  ? 'border-gray-700'
                  : 'border-gray-200'
              }`}>
                {children}
              </tr>
            ),
            th: ({ children }) => (
              <th className="px-4 py-2 text-left font-semibold">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-4 py-2">
                {children}
              </td>
            ),
            code: ({ node, inline, className, children, ...props }) => {
              const match = /language-(\w+)/.exec(className || '');
              const code = String(children).replace(/\n$/, '');
              const hasNewlines = code.includes('\n');
              const isCodeBlock = !inline && (hasNewlines || match);
              
              return isCodeBlock ? (
                <div className="relative mt-4 mb-4">
                  <div className="absolute right-2 top-2">
                    <button
                      onClick={() => onCopyCode(code)}
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
                  <pre className={`${
                    message.role === 'user'
                      ? 'bg-black/20 border border-white/10'
                      : isDarkMode
                      ? 'bg-gray-900 border border-gray-700'
                      : 'bg-gray-50 border border-gray-200'
                  } rounded-lg p-4`}>
                    <code className={`${match?.[1] || ''} text-sm font-mono`}>
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
                      ? 'bg-gray-900 border border-gray-700'
                      : 'bg-gray-50 border border-gray-200'
                  } rounded-md px-1.5 py-0.5 text-sm font-mono`}
                  {...props}
                >
                  {children}
                </code>
              );
            },
          }}
        >
          {message.role === 'assistant' && isTyping && isLastMessage
            ? displayedResponse
            : message.content}
        </ReactMarkdown>
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={() => onCopyMessage(message.content)}
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
            onClick={onDeleteMessage}
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
  );
}