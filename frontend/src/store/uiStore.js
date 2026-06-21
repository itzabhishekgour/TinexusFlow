import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUiStore = create(
  persist(
    (set) => ({
      isBranchPanelOpen: true,
      theme: 'light', // 'light' or 'dark'
      toggleBranchPanel: () => set((state) => ({ isBranchPanelOpen: !state.isBranchPanelOpen })),
      setBranchPanelOpen: (isOpen) => set({ isBranchPanelOpen: isOpen }),
      toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        return { theme: newTheme };
      }),
      setTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        set({ theme });
      },
      isSettingsModalOpen: false,
      setSettingsModalOpen: (isOpen) => set({ isSettingsModalOpen: isOpen }),
      defaultBranchBehavior: 'open', // 'open' or 'collapsed'
      setDefaultBranchBehavior: (behavior) => set({ defaultBranchBehavior: behavior }),
      isSidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      setSidebarCollapsed: (isCollapsed) => set({ isSidebarCollapsed: isCollapsed }),
    }),
    {
      name: 'tinexus-ui-storage', // unique name
    }
  )
);
