import { TABS, useUIStore } from '@/store/uiStore'

export function TabBar() {
  const activeTab = useUIStore((s) => s.activeTab)
  const setTab = useUIStore((s) => s.setTab)

  return (
    <nav className="flex overflow-x-auto border-b border-gray-800 shrink-0 bg-surface">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setTab(tab.id)}
          className={`px-4 py-3 text-sm whitespace-nowrap transition-colors border-b-2 -mb-px ${
            activeTab === tab.id
              ? 'border-accent text-white'
              : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
