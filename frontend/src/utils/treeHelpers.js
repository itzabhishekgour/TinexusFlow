/**
 * Spatially layouts a tree of nodes for React Flow.
 * Assigns x and y coordinates to nodes based on their parent-child relationships and depths.
 */
export const layoutTree = (nodes, activePathIds = []) => {
  if (!nodes || nodes.length === 0) return { flowNodes: [], flowEdges: [] };

  // Find the root node (node with parentId null or the lowest depth)
  const root = nodes.find(n => !n.parentId) || nodes[0];
  
  // Build parent-child lookup map
  const childrenMap = {};
  nodes.forEach(node => {
    if (node.parentId) {
      if (!childrenMap[node.parentId]) {
        childrenMap[node.parentId] = [];
      }
      childrenMap[node.parentId].push(node);
    }
  });

  const levelHeights = 150; // Vertical distance between levels
  const siblingWidths = 280; // Horizontal distance between sibling sub-branches

  const positions = {};
  const subtreeWidths = {};

  // Step 1: Calculate the width of each subtree recursively
  const calculateSubtreeWidth = (nodeId) => {
    const children = childrenMap[nodeId] || [];
    if (children.length === 0) {
      subtreeWidths[nodeId] = siblingWidths;
      return siblingWidths;
    }
    
    let totalWidth = 0;
    children.forEach(child => {
      totalWidth += calculateSubtreeWidth(child.id);
    });
    
    subtreeWidths[nodeId] = totalWidth;
    return totalWidth;
  };

  calculateSubtreeWidth(root.id);

  // Step 2: Assign coordinates recursively
  const assignCoordinates = (node, x, y) => {
    positions[node.id] = { x, y };

    const children = childrenMap[node.id] || [];
    if (children.length === 0) return;

    // Center children under parent
    let currentX = x - subtreeWidths[node.id] / 2;
    
    children.forEach(child => {
      const childWidth = subtreeWidths[child.id];
      const childX = currentX + childWidth / 2;
      assignCoordinates(child, childX, y + levelHeights);
      currentX += childWidth;
    });
  };

  // Start laying out from the center (e.g. x = 400, y = 50)
  assignCoordinates(root, 400, 50);

  // Step 3: Map backend nodes to React Flow node format
  const flowNodes = nodes.map(node => {
    const isNodeInActivePath = activePathIds.includes(node.id);
    const pos = positions[node.id] || { x: 400, y: 50 };

    return {
      id: String(node.id),
      type: 'branchNode', // Custom node type registered in FlowViewer
      position: pos,
      data: {
        label: node.question,
        question: node.question,
        answer: node.answer,
        nodeType: node.nodeType,
        isActive: isNodeInActivePath,
        depth: node.depth,
        id: node.id,
        quickReplies: node.quickReplies
      }
    };
  });

  // Step 4: Construct edges
  const flowEdges = [];
  nodes.forEach(node => {
    if (node.parentId) {
      const isActiveEdge = activePathIds.includes(node.id) && activePathIds.includes(node.parentId);
      
      flowEdges.push({
        id: `e-${node.parentId}-${node.id}`,
        source: String(node.parentId),
        target: String(node.id),
        animated: isActiveEdge,
        className: isActiveEdge ? 'active' : '',
        style: {
          stroke: isActiveEdge ? '#c084fc' : '#334155',
          strokeWidth: isActiveEdge ? 3.5 : 1.5
        }
      });
    }
  });

  return { flowNodes, flowEdges };
};
