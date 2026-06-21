import React from 'react';
import { useFlowStore } from '../../store/flowStore';
import { useChatStore } from '../../store/chatStore';
import { ChevronRight, GitFork } from 'lucide-react';

export default function PathIndicator() {
  const { activePathIds, allDbNodes, navigateToNode } = useFlowStore();
  const { conversationId } = useChatStore();

  // Find the nodes in the active path, sorted by depth
  const pathNodes = allDbNodes
    .filter((node) => activePathIds.includes(node.id))
    .sort((a, b) => a.depth - b.depth);

  if (pathNodes.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap p-1 no-scrollbar">
      <div className="flex items-center gap-1.5 text-[var(--text-tertiary)] font-semibold text-xs shrink-0 select-none uppercase tracking-wider">
        <GitFork className="w-3.5 h-3.5" />
      </div>

      <div className="flex items-center gap-1">
        {pathNodes.map((node, index) => {
          const isLast = index === pathNodes.length - 1;
          
          return (
            <React.Fragment key={node.id}>
              {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-[var(--text-tertiary)] shrink-0" />}
              
              <button
                onClick={() => navigateToNode(conversationId, node.id)}
                disabled={isLast}
                className={`text-xs px-2 py-1 rounded-md transition-colors font-medium ${
                  isLast
                    ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-light)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] cursor-pointer'
                }`}
                title={isLast ? 'Active current node' : `Click to jump back to: "${node.question}"`}
              >
                {node.question.length > 25 
                  ? node.question.substring(0, 22) + '...' 
                  : node.question}
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
