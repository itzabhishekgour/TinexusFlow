import React from 'react';
import { Bot } from 'lucide-react';

export default function TypingIndicator() {
  return (
    <div className="cb-row cb-row--ai">
      {/* Avatar */}
      <div className="cb-avatar cb-avatar--ai">
        <Bot size={16} />
      </div>

      {/* Content */}
      <div className="cb-content cb-content--ai">
        <div className="cb-meta">
          <span className="cb-sender">TinexusFlow</span>
        </div>
        <div className="ti-bubble">
          <div className="ti-dots">
            <span className="ti-dot" style={{ animationDelay: '0ms' }} />
            <span className="ti-dot" style={{ animationDelay: '160ms' }} />
            <span className="ti-dot" style={{ animationDelay: '320ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
