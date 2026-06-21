import React, { useState, useEffect } from 'react';
import { useFlowStore } from '../../store/flowStore';
import { useChatStore } from '../../store/chatStore';
import { ArrowLeft, Home, Compass, MessageCircleQuestion, GitBranch, MapPin, X } from 'lucide-react';

export default function BranchExplorer() {
  const { allDbNodes, currentNodeId, returnToParent, returnToRoot, navigateToNode } = useFlowStore();
  const { conversationId } = useChatStore();

  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const hintCount = parseInt(localStorage.getItem('branchExplorerHintCount') || '0', 10);
    const dismissed = localStorage.getItem('branchExplorerHintDismissed') === 'true';
    
    if (!dismissed && hintCount < 3) {
      setShowHint(true);
      localStorage.setItem('branchExplorerHintCount', (hintCount + 1).toString());
    }
  }, []);

  const dismissHint = () => {
    setShowHint(false);
    localStorage.setItem('branchExplorerHintDismissed', 'true');
  };

  const currentNode = allDbNodes.find(n => n.id === currentNodeId);

  if (!currentNode) {
    return (
      <div className="flex items-start justify-start p-6 text-[var(--text-tertiary)] gap-3">
        <Compass className="w-8 h-8 shrink-0 text-[var(--text-tertiary)]" />
        <p className="text-sm font-medium">Start chatting to activate the conversation map.</p>
      </div>
    );
  }

  const siblingBranches = allDbNodes.filter(n => n.parentId === currentNode.parentId && n.id !== currentNode.id);
  const subBranches = allDbNodes.filter(n => n.parentId === currentNode.id);

  // Helper for rendering a branch card
  const renderBranchCard = (branch, isActive = false) => {
    const isClarification = branch.nodeType === 'CLARIFICATION';
    const Icon = isClarification ? MessageCircleQuestion : GitBranch;
    
    return (
      <button
        key={branch.id}
        onClick={() => navigateToNode(conversationId, branch.id)}
        className={`w-full text-left p-3 rounded-xl border flex flex-col gap-1 transition-all duration-150 cursor-pointer ${
          isActive 
            ? 'bg-[var(--accent-subtle)] border-[var(--accent-primary)] border-l-[3px]' 
            : 'bg-[var(--bg-elevated)] border-[var(--border-light)] hover:border-[var(--accent-primary)] hover:bg-[var(--bg-secondary)]'
        }`}
      >
        <div className="flex items-start gap-2">
          <Icon className="w-4 h-4 text-[var(--text-tertiary)] shrink-0 mt-0.5" />
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-[var(--text-primary)] truncate">
              {branch.question}
            </span>
            <span className="text-xs text-[var(--text-tertiary)] mt-0.5 font-mono">
              Depth {branch.depth} · {isClarification ? 'Branch' : 'Path'}
            </span>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="flex flex-col p-5">
      
      {/* Contextual Hint Banner */}
      {showHint && (
        <div className="relative mb-5 p-3 rounded-xl bg-[var(--accent-subtle)] border border-[var(--accent-primary)]/20 text-[var(--accent-primary)] flex items-start gap-2 pr-8">
          <Compass className="w-4 h-4 mt-0.5 shrink-0" />
          <p className="text-xs font-medium leading-relaxed">
            This shows your conversation as a map — explore side questions without losing your place.
          </p>
          <button 
            onClick={dismissHint}
            className="absolute top-0.5 right-0.5 p-2.5 text-[var(--accent-primary)] opacity-70 hover:opacity-100 rounded-md hover:bg-black/10 transition-colors"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. Parent/Root Navigation Row */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => returnToParent(conversationId)}
          disabled={currentNode.depth === 0}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-3 text-[13px] font-medium rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--accent-subtle)] hover:text-[var(--accent-primary)] disabled:opacity-45 disabled:pointer-events-none transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Go to Parent</span>
        </button>
        <button
          onClick={() => returnToRoot(conversationId)}
          disabled={currentNode.depth === 0}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-3 text-[13px] font-medium rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--accent-subtle)] hover:text-[var(--accent-primary)] disabled:opacity-45 disabled:pointer-events-none transition-colors"
        >
          <Home className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
          <span>Back to Root</span>
        </button>
      </div>

      <div className="h-[1px] w-full bg-[var(--border-light)] mb-5" />

      {/* 2. Active Node Detail Card (Dark Neutral with glow) */}
      <div className="flex flex-col gap-3 p-4 rounded-2xl mb-5 border border-[var(--accent-primary)] shadow-[0_0_15px_rgba(var(--accent-primary-rgb),0.15)] relative overflow-hidden" style={{ backgroundColor: '#3A3936' }}>
        {/* Top visual indicator line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-[var(--accent-primary)] opacity-80" />
        
        {/* Top row */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[var(--accent-primary)]" />
            <span className="text-xs font-semibold text-[var(--accent-primary)] tracking-wide uppercase">
              You are here
            </span>
          </div>
          <span className="text-[11px] font-mono text-[#9C9A94] bg-black/20 px-2 py-0.5 rounded-md border border-white/10">
            Depth {currentNode.depth}
          </span>
        </div>
        
        {/* Middle: Text */}
        <div className="flex flex-col gap-1 mt-1">
          <h4 className="text-[15px] font-semibold text-[#F0EEE6]">
            {currentNode.question}
          </h4>
          {currentNode.answer && (
            <p 
              className="text-[13px] text-[#B8B6AE] leading-relaxed" 
              style={{ 
                display: '-webkit-box', 
                WebkitLineClamp: 2, 
                WebkitBoxOrient: 'vertical', 
                overflow: 'hidden' 
              }}
            >
              {currentNode.answer}
            </p>
          )}
        </div>
      </div>

      {/* 3. Connecting Lines to Sub-branches */}
      <div className="flex flex-col gap-3">
        {subBranches.length > 0 && (
          <h3 className="text-[13px] font-semibold text-[var(--text-secondary)] flex items-center gap-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--bg-elevated)] text-[11px] border border-[var(--border-medium)]">
              {subBranches.length}
            </span>
            {subBranches.length === 1 ? 'Follow-up' : 'Follow-ups'}
          </h3>
        )}
        
        {subBranches.length === 0 ? (
          <p className="text-[13px] text-[var(--text-tertiary)] italic p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-light)]">
            No follow-ups yet. New questions will appear here.
          </p>
        ) : (
          <div className="relative pl-6 flex flex-col gap-2 pb-2">
            {/* The main vertical trunk line */}
            <div className="absolute top-0 bottom-6 left-[11px] w-[2px] bg-[var(--border-medium)] rounded-full"></div>
            
            {subBranches.map((branch, index) => (
              <div key={branch.id} className="relative">
                {/* L-shaped connector per card */}
                <div className="absolute top-1/2 left-[-18px] w-4 h-[2px] bg-[var(--border-medium)] rounded-r-full -translate-y-1/2"></div>
                {/* Junction dot */}
                <div className="absolute top-1/2 left-[-20px] w-1.5 h-1.5 rounded-full bg-[var(--border-medium)] -translate-y-1/2"></div>
                
                {renderBranchCard(branch)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Sibling branches */}
      {currentNode.depth > 0 && siblingBranches.length > 0 && (
        <div className="flex flex-col gap-3 mt-5">
          <div className="h-[1px] w-full bg-[var(--border-light)] mb-2" />
          <h3 className="text-[13px] font-semibold text-[var(--text-secondary)] flex items-center gap-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--bg-elevated)] text-[11px] border border-[var(--border-medium)]">
              {siblingBranches.length}
            </span>
            {siblingBranches.length === 1 ? 'Alternative path' : 'Alternative paths'}
          </h3>
          <div className="flex flex-col gap-2">
            {siblingBranches.map(branch => renderBranchCard(branch, false))}
          </div>
        </div>
      )}
    </div>
  );
}
