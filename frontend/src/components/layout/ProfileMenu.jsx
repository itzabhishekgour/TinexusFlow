import React, { useState, useRef, useEffect } from 'react';
import { UserCircle, Settings, HelpCircle, LogOut, Sun, Moon, Monitor } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import { useChatStore } from '../../store/chatStore';

export default function ProfileMenu({ isCollapsed }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { theme, setTheme, setSettingsModalOpen } = useUiStore();
  const { selectedModel } = useChatStore();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Popover Menu (Opens UPWARDS) */}
      {isOpen && (
        <div className={`absolute bottom-full mb-2 bg-[var(--bg-elevated)] border border-[var(--border-medium)] rounded-xl shadow-xl overflow-hidden z-50 animate-in slide-in-from-bottom-2 fade-in duration-200 ${isCollapsed ? 'left-14 w-[240px]' : 'left-0 w-full'}`}>
          <div className="p-3 border-b border-[var(--border-light)]">
            <div className="font-semibold text-sm text-[var(--text-primary)] truncate">Tinu</div>
            <div className="text-xs text-[var(--text-tertiary)] truncate">developer@tinexus.com</div>
          </div>
          
          <div className="p-2">
            <div className="px-2 py-1.5 flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Theme</span>
              <div className="flex bg-[var(--bg-secondary)] rounded-md border border-[var(--border-light)] overflow-hidden">
                <button onClick={() => setTheme('light')} className={`p-2.5 hover:bg-[var(--bg-elevated)] transition-colors ${theme === 'light' ? 'text-[var(--accent-primary)] bg-[var(--bg-elevated)]' : 'text-[var(--text-tertiary)]'}`} title="Light Theme"><Sun size={14} /></button>
                <div className="w-px bg-[var(--border-light)]" />
                <button onClick={() => setTheme('dark')} className={`p-2.5 hover:bg-[var(--bg-elevated)] transition-colors ${theme === 'dark' ? 'text-[var(--accent-primary)] bg-[var(--bg-elevated)]' : 'text-[var(--text-tertiary)]'}`} title="Dark Theme"><Moon size={14} /></button>
                <div className="w-px bg-[var(--border-light)]" />
                <button onClick={() => setTheme('system')} className={`p-2.5 hover:bg-[var(--bg-elevated)] transition-colors ${theme === 'system' ? 'text-[var(--accent-primary)] bg-[var(--bg-elevated)]' : 'text-[var(--text-tertiary)]'}`} title="System Theme"><Monitor size={14} /></button>
              </div>
            </div>
          </div>

          <div className="border-t border-[var(--border-light)] p-1">
            <button 
              onClick={() => { setIsOpen(false); setSettingsModalOpen(true); }}
              className="w-full text-left px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-lg transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-2">
                <Settings size={16} className="text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors" />
                <span>Settings</span>
              </div>
            </button>
            
            <button className="w-full text-left px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-lg transition-colors flex items-center justify-between group">
              <div className="flex items-center gap-2">
                <HelpCircle size={16} className="text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors" />
                <span>Help & Feedback</span>
              </div>
            </button>
          </div>

          <div className="border-t border-[var(--border-light)] p-1">
            <button className="w-full text-left px-3 py-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2">
              <LogOut size={16} />
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}

      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-3 p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors group ${isCollapsed ? 'justify-center' : 'text-left'}`}
        title={isCollapsed ? "Tinu (Profile & Settings)" : undefined}
      >
        <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)] shrink-0 flex items-center justify-center text-white text-sm font-bold shadow-sm">
          TG
        </div>
        {!isCollapsed && (
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-medium truncate">Tinu</span>
            <span className="text-[10px] text-[var(--text-tertiary)] truncate">Free Plan</span>
          </div>
        )}
      </button>
    </div>
  );
}
