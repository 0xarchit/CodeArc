import React from 'react';
import { Sparkles } from 'lucide-react';

export function PromoHeader() {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Sparkles className="w-6 h-6" />
      <h2 className="text-xl font-bold">Try Our AI Chat Assistant</h2>
    </div>
  );
}