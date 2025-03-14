import React, { useState } from 'react';
import { KeyRound, ExternalLink, AlertCircle, Sun, Moon } from 'lucide-react';
import { useStore } from '../../store/useStore';

export function ApiKeyInput() {
  const [key, setKey] = useState('');
  const [name, setName] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  
  const { setApiKey, setUserName, error, clearError, isDarkMode, toggleDarkMode } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim() && name.trim()) {
      setIsValidating(true);
      clearError();
      const isValid = await setApiKey(key.trim());
      if (isValid) {
        setUserName(name.trim());
      }
      setIsValidating(false);
    }
  };

  return (
    // Removed min-h-screen from outer div and added h-screen with overflow-y-auto
    <div className={`h-screen overflow-y-auto flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} p-4`}>
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-8 rounded-xl shadow-lg max-w-md w-full relative min-h-[400px]`}>
        <button
          onClick={toggleDarkMode}
          className={`absolute top-4 right-4 p-2 rounded-lg transition-colors ${
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
        
        <div className="flex justify-center mb-8">
          <KeyRound className={`w-12 h-12 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
        </div>
        <h1 className={`text-2xl font-bold text-center mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Welcome to CodeArc
        </h1>
        <p className={`text-center mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Enter your name and Gemini API key to get started.
        </p>
        
        <div className={`${isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4 mb-6`}>
          <h2 className={`font-semibold ${isDarkMode ? 'text-blue-300' : 'text-blue-800'} mb-2`}>
            How to get your API key:
          </h2>
          <ol className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-700'} space-y-2 list-decimal list-inside`}>
            <li>Visit <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} underline inline-flex items-center`}
            >
              Google AI Studio <ExternalLink className="w-3 h-3 ml-0.5" />
            </a></li>
            <li>Sign in with your Google account</li>
            <li>Click on "Create API key" button</li>
            <li>Copy your new API key</li>
          </ol>
          <p className={`mt-3 text-xs ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
            Note: Keep your API key secure and never share it publicly!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none mb-4 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              required
            />
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Enter your Gemini API key"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              required
            />
          </div>
          
          {error && (
            <div className={`flex items-center gap-2 p-4 ${
              isDarkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'
            } border rounded-lg ${
              isDarkMode ? 'text-red-300' : 'text-red-700'
            }`}>
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="flex-1">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isValidating}
            className={`w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 ${
              isDarkMode ? 'hover:bg-purple-700' : 'hover:bg-purple-700'
            }`}
          >
            {isValidating ? 'Validating...' : 'Start Learning'}
          </button>
        </form>
      </div>
    </div>
  );
}