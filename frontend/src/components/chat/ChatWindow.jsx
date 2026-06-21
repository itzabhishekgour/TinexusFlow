import React, { useEffect, useRef } from 'react';
import { useChatStore } from '../../store/chatStore';
import { useFlowStore } from '../../store/flowStore';
import ChatBubble from './ChatBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import { Sparkles, AlertTriangle } from 'lucide-react';
import './chat.css';

export default function ChatWindow() {
  const {
    messages,
    isLoading,
    isAmbiguous,
    ambiguityQuestion,
    ambiguityOptions,
    sendMessage,
    selectAmbiguityOption,
  } = useChatStore();

  const flowActions = useFlowStore();
  const chatEndRef = useRef(null);

  /* Auto-scroll on new messages / loading / ambiguity changes */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isAmbiguous]);

  const handleSendMessage = (text) => {
    sendMessage(text, flowActions);
  };

  const handleSelectAmbiguity = (optionText, index) => {
    selectAmbiguityOption(optionText, index, flowActions);
  };

  return (
    <div className="cw-container">
      {/* ── Messages scroll area ────────────────────── */}
      <div className="cw-messages">
        <div className="cw-messages-inner">
          {messages.length === 0 ? (
            /* Empty state */
            <div className="cw-empty">
              <div className="cw-empty-icon">
                <Sparkles size={28} />
              </div>
              <h3 className="cw-empty-title">Start a conversation</h3>
              <p className="cw-empty-desc">
                Type your question below. TinexusFlow will create a root node
                and begin building branches.
              </p>
            </div>
          ) : (
            <div className="cw-feed">
              {messages.map((msg, index) => (
                <ChatBubble key={msg.id} message={msg} isLast={index === messages.length - 1} />
              ))}
            </div>
          )}

          {/* ── Ambiguity prompt ───────────────────── */}
          {isAmbiguous && (
            <div className="cw-ambiguity">
              <div className="cw-ambiguity-header">
                <AlertTriangle size={15} />
                <div>
                  <span className="cw-ambiguity-label">Clarification needed</span>
                  <p className="cw-ambiguity-question">{ambiguityQuestion}</p>
                </div>
              </div>
              <div className="cw-ambiguity-options">
                {ambiguityOptions.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectAmbiguity(option, idx)}
                    className="cw-ambiguity-btn"
                  >
                    <span className="cw-ambiguity-num">{idx + 1}</span>
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isLoading && <TypingIndicator />}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* ── Input bar (sticky bottom) ───────────────── */}
      <div className="cw-input-area">
        <MessageInput onSend={handleSendMessage} disabled={isLoading || isAmbiguous} />
      </div>
    </div>
  );
}
