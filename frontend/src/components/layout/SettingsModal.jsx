import React, { useState, useEffect } from 'react';
import { X, User, Sliders, Shield, Info, Moon, Sun, Monitor, Download, Trash2 } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import { useChatStore } from '../../store/chatStore';
import { API_BASE_URL } from '../../config';
import packageJson from '../../../package.json';

export default function SettingsModal() {
  const { isSettingsModalOpen, setSettingsModalOpen, theme, setTheme, defaultBranchBehavior, setDefaultBranchBehavior } = useUiStore();
  const { selectedModel, setSelectedModel } = useChatStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [models, setModels] = useState([]);

  useEffect(() => {
    if (isSettingsModalOpen) {
      fetch(`${API_BASE_URL}/api/models`)
        .then(res => res.json())
        .then(data => setModels(data))
        .catch(err => console.error(err));
    }
  }, [isSettingsModalOpen]);

  if (!isSettingsModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-[var(--bg-primary)] w-full max-w-[700px] rounded-2xl shadow-xl border border-[var(--border-medium)] flex flex-col md:flex-row overflow-hidden h-[85vh] md:h-[550px]">
        
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-[var(--border-light)] bg-[var(--bg-secondary)]">
          <h2 className="text-lg font-bold">Settings</h2>
          <button onClick={() => setSettingsModalOpen(false)} className="p-1 rounded hover:bg-[var(--bg-elevated)]">
            <X size={20} />
          </button>
        </div>

        {/* Sidebar Tabs */}
        <div className="relative w-full md:w-[220px] bg-[var(--bg-secondary)] border-b md:border-b-0 md:border-r border-[var(--border-light)] shrink-0">
          <div className="w-full flex flex-row md:flex-col overflow-x-auto hide-scrollbar p-2 md:p-4 gap-1 relative z-10">
            <TabButton id="profile" icon={<User size={18} />} label="Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
            <TabButton id="preferences" icon={<Sliders size={18} />} label="Preferences" active={activeTab === 'preferences'} onClick={() => setActiveTab('preferences')} />
            <TabButton id="data" icon={<Shield size={18} />} label="Data & Privacy" active={activeTab === 'data'} onClick={() => setActiveTab('data')} />
            <TabButton id="about" icon={<Info size={18} />} label="About" active={activeTab === 'about'} onClick={() => setActiveTab('about')} />
          </div>
          {/* Scroll Affordance Fade (Mobile only) */}
          <div className="md:hidden absolute top-0 right-0 bottom-0 w-12 bg-gradient-to-l from-[var(--bg-secondary)] to-transparent pointer-events-none z-20" />
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-[var(--bg-primary)] relative">
          
          {/* Desktop Close Button */}
          <button onClick={() => setSettingsModalOpen(false)} className="hidden md:flex absolute top-4 right-4 p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-full transition-colors">
            <X size={20} />
          </button>

          <div className="p-6 md:p-8 flex-1">
            {activeTab === 'profile' && (
              <div className="flex flex-col gap-8 max-w-md">
                <div>
                  <h2 className="text-xl font-bold mb-6">Profile</h2>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-white text-2xl font-bold">
                      TG
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-[var(--text-primary)]">Tinu</span>
                      <span className="text-sm text-[var(--text-tertiary)]">developer@tinexus.com</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">Display Name</label>
                    <input type="text" defaultValue="Tinu" className="w-full bg-[var(--bg-elevated)] border border-[var(--border-medium)] rounded-lg px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">Email Address</label>
                    <input type="email" defaultValue="developer@tinexus.com" disabled className="w-full bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-lg px-3 py-2 text-[var(--text-tertiary)] cursor-not-allowed opacity-70" />
                    <span className="text-xs text-[var(--text-tertiary)]">Email is managed by your identity provider.</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="flex flex-col gap-8 max-w-md">
                <h2 className="text-xl font-bold">Preferences</h2>
                
                {/* Theme */}
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-semibold text-[var(--text-primary)]">Theme</label>
                  <div className="flex bg-[var(--bg-elevated)] rounded-lg p-1 border border-[var(--border-light)]">
                    <ThemeButton icon={<Sun size={16} />} label="Light" active={theme === 'light'} onClick={() => setTheme('light')} />
                    <ThemeButton icon={<Moon size={16} />} label="Dark" active={theme === 'dark'} onClick={() => setTheme('dark')} />
                    <ThemeButton icon={<Monitor size={16} />} label="System" active={theme === 'system'} onClick={() => setTheme('system')} />
                  </div>
                </div>

                {/* Default Model */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-[var(--text-primary)]">Default Model</label>
                  <p className="text-xs text-[var(--text-tertiary)] mb-1">Select the AI model to use for new conversations.</p>
                  <select 
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border-medium)] rounded-lg px-3 py-2.5 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-primary)] cursor-pointer"
                  >
                    {models.length > 0 ? models.map(m => (
                      <option key={m.id} value={m.id}>{m.label}</option>
                    )) : (
                      <option value={selectedModel}>{selectedModel}</option>
                    )}
                  </select>
                </div>

                {/* Branch Behavior */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-[var(--text-primary)]">Default Branch Behavior</label>
                  <p className="text-xs text-[var(--text-tertiary)] mb-1">Choose how the Branch Explorer panel behaves when starting a new session.</p>
                  <select 
                    value={defaultBranchBehavior}
                    onChange={(e) => setDefaultBranchBehavior(e.target.value)}
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border-medium)] rounded-lg px-3 py-2.5 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-primary)] cursor-pointer"
                  >
                    <option value="open">Always show Branch Explorer</option>
                    <option value="collapsed">Start collapsed</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="flex flex-col gap-8 max-w-md">
                <h2 className="text-xl font-bold">Data & Privacy</h2>
                
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between p-4 border border-[var(--border-light)] rounded-xl bg-[var(--bg-elevated)]">
                    <div className="flex flex-col pr-4">
                      <span className="font-semibold text-sm">Export Data</span>
                      <span className="text-xs text-[var(--text-tertiary)] mt-1">Download a copy of all your conversations, branches, and account data as JSON.</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 shrink-0">
                      <button disabled className="flex items-center gap-2 bg-[var(--bg-secondary)] border border-[var(--border-medium)] px-3 py-1.5 rounded-lg text-sm font-medium text-[var(--text-secondary)] opacity-50 cursor-not-allowed">
                        <Download size={14} /> Export
                      </button>
                      <span className="text-[12px] text-[var(--text-tertiary)] font-medium">(Coming soon)</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-red-900/30 rounded-xl bg-red-500/5">
                    <div className="flex flex-col pr-4">
                      <span className="font-semibold text-sm text-red-500 dark:text-red-400">Delete Account</span>
                      <span className="text-xs text-[var(--text-tertiary)] mt-1">Permanently delete your account and all branching data. This cannot be undone.</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 shrink-0">
                      <button disabled className="flex items-center gap-2 bg-red-500/10 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-lg text-sm font-medium opacity-50 cursor-not-allowed">
                        <Trash2 size={14} /> Delete
                      </button>
                      <span className="text-[12px] text-red-600/70 dark:text-red-400/70 font-medium">(Coming soon)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="flex flex-col gap-6 max-w-md">
                <h2 className="text-xl font-bold">About TinexusFlow</h2>
                <div className="flex flex-col gap-2 text-sm text-[var(--text-secondary)]">
                  <p><strong>Version:</strong> {packageJson.version}</p>
                  <p><strong>Company:</strong> Tinexus — A Tinu's Technology</p>
                  <p>TinexusFlow is designed for exploratory thinking. It turns linear chat logs into navigable knowledge trees, letting you pursue multiple angles of thought without losing your original context.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TabButton({ id, icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
        ${active ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm border border-[var(--border-medium)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] border border-transparent'}
      `}
    >
      <span className={active ? 'text-[var(--accent-primary)]' : 'text-[var(--text-tertiary)]'}>{icon}</span>
      {label}
    </button>
  );
}

function ThemeButton({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all
        ${active ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}
      `}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
