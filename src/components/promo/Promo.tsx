import React from 'react';
import { Download } from 'lucide-react';

interface PromoProps {
  isDarkMode: boolean;
}

export const Promo: React.FC<PromoProps> = ({ isDarkMode }) => {
  return (
    <div className="mt-4 p-4 border-t border-gray-200 dark:border-gray-700">
      <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        Download Android App Now
      </p>
      <a
        href="https://github.com/0xarchit/CodeArc"
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white ${
          isDarkMode 
            ? 'bg-indigo-600 hover:bg-indigo-700' 
            : 'bg-indigo-500 hover:bg-indigo-600'
        } transition-colors w-full text-sm`}
      >
        <Download className="w-4 h-4" />
        Download Now
      </a>
    </div>
  );
};