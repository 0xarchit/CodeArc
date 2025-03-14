import React, { useState } from 'react';
import { Key } from 'lucide-react';

interface ApiKeyFormProps {
  onSubmit: (key: string) => void;
}

export function ApiKeyForm({ onSubmit }: ApiKeyFormProps) {
  const [inputKey, setInputKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(inputKey);
    setInputKey('');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm">
        <Key className="text-gray-400 w-5 h-5" />
        <input
          type="password"
          value={inputKey}
          onChange={(e) => setInputKey(e.target.value)}
          placeholder="Enter your API key"
          className="flex-1 outline-none bg-transparent"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 transition-colors"
        >
          Save
        </button>
      </div>
    </form>
  );
}