import { useEffect } from 'react'
import { TabBar } from '@/components/TabBar'
import { Notification } from '@/components/Notification'
import { useUIStore } from '@/store/uiStore'
import { useWorldStore } from '@/store/worldStore'

import { WorldTab } from '@/components/tabs/WorldTab'
import { CharactersTab } from '@/components/tabs/CharactersTab'
import { RelationshipsTab } from '@/components/tabs/RelationshipsTab'
import { PlotTab } from '@/components/tabs/PlotTab'
import { HistoryTab } from '@/components/tabs/HistoryTab'
import { JournalTab } from '@/components/tabs/JournalTab'
import { ProgressionTab } from '@/components/tabs/ProgressionTab'
import { InventoryTab } from '@/components/tabs/InventoryTab'
import { SystemTab } from '@/components/tabs/SystemTab'
import { MemoryTab } from '@/components/tabs/MemoryTab'
import { SettingsTab } from '@/components/tabs/SettingsTab'

const TAB_COMPONENTS = {
  world: WorldTab,
  characters: CharactersTab,
  relationships: RelationshipsTab,
  plot: PlotTab,
  history: HistoryTab,
  journal: JournalTab,
  progression: ProgressionTab,
  inventory: InventoryTab,
  system: SystemTab,
  memory: MemoryTab,
  settings: SettingsTab,
} as const

export default function App() {
  const activeTab = useUIStore((s) => s.activeTab)
  const loadWorldList = useWorldStore((s) => s.loadWorldList)

  // Preload world list on startup
  useEffect(() => {
    loadWorldList()
  }, [loadWorldList])

  const TabComponent = TAB_COMPONENTS[activeTab]

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-surface">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-gray-800 shrink-0">
        <span className="text-sm font-semibold tracking-wide text-gray-300">AI Life Simulator</span>
        <ActiveWorldBadge />
      </header>

      {/* Tabs */}
      <TabBar />

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <TabComponent />
      </main>

      <Notification />
    </div>
  )
}

function ActiveWorldBadge() {
  const world = useWorldStore((s) => s.world)
  if (!world) return null
  return (
    <div className="flex items-center gap-2 text-xs text-gray-400">
      <span className="w-2 h-2 rounded-full bg-green-500" />
      <span>{world.name}</span>
      <span className="text-gray-600">·</span>
      <span>{world.timeline.currentDate}</span>
    </div>
  )
}
