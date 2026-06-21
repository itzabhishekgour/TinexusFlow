import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import ModelSelector from './ModelSelector';

export default function MessageInput({ onSend, disabled }) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  /* Auto-resize textarea to content height (max 140px) */
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [text]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() && !disabled) {
      onSend(text);
      setText('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const canSend = text.trim().length > 0 && !disabled;

  return (
    <div className="flex flex-col w-full">
      <div className="self-start">
        <ModelSelector />
      </div>
      <form onSubmit={handleSubmit} className="mi-form">
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message TinexusFlow…"
          disabled={disabled}
          className="mi-textarea"
          id="chat-message-input"
        />

        <button
          type="submit"
          disabled={!canSend}
          className={`mi-send ${canSend ? 'mi-send--active' : ''}`}
          title="Send message"
          id="chat-send-button"
        >
          <ArrowUp size={18} strokeWidth={2.5} />
        </button>
      </form>
    </div>
  );
}
