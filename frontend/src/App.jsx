import React, { useState, useEffect } from 'react';
import ChatWindow from './components/chat/ChatWindow';
import PathIndicator from './components/flow/PathIndicator';
import BranchExplorer from './components/flow/BranchExplorer';
import Sidebar from './components/layout/Sidebar';
import SettingsModal from './components/layout/SettingsModal';
import { useUiStore } from './store/uiStore';
import { PanelLeftClose, PanelLeftOpen, Menu, Sun, Moon, MessageSquare, GitBranch, Sidebar as SidebarIcon } from 'lucide-react';
import LogoSVG from './concept-7-t-n-fusion.svg';

export default function App() {
  const { isBranchPanelOpen, toggleBranchPanel, theme, toggleTheme, isSidebarCollapsed, toggleSidebar } = useUiStore();
  
  // Mobile layout state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState('chat'); // 'chat' or 'branch'

  // Ensure body matches theme on load just in case
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme || 'light');
  }, [theme]);

  // Keyboard shortcut for toggling sidebar (Ctrl+B / Cmd+B)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  return (
    <div className="fixed inset-0 h-[100dvh] flex flex-col lg:flex-row bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden font-sans">
      <SettingsModal />
      
      {/* Mobile Header (Only visible on <1024px) */}
      <header className="lg:hidden h-[56px] border-b border-[var(--border-light)] bg-[var(--bg-secondary)] px-4 flex items-center justify-between shrink-0 select-none z-20">
        <div className="flex items-center w-full">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="w-[20px] shrink-0 text-[var(--text-secondary)] transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-[8px] ml-[12px] flex-grow min-w-0">
            <img src={LogoSVG} alt="TinexusFlow Logo" className="w-[28px] h-[28px] rounded-md shrink-0" />
            <h1 className="text-base md:text-xl font-bold tracking-tight text-[var(--text-primary)] truncate" style={{ fontFamily: 'var(--font-serif)' }}>
              TinexusFlow
            </h1>
          </div>
          
          <button 
            onClick={toggleTheme}
            className="w-[20px] shrink-0 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors ml-auto"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Overlay Background */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar (Desktop Persistent, Mobile Drawer) */}
      <div className={`
        fixed lg:static top-0 bottom-0 left-0 z-40 bg-[var(--bg-primary)]
        transition-[width,transform] duration-200 ease-in-out overflow-hidden shrink-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isSidebarCollapsed ? 'lg:w-[64px] lg:border-r lg:border-[var(--border-light)]' : 'lg:w-[260px] lg:border-r lg:border-[var(--border-light)]'}
        w-[260px]
      `}>
        <div className="w-full h-full flex flex-col">
          <Sidebar onMobileClose={() => setIsSidebarOpen(false)} />
        </div>
      </div>

      {/* Main Content Area (Branch Panel + Chat) */}
      <main className="flex-1 flex min-w-0 min-h-0 relative">
        
        {/* Unified Branch Explorer Panel (Collapsible, Desktop Only) */}
        <div 
          className={`
            hidden lg:flex flex-col border-r border-[var(--border-light)] bg-[var(--bg-elevated)]
            transition-[width,opacity] duration-200 ease-in-out overflow-hidden
            ${isBranchPanelOpen ? 'w-[320px] opacity-100' : 'w-0 opacity-0 border-none'}
          `}
        >
          {/* Inner container fixed width to prevent squishing during animation */}
          <div className="w-[320px] h-full flex flex-col">
            {/* Panel Header */}
            <div className="h-[48px] px-4 border-b border-[var(--border-light)] flex justify-between items-center shrink-0">
              <span className="font-semibold text-sm text-[var(--text-secondary)]">Branch Explorer</span>
              <button 
                onClick={toggleBranchPanel}
                className="p-1 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
              >
                <PanelLeftClose className="w-5 h-5" />
              </button>
            </div>
            
            {/* Branch Navigation */}
            <div className="flex-1 overflow-y-auto">
              <BranchExplorer />
            </div>
          </div>
        </div>

        {/* Main Application Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 relative bg-[var(--bg-primary)]">
          
          {/* Chat Header Bar */}
          <header className="hidden lg:flex h-[48px] border-b border-[var(--border-light)] px-4 items-center justify-between shrink-0 bg-[var(--bg-primary)]">
            <div className="flex items-center gap-3 min-w-0">
              {isSidebarCollapsed && (
                <button 
                  onClick={toggleSidebar}
                  className="p-1.5 -ml-1.5 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors shrink-0"
                  title="Open Sidebar (Ctrl+B)"
                >
                  <SidebarIcon className="w-5 h-5" />
                </button>
              )}
              {!isBranchPanelOpen && (
                <button 
                  onClick={toggleBranchPanel}
                  className={`p-1.5 ${!isSidebarCollapsed ? '-ml-1.5' : ''} rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors shrink-0`}
                  title="Open Branch Explorer"
                >
                  <PanelLeftOpen className="w-5 h-5" />
                </button>
              )}
              {/* Breadcrumbs */}
              <div className="min-w-0 flex-1">
                <PathIndicator />
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button 
                onClick={toggleTheme}
                className="p-1.5 rounded-full text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
                title="Toggle Dark Mode"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </header>

          {/* Chat / Mobile Tree Toggle */}
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            {/* Mobile View Toggle */}
            <div className="lg:hidden flex-1 overflow-hidden flex flex-col min-h-0 relative">
              <div className={`w-full h-full flex-col min-h-0 ${activeMobileTab === 'chat' ? 'flex' : 'hidden'}`}>
                <ChatWindow />
              </div>
              <div className={`w-full h-full flex-col bg-[var(--bg-elevated)] min-h-0 ${activeMobileTab === 'tree' ? 'flex' : 'hidden'}`}>
                <div className="shrink-0 border-b border-[var(--border-light)]">
                  <PathIndicator />
                </div>
                <div className="flex-1 overflow-y-auto min-h-0">
                  <BranchExplorer />
                </div>
              </div>
            </div>

            {/* Desktop Centered Chat */}
            <div className="hidden lg:flex flex-1 overflow-hidden justify-center w-full min-h-0">
              <div className="w-full h-full flex flex-col min-h-0">
                <ChatWindow />
              </div>
            </div>
          </div>
          
          {/* Mobile Bottom Tabs */}
          <div className="lg:hidden bg-[var(--bg-elevated)] border-t border-[var(--border-light)] flex flex-row shrink-0 pb-[env(safe-area-inset-bottom)] z-20">
            <button 
              className={`flex-1 flex flex-col items-center justify-center h-[56px] gap-1 transition-colors duration-150 ease-in-out relative ${activeMobileTab === 'chat' ? 'text-[var(--accent-primary)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'}`}
              onClick={() => setActiveMobileTab('chat')}
            >
              {activeMobileTab === 'chat' && <div className="absolute top-1 w-1 h-1 rounded-full bg-[var(--accent-primary)]" />}
              <MessageSquare className="w-5 h-5 mt-1" />
              <span className="text-[10px] font-medium">Chat</span>
            </button>
            <button 
              className={`flex-1 flex flex-col items-center justify-center h-[56px] gap-1 transition-colors duration-150 ease-in-out relative ${activeMobileTab === 'tree' ? 'text-[var(--accent-primary)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'}`}
              onClick={() => setActiveMobileTab('tree')}
            >
              {activeMobileTab === 'tree' && <div className="absolute top-1 w-1 h-1 rounded-full bg-[var(--accent-primary)]" />}
              <GitBranch className="w-5 h-5 mt-1" />
              <span className="text-[10px] font-medium">Branches</span>
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
