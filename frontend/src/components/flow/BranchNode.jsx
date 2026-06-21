import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { useFlowStore } from '../../store/flowStore';
import { useChatStore } from '../../store/chatStore';
import { HelpCircle, ChevronRight, MessageSquare, ShieldAlert } from 'lucide-react';

export default function BranchNode({ data }) {
  const navigateToNode = useFlowStore((state) => state.navigateToNode);
  const conversationId = useChatStore((state) => state.conversationId);

  const { id, question, answer, nodeType, isActive, depth } = data;

  const handleDoubleClick = () => {
    if (conversationId && id) {
      navigateToNode(conversationId, id);
    }
  };

  // Border and badge styles based on Node Type and Active status
  let typeLabel = nodeType;
  let typeColor = 'bg-slate-700 text-slate-300';
  let cardBorder = 'border-slate-800';
  let icon = <MessageSquare className="w-4 h-4 text-violet-400" />;

  if (nodeType === 'ROOT') {
    typeColor = 'bg-purple-950 text-purple-300 border border-purple-800/40';
    icon = <ChevronRight className="w-4 h-4 text-purple-400" />;
  } else if (nodeType === 'CLARIFICATION') {
    typeColor = 'bg-cyan-950 text-cyan-300 border border-cyan-800/40';
    icon = <HelpCircle className="w-4 h-4 text-cyan-400" />;
  } else if (nodeType === 'CONTINUATION') {
    typeColor = 'bg-emerald-950 text-emerald-300 border border-emerald-800/40';
    icon = <MessageSquare className="w-4 h-4 text-emerald-400" />;
  }

  // Active glowing borders
  const activeGlowClass = isActive 
    ? 'border-purple-500 active-node-glow bg-slate-900/90' 
    : 'border-slate-800/80 bg-slate-950/80';

  return (
    <div 
      onDoubleClick={handleDoubleClick}
      className={`p-4 rounded-xl border-2 w-72 glass-panel shadow-2xl transition-all cursor-pointer select-none ${activeGlowClass}`}
      title="Double click to navigate to this point of the conversation"
    >
      {/* Node handles for tree connections */}
      {depth > 0 && (
        <Handle
          type="target"
          position={Position.Top}
          style={{ background: isActive ? '#a855f7' : '#475569', width: 8, height: 8 }}
        />
      )}
      
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${typeColor}`}>
            {typeLabel}
          </span>
          <span className="text-[10px] text-slate-500 font-semibold">
            Depth {depth}
          </span>
        </div>

        <div className="flex items-start gap-2">
          <div className="mt-0.5">{icon}</div>
          <p className="text-xs font-semibold text-slate-100 line-clamp-2 leading-relaxed">
            {question}
          </p>
        </div>

        {answer && (
          <div className="border-t border-slate-800/60 pt-2 mt-1">
            <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed">
              {answer}
            </p>
          </div>
        )}

        {isActive && (
          <div className="text-[9px] text-purple-400 font-bold flex items-center justify-end gap-1 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping"></span>
            ACTIVE CONTEXT
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: isActive ? '#a855f7' : '#475569', width: 8, height: 8 }}
      />
    </div>
  );
}
