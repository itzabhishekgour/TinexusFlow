import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Plus, MessageSquare, Search, GitBranch, MoreHorizontal, PanelLeftClose, Trash2, Edit2 } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import { useFlowStore } from '../../store/flowStore';
import { useUiStore } from '../../store/uiStore';
import LogoSVG from '../../concept-7-t-n-fusion.svg';
import ProfileMenu from './ProfileMenu';
import DeleteConfirmationModal from './DeleteConfirmationModal';

export default function Sidebar({ onMobileClose }) {
  const { conversationId, clearChat, conversations, fetchConversations, deleteConversation, renameConversation } = useChatStore();
  const { fetchTree } = useFlowStore();
  const { toggleSidebar, isSidebarCollapsed } = useUiStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [conversationToDelete, setConversationToDelete] = useState(null);
  const [editingConversationId, setEditingConversationId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  React.useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleNewChat = () => {
    clearChat();
    useFlowStore.setState({
      nodes: [],
      edges: [],
      activePathIds: [],
      currentNodeId: null,
      allDbNodes: []
    });
    if (window.innerWidth < 1024 && onMobileClose) {
      onMobileClose();
    }
  };

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const lowerQuery = searchQuery.toLowerCase();
    return conversations.filter(c => c.title?.toLowerCase().includes(lowerQuery));
  }, [conversations, searchQuery]);

  const groupedConversations = useMemo(() => {
    const groups = {
      today: [],
      yesterday: [],
      previous7Days: [],
      older: []
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    filteredConversations.forEach(conv => {
      if (!conv.createdAt) return;
      const convDate = new Date(conv.createdAt);
      if (convDate >= today) {
        groups.today.push(conv);
      } else if (convDate >= yesterday) {
        groups.yesterday.push(conv);
      } else if (convDate >= sevenDaysAgo) {
        groups.previous7Days.push(conv);
      } else {
        groups.older.push(conv);
      }
    });

    return groups;
  }, [filteredConversations]);

  const handleSaveRename = async (id, originalTitle) => {
    const newTitle = editTitle.trim();
    if (newTitle && newTitle !== originalTitle) {
      await renameConversation(id, newTitle);
    }
    setEditingConversationId(null);
    setEditTitle('');
  };

  const renderGroup = (label, items) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-4">
        <h3 className="px-2 text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5 mt-2">
          {label}
        </h3>
        <div className="flex flex-col gap-[2px]">
          {items.map((conv) => {
            const isActive = conv.id === conversationId;
            return (
              <button 
                key={conv.id}
                onClick={() => {
                  useChatStore.getState().setConversationId(conv.id);
                  fetchTree(conv.id);
                  if (window.innerWidth < 1024 && onMobileClose) {
                    onMobileClose();
                  }
                }}
                className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-left group transition-colors relative
                  ${isActive 
                    ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)]' 
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
                  }
                `}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-[var(--accent-primary)] rounded-r-full" />
                )}
                <MessageSquare className={`w-[14px] h-[14px] shrink-0 ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]'}`} />
                
                {editingConversationId === conv.id ? (
                  <input
                    type="text"
                    value={editTitle}
                    autoFocus
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSaveRename(conv.id, conv.title);
                      } else if (e.key === 'Escape') {
                        setEditingConversationId(null);
                        setEditTitle('');
                      }
                    }}
                    onBlur={() => handleSaveRename(conv.id, conv.title)}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 bg-transparent text-[13px] font-medium leading-tight outline-none border-b border-[var(--accent-primary)] text-[var(--text-primary)]"
                  />
                ) : (
                  <span className="text-[13px] font-medium truncate flex-1 leading-tight">
                    {conv.title}
                  </span>
                )}

                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {conv.branchCount > 1 && (
                    <div className="flex items-center gap-0.5 text-[var(--text-tertiary)]" title={`${conv.branchCount} branches`}>
                      <GitBranch className="w-3 h-3" />
                      <span className="text-[10px] font-medium">{conv.branchCount}</span>
                    </div>
                  )}
                  <div className="relative">
                    <div 
                      className={`p-1 rounded-md transition-colors ${openDropdownId === conv.id ? 'bg-[var(--bg-primary)] text-[var(--text-primary)]' : 'text-[var(--text-tertiary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)]'}`}
                      title="Options"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdownId(openDropdownId === conv.id ? null : conv.id);
                      }}
                    >
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </div>
                    
                    {/* Dropdown Menu */}
                    {openDropdownId === conv.id && (
                      <div 
                        ref={dropdownRef}
                        className="absolute right-0 top-full mt-1 w-32 bg-[var(--bg-elevated)] border border-[var(--border-medium)] rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="py-1">
                          <button
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors"
                            onClick={() => {
                              setOpenDropdownId(null);
                              setEditTitle(conv.title);
                              setEditingConversationId(conv.id);
                            }}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Rename</span>
                          </button>
                          <button
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors"
                            onClick={() => {
                              setOpenDropdownId(null);
                              setConversationToDelete(conv.id);
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Fallback for when not hovering to still show branch count */}
                {conv.branchCount > 1 && (
                  <div className="group-hover:hidden flex items-center gap-0.5 text-[var(--text-tertiary)]" title={`${conv.branchCount} branches`}>
                    <GitBranch className="w-3 h-3" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <aside className="w-full h-full bg-[var(--bg-primary)] flex flex-col shrink-0">
      
      {/* Sidebar Header */}
      <div className={`p-3 flex flex-col gap-4 shrink-0 ${isSidebarCollapsed ? 'items-center' : ''}`}>
        <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} px-1 py-1`}>
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-2">
              <img src={LogoSVG} alt="TinexusFlow Logo" className="w-6 h-6 rounded-md cursor-pointer" onClick={toggleSidebar} title="Collapse Sidebar" />
              <h1 className="text-lg font-bold tracking-tight text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-serif)' }}>
                TinexusFlow
              </h1>
            </div>
          )}
          {isSidebarCollapsed && (
            <img src={LogoSVG} alt="TinexusFlow Logo" className="w-8 h-8 rounded-md cursor-pointer hover:opacity-80 transition-opacity" onClick={toggleSidebar} title="Expand Sidebar" />
          )}
          
          {!isSidebarCollapsed && (
            <button 
              onClick={toggleSidebar}
              className="p-1 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors hidden lg:block"
              title="Close Sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {isSidebarCollapsed ? (
          <button
            onClick={handleNewChat}
            className="w-10 h-10 flex items-center justify-center bg-[var(--bg-elevated)] border border-[var(--border-medium)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-full transition-colors shadow-sm"
            title="New Conversation"
          >
            <Plus className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 bg-[var(--bg-elevated)] border border-[var(--border-medium)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] py-1.5 px-3 rounded-lg font-medium transition-colors shadow-sm text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Conversation</span>
          </button>
        )}

        {/* Search */}
        {!isSidebarCollapsed && (
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-tertiary)]" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--bg-elevated)] border border-transparent focus:border-[var(--border-medium)] focus:bg-[var(--bg-secondary)] rounded-lg pl-8 pr-3 py-1.5 text-[13px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] transition-colors focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Conversation List */}
      {!isSidebarCollapsed && (
        <div className="flex-1 overflow-y-auto px-2 pb-4 custom-scrollbar">
          {filteredConversations.length === 0 ? (
            <div className="text-center px-4 py-8 text-sm text-[var(--text-tertiary)]">
              {searchQuery ? 'No results found.' : 'No conversations yet.'}
            </div>
          ) : (
            <>
              {renderGroup('Today', groupedConversations.today)}
              {renderGroup('Yesterday', groupedConversations.yesterday)}
              {renderGroup('Previous 7 Days', groupedConversations.previous7Days)}
              {renderGroup('Older', groupedConversations.older)}
            </>
          )}
        </div>
      )}
      {isSidebarCollapsed && (
        <div className="flex-1" />
      )}

      {/* User Profile Footer */}
      <div className={`p-2 border-t border-[var(--border-light)] shrink-0 bg-[var(--bg-secondary)] ${isSidebarCollapsed ? 'flex justify-center' : ''}`}>
        <ProfileMenu isCollapsed={isSidebarCollapsed} />
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal 
        isOpen={conversationToDelete !== null}
        onClose={() => setConversationToDelete(null)}
        onConfirm={async () => {
          if (conversationToDelete) {
            await deleteConversation(conversationToDelete);
            setConversationToDelete(null);
          }
        }}
      />
    </aside>
  );
}
