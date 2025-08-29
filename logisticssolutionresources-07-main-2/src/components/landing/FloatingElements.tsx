import React from 'react';
import { MessageCircle } from 'lucide-react';

const FloatingElements = () => {
  return (
    <>
      {/* Floating social-proof pill */}
      <div className="fixed left-4 bottom-4 z-50">
        <div className="flex items-stretch rounded-xl border border-primary bg-card overflow-hidden shadow-lg">
          <div className="bg-primary text-primary-foreground px-4 py-3 font-bold tracking-widest">
            48
          </div>
          <div className="px-4 py-3 text-sm text-muted-foreground">
            Companies trialing Transentrix in the last 24 hours!
          </div>
        </div>
      </div>

      {/* Chat button */}
      <button
        className="fixed right-4 bottom-4 z-50 w-14 h-14 rounded-full bg-card border border-border shadow-lg hover:shadow-xl transition-shadow grid place-items-center"
        aria-label="Chat"
      >
        <MessageCircle className="w-6 h-6 text-primary" />
      </button>
    </>
  );
};

export default FloatingElements;