import React, { useState } from 'react';
import { KeyRound, ExternalLink } from 'lucide-react';
import { useStore } from '../store/useStore';

export const ApiKeyInput: React.FC = () => {
  const [key, setKey] = useState('');
  const [name, setName] = useState('');
  const { setApiKey, setUserName } = useStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim() && name.trim()) {
      setApiKey(key.trim());
      setUserName(name.trim());
      // No navigation needed; App.tsx handles the switch
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <div className="flex items-center justify-center mb-8">
          <KeyRound className="w-12 h-12 text-purple-600" />
        </div>
        <h1 className="text-2xl font-bold text-center mb-2">Welcome to ArcGPT</h1>
        <p className="text-gray-600 text-center mb-6">
          Tumhara programming guru! Enter your name and Gemini API key to get started.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-blue-800 mb-2">How to get your API key:</h2>
          <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
            <li>Visit <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline inline-flex items-center"
            >
              Google AI Studio <ExternalLink className="w-3 h-3 ml-0.5" />
            </a></li>
            <li>Sign in with your Google account</li>
            <li>Click on "Create API key" button</li>
            <li>Copy your new API key</li>
          </ol>
          <p className="mt-3 text-xs text-blue-600">Note: Keep your API key secure and never share it publicly!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Apna naam daal do (e.g., Rohan)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none mb-4"
              required
            />
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Enter your Gemini API key"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Start Learning
          </button>
        </form>
      </div>
    </div>
  );
};