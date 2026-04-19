import { create } from 'zustand'

export type TabId =
  | 'world'
  | 'characters'
  | 'relationships'
  | 'plot'
  | 'history'
  | 'journal'
  | 'progression'
  | 'inventory'
  | 'system'
  | 'memory'
  | 'settings'

export const TABS: { id: TabId; label: string }[] = [
  { id: 'world', label: 'Мир' },
  { id: 'characters', label: 'Персонажи' },
  { id: 'relationships', label: 'Отношения' },
  { id: 'plot', label: 'Сюжет' },
  { id: 'history', label: 'История' },
  { id: 'journal', label: 'Дневник' },
  { id: 'progression', label: 'Прогрессия' },
  { id: 'inventory', label: 'Инвентарь' },
  { id: 'system', label: 'Система' },
  { id: 'memory', label: 'Память' },
  { id: 'settings', label: 'Настройки' },
]

interface UIState {
  activeTab: TabId
  setTab: (tab: TabId) => void

  // Modal state
  modalOpen: string | null
  openModal: (id: string) => void
  closeModal: () => void

  // Notification
  notification: { message: string; type: 'info' | 'success' | 'error' } | null
  showNotification: (message: string, type?: 'info' | 'success' | 'error') => void
  clearNotification: () => void
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: 'world',
  setTab: (tab) => set({ activeTab: tab }),

  modalOpen: null,
  openModal: (id) => set({ modalOpen: id }),
  closeModal: () => set({ modalOpen: null }),

  notification: null,
  showNotification: (message, type = 'info') => {
    set({ notification: { message, type } })
    setTimeout(() => set({ notification: null }), 3000)
  },
  clearNotification: () => set({ notification: null }),
}))
