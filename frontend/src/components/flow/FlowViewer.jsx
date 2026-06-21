import React, { useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useFlowStore } from '../../store/flowStore';
import { useChatStore } from '../../store/chatStore';
import BranchNode from './BranchNode';
import { HelpCircle } from 'lucide-react';

export default function FlowViewer() {
  const conversationId = useChatStore((state) => state.conversationId);
  const { nodes: storeNodes, edges: storeEdges, fetchTree } = useFlowStore();

  const nodeTypes = useMemo(() => ({
    branchNode: BranchNode
  }), []);

  // Update tree on initial load or conversationId change
  useEffect(() => {
    if (conversationId) {
      fetchTree(conversationId);
    }
  }, [conversationId, fetchTree]);

  return (
    <div className="w-full h-full relative" style={{
      /* subtle dot pattern for empty/canvas feel */
      backgroundImage: 'radial-gradient(var(--border-light) 1px, transparent 1px)',
      backgroundSize: '20px 20px'
    }}>
      {!conversationId ? (
        <div className="flex items-start justify-start p-4 text-[var(--text-tertiary)] gap-3 mt-4 ml-4">
          <HelpCircle className="w-6 h-6 shrink-0" />
          <p className="text-sm">Tree map will visualize here once you start chatting.</p>
        </div>
      ) : (
        <ReactFlow
          nodes={storeNodes}
          edges={storeEdges}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.5}
          maxZoom={1.5}
          nodesConnectable={false}
          nodesDraggable={true}
        >
          {/* We handle our own grid background via CSS above, or we can use ReactFlow background */}
          {/* <Background color="var(--border-medium)" gap={20} size={1} opacity={0.5} /> */}
          <Controls position="bottom-right" />
          <MiniMap 
            nodeColor={(node) => {
              if (node.data?.isActive) return 'var(--accent-primary)';
              if (node.data?.nodeType === 'ROOT') return 'var(--accent-hover)';
              return 'var(--border-medium)';
            }} 
            zoomable 
            pannable 
          />
        </ReactFlow>
      )}
    </div>
  );
}
