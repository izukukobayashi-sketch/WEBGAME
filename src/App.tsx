import { useEffect } from 'react'
import { TabBar } from '@/components/TabBar'
import { Notification } from '@/components/Notification'
import { useUIStore } from '@/store/uiStore'
import { useWorldStore } from '@/store/worldStore'
import { useSimulationStore } from '@/store/simulationStore'

import { IdleTab } from '@/components/tabs/IdleTab'
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
  idle: IdleTab,
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

// IdleTab needs full height (no overflow-y-auto on main)
const FULL_HEIGHT_TABS = new Set(['idle'])

export default function App() {
  const activeTab = useUIStore((s) => s.activeTab)
  const loadWorldList = useWorldStore((s) => s.loadWorldList)

  useEffect(() => {
    loadWorldList()
  }, [loadWorldList])

  // Pause simulation when user navigates away from idle tab
  const pause = useSimulationStore((s) => s.pause)
  const isRunning = useSimulationStore((s) => s.isRunning)
  useEffect(() => {
    if (activeTab !== 'idle' && isRunning) pause()
  }, [activeTab, isRunning, pause])

  const TabComponent = TAB_COMPONENTS[activeTab]
  const fullHeight = FULL_HEIGHT_TABS.has(activeTab)

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-surface">
      <header className="flex items-center justify-between px-4 py-2 border-b border-gray-800 shrink-0">
        <span className="text-sm font-semibold tracking-wide text-gray-300">AI Life Simulator</span>
        <ActiveWorldBadge />
      </header>

      <TabBar />

      <main className={`flex-1 ${fullHeight ? 'overflow-hidden flex flex-col' : 'overflow-y-auto'}`}>
        <TabComponent />
      </main>

      <Notification />
    </div>
  )
}

function ActiveWorldBadge() {
  const world = useWorldStore((s) => s.world)
  const simWorld = useSimulationStore((s) => s.world)
  const isRunning = useSimulationStore((s) => s.isRunning)
  const displayWorld = simWorld ?? world
  if (!displayWorld) return null
  return (
    <div className="flex items-center gap-2 text-xs text-gray-400">
      <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-400 animate-pulse' : 'bg-green-600'}`} />
      <span>{displayWorld.name}</span>
      <span className="text-gray-600">·</span>
      <span>{displayWorld.timeline.currentDate}</span>
    </div>
  )
}
