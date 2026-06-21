import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Bot, User, Copy, Check, GitBranch, CircleDot, ArrowRight, RefreshCw, Pencil } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import { useFlowStore } from '../../store/flowStore';

/* ── Badge config per nodeType ─────────────────────────── */
const NODE_BADGES = {
  ROOT: {
    icon: CircleDot,
    label: 'Root',
  },
  CLARIFICATION: {
    icon: GitBranch,
    label: 'Branch',
  },
  CONTINUATION: {
    icon: ArrowRight,
    label: 'Continue',
  },
};

/* ── Code-block copy button ─────────────────────────────── */
function CopyButton({ code }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="copy-code-btn"
      title="Copy code"
      aria-label="Copy code"
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      <span>{copied ? 'Copied' : 'Copy'}</span>
    </button>
  );
}

/* ── Markdown renderers ─────────────────────────────────── */
const markdownComponents = {
  code({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '');
    const codeStr = String(children).replace(/\n$/, '');

    if (!inline && match) {
      return (
        <div className="chat-code-block">
          <div className="chat-code-header">
            <span>{match[1]}</span>
            <CopyButton code={codeStr} />
          </div>
          <SyntaxHighlighter
            style={oneDark}
            language={match[1]}
            PreTag="div"
            customStyle={{
              margin: 0,
              borderRadius: '0 0 8px 8px',
              fontSize: '13px',
              lineHeight: '1.6',
              padding: '16px',
              background: '#2D2C2A',
            }}
            {...props}
          >
            {codeStr}
          </SyntaxHighlighter>
        </div>
      );
    }

    if (!inline && !match) {
      return (
        <div className="chat-code-block">
          <div className="chat-code-header">
            <span>code</span>
            <CopyButton code={codeStr} />
          </div>
          <SyntaxHighlighter
            style={oneDark}
            language="text"
            PreTag="div"
            customStyle={{
              margin: 0,
              borderRadius: '0 0 8px 8px',
              fontSize: '13px',
              lineHeight: '1.6',
              padding: '16px',
              background: '#2D2C2A',
            }}
            {...props}
          >
            {codeStr}
          </SyntaxHighlighter>
        </div>
      );
    }

    return (
      <code className="chat-inline-code" {...props}>
        {children}
      </code>
    );
  },

  p({ children }) {
    return <p className="chat-md-p">{children}</p>;
  },
  ul({ children }) {
    return <ul className="chat-md-ul">{children}</ul>;
  },
  ol({ children }) {
    return <ol className="chat-md-ol">{children}</ol>;
  },
  li({ children }) {
    return <li className="chat-md-li">{children}</li>;
  },
  blockquote({ children }) {
    return <blockquote className="chat-md-blockquote">{children}</blockquote>;
  },
  h1({ children }) {
    return <h1 className="chat-md-h">{children}</h1>;
  },
  h2({ children }) {
    return <h2 className="chat-md-h">{children}</h2>;
  },
  h3({ children }) {
    return <h3 className="chat-md-h chat-md-h3">{children}</h3>;
  },
  a({ href, children }) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="chat-md-link">
        {children}
      </a>
    );
  },
  table({ children }) {
    return (
      <div className="chat-md-table-wrap">
        <table className="chat-md-table">{children}</table>
      </div>
    );
  },
  th({ children }) {
    return <th className="chat-md-th">{children}</th>;
  },
  td({ children }) {
    return <td className="chat-md-td">{children}</td>;
  },
};

/* ── Main Component ─────────────────────────────────────── */
export default function ChatBubble({ message, isLast }) {
  const { sender, text, timestamp, nodeType, quickReplies } = message;
  const isUser = sender === 'user';
  const isSystem = sender === 'system';
  
  const [copiedMessage, setCopiedMessage] = useState(false);
  
  const handleCopyMessage = async () => {
    await navigator.clipboard.writeText(text);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 1500);
  };
  
  const { sendMessage } = useChatStore();
  const flowActions = useFlowStore();

  /* System message — centred pill */
  if (isSystem) {
    return (
      <div className="cb-system-wrap">
        <div className="cb-system-pill">
          <div className="cb-system-dot" />
          {text}
        </div>
      </div>
    );
  }

  const badge = !isUser && nodeType ? NODE_BADGES[nodeType] : null;
  const BadgeIcon = badge?.icon;
  const isBranchMessage = !isUser && (nodeType === 'CLARIFICATION' || nodeType === 'CONTINUATION');
  
  const handleQuickReplyClick = (replyText) => {
    if (isLast) {
      sendMessage(replyText, flowActions);
    }
  };

  const handleSomethingElseClick = () => {
    const input = document.getElementById('chat-message-input');
    if (input) {
      input.focus();
    }
  };

  return (
    <div className={`group cb-row ${isUser ? 'cb-row--user' : 'cb-row--ai'}`}>
      {/* Avatar */}
      <div className={`cb-avatar ${isUser ? 'cb-avatar--user' : 'cb-avatar--ai'}`}>
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      {/* Content column */}
      <div className={`cb-content ${isUser ? 'cb-content--user' : 'cb-content--ai'}`}>
        {/* Meta row: sender + time + badge */}
        <div className="cb-meta">
          <span className="cb-sender">{isUser ? 'You' : 'TinexusFlow'}</span>
          {badge && (
            <span className="cb-badge">
              <BadgeIcon size={12} />
              {badge.label}
            </span>
          )}
        </div>

        {/* Bubble */}
        <div className={`cb-bubble ${isUser ? 'cb-bubble--user' : 'cb-bubble--ai'} ${isBranchMessage ? 'cb-in-branch' : ''}`}>
          {isUser ? (
            <p className="cb-text-user">{text}</p>
          ) : (
            <div className="cb-markdown flex flex-col gap-3">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
              >
                {text}
              </ReactMarkdown>
              
              {/* Quick Replies */}
              {quickReplies && quickReplies.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-[var(--border-light)]">
                  {quickReplies.map((reply, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickReplyClick(reply)}
                      disabled={!isLast}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors
                        ${isLast 
                          ? 'bg-[var(--bg-elevated)] border-[var(--border-medium)] text-[var(--text-primary)] hover:border-[var(--accent-primary)] hover:bg-[var(--accent-subtle)] cursor-pointer' 
                          : 'bg-transparent border-[var(--border-light)] text-[var(--text-tertiary)] cursor-not-allowed opacity-60'
                        }`}
                    >
                      {reply}
                    </button>
                  ))}
                  
                  {isLast && (
                    <button
                      onClick={handleSomethingElseClick}
                      className="px-4 py-2 rounded-full text-sm font-medium border border-dashed border-[var(--border-medium)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:border-[var(--text-secondary)] transition-colors"
                    >
                      Something else...
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons Row */}
        <div className={`flex gap-1 mt-1 transition-opacity duration-200 opacity-100 md:opacity-0 md:group-hover:opacity-100 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <button 
            onClick={handleCopyMessage}
            className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] rounded-md transition-colors flex items-center justify-center"
            title="Copy message"
          >
            {copiedMessage ? <Check size={16} /> : <Copy size={16} />}
          </button>
          
          {isUser ? (
            <div className="relative group/tooltip flex items-center">
              <button 
                disabled
                className="p-1.5 text-[var(--text-tertiary)] opacity-50 cursor-not-allowed rounded-md flex items-center justify-center"
              >
                <Pencil size={16} />
              </button>
              <span className="absolute -top-8 right-0 bg-[var(--bg-elevated)] text-[var(--text-primary)] text-xs px-2 py-1 rounded border border-[var(--border-light)] opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-sm">
                Coming soon
              </span>
            </div>
          ) : (
            <div className="relative group/tooltip flex items-center">
              <button 
                disabled
                className="p-1.5 text-[var(--text-tertiary)] opacity-50 cursor-not-allowed rounded-md flex items-center justify-center"
              >
                <RefreshCw size={16} />
              </button>
              <span className="absolute -top-8 left-0 bg-[var(--bg-elevated)] text-[var(--text-primary)] text-xs px-2 py-1 rounded border border-[var(--border-light)] opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-sm">
                Coming soon
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
