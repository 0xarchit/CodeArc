import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { ChatHeader } from './ChatHeader';
import { ChatSidebar } from './ChatSidebar';
import { ChatInput } from './ChatInput';
import { DeleteModal } from './DeleteModal';
import { MessageList } from './MessageList';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Toast } from '@capacitor/toast';

export function Chat() {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const {
    chats,
    currentChatId,
    isDarkMode,
    toggleDarkMode,
    userName,
    clearAllData,
    clearChatHistory,
    newChat,
    switchChat,
    deleteChat,
  } = useStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentChat = chats.find(chat => chat.id === currentChatId) || { messages: [], title: "New Chat" };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat.messages]);

  async function getUniqueFilename(baseName: string): Promise<string> {
    let suffix = 0;
    let newName = baseName;
    while (true) {
      try {
        await Filesystem.stat({
          path: `CodeArc/${newName}.txt`,
          directory: Directory.Documents,
        });
        suffix++;
        newName = baseName + `(${suffix})`;
      } catch {
        break;
      }
    }
    return newName;
  }

  const handleDownloadChat = async () => {
    const filename = `${currentChat.title || 'Chat'}`;
    const chatContent = currentChat.messages
      .map(msg => `${msg.role.toUpperCase()}:\n${msg.content}\n\n`)
      .join('---\n\n');

    if (Capacitor.isNativePlatform()) {
      try {
        const uniqueFilename = await getUniqueFilename(filename);
        await Filesystem.writeFile({
          path: `CodeArc/${uniqueFilename}.txt`,
          data: chatContent,
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
          recursive: true,
        });
        await Toast.show({ text: `Saved at Documents/CodeArc` });
      } catch (error) {
        console.error('Error saving file:', error);
        await Toast.show({ text: 'Error saving chat. Please ensure storage permission is granted.' });
      }
    } else {
      const blob = new Blob([chatContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleClearChatHistory = () => {
    clearChatHistory();
    setIsDeleteModalOpen(false);
  };

  const handleClearAllData = () => {
    clearAllData();
    setIsDeleteModalOpen(false);
  };

  function handleContainerClick() {
    if (isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  }

  return (
    <div
      className={`fixed inset-0 flex ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}
      onClick={handleContainerClick}
    >
      <div onClick={e => e.stopPropagation()}>
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
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <ChatHeader
          title={currentChat.title}
          isDarkMode={isDarkMode}
          hasMessages={currentChat.messages.length > 0}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onToggleDarkMode={toggleDarkMode}
          onDownloadChat={handleDownloadChat} // Direct download without modal
          onOpenDeleteModal={() => setIsDeleteModalOpen(true)}
        />

        <MessageList
          messages={currentChat.messages}
          isDarkMode={isDarkMode}
          userName={userName}
          messagesEndRef={messagesEndRef}
          isTyping={isTyping}
          setIsTyping={setIsTyping}
        />

        <ChatInput
          isDarkMode={isDarkMode}
          isTyping={isTyping}
          setIsTyping={setIsTyping}
        />

        {isDeleteModalOpen && (
          <DeleteModal
            isDarkMode={isDarkMode}
            onClearChatHistory={handleClearChatHistory}
            onClearAllData={handleClearAllData}
            onClose={() => setIsDeleteModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
}