import React from 'react';

interface DeleteModalProps {
  isDarkMode: boolean;
  onClearChatHistory: () => void;
  onClearAllData: () => void;
  onClose: () => void;
}

export function DeleteModal({
  isDarkMode,
  onClearChatHistory,
  onClearAllData,
  onClose,
}: DeleteModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`p-6 rounded-lg shadow-lg max-w-sm w-full ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
        <h2 className="text-xl font-bold mb-4">Delete Data</h2>
        <p className="mb-4">What would you like to delete?</p>
        <div className="space-y-4">
          <button
            onClick={onClearChatHistory}
            className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Delete All Chat History
          </button>
          <button
            onClick={onClearAllData}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete Everything (Chat, API Key, Name)
          </button>
          <button
            onClick={onClose}
            className={`w-full ${isDarkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} text-gray-800 dark:text-white py-2 px-4 rounded-lg transition-colors`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}