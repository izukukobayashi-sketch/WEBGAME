import { useEffect, useRef, useMemo, useState, useCallback } from 'react'
import { useWorldStore } from '@/store/worldStore'
import { useSimulationStore } from '@/store/simulationStore'
import { MapGenerator, type BiomeType } from '@/engine/map'

// ── Constants ─────────────────────────────────────────────────────────────────

const MAP_COLS = 120
const MAP_ROWS = 90
const CELL = 8 // px per cell at 1× zoom

const BIOME_COLOR: Record<BiomeType, string> = {
  ocean:    '#1a3a6b',
  coast:    '#2d6a9f',
  plains:   '#5d8a4e',
  forest:   '#1e5c2b',
  mountain: '#7a7a7a',
  desert:   '#c4a246',
}

const BIOME_LABEL: Record<BiomeType, string> = {
  ocean:    'Океан',
  coast:    'Побережье',
  plains:   'Равнина',
  forest:   'Лес',
  mountain: 'Горы',
  desert:   'Пустыня',
}

// ── Component ─────────────────────────────────────────────────────────────────

export function MapTab() {
  const worldStoreWorld = useWorldStore((s) => s.world)
  const simWorld = useSimulationStore((s) => s.world)
  const world = simWorld ?? worldStoreWorld

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Viewport state
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const dragging = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null)

  // Generate map data from seed
  const { heightmap, settlements } = useMemo(() => {
    if (!world) return { heightmap: null, settlements: [] }
    const gen = new MapGenerator(world.map.seed, MAP_COLS, MAP_ROWS)
    const hm = gen.generateHeightmap()
    const setts = gen.generateSettlements(12, hm)
    return { heightmap: hm, settlements: setts }
  }, [world?.map.seed])

  // Render to canvas
  useEffect(() => {
    if (!heightmap || !world) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const gen = new MapGenerator(world.map.seed, MAP_COLS, MAP_ROWS)

    canvas.width = MAP_COLS * CELL
    canvas.height = MAP_ROWS * CELL

    // Draw biome cells
    for (let y = 0; y < MAP_ROWS; y++) {
      for (let x = 0; x < MAP_COLS; x++) {
        const biome = gen.getBiomeAt(heightmap, { x, y })
        // Vary brightness slightly by elevation for depth
        const elev = biome.elevation
        ctx.fillStyle = BIOME_COLOR[biome.type]
        ctx.fillRect(x * CELL, y * CELL, CELL, CELL)

        // Elevation shading overlay
        const shade = biome.type === 'mountain' ? Math.min(0.4, (elev - 0.5) * 0.8) : 0
        if (shade > 0) {
          ctx.fillStyle = `rgba(255,255,255,${shade})`
          ctx.fillRect(x * CELL, y * CELL, CELL, CELL)
        }

        // Ocean depth
        if (biome.type === 'ocean') {
          const depth = Math.min(0.5, (0.2 - elev) * 3)
          if (depth > 0) {
            ctx.fillStyle = `rgba(0,0,0,${depth * 0.5})`
            ctx.fillRect(x * CELL, y * CELL, CELL, CELL)
          }
        }
      }
    }

    // Grid lines (subtle)
    ctx.strokeStyle = 'rgba(0,0,0,0.06)'
    ctx.lineWidth = 0.5
    for (let x = 0; x <= MAP_COLS; x++) {
      ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, MAP_ROWS * CELL); ctx.stroke()
    }
    for (let y = 0; y <= MAP_ROWS; y++) {
      ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(MAP_COLS * CELL, y * CELL); ctx.stroke()
    }

    // Draw settlements
    settlements.forEach((s, i) => {
      const cx = s.x * CELL + CELL / 2
      const cy = s.y * CELL + CELL / 2

      // Outer ring
      ctx.beginPath()
      ctx.arc(cx, cy, 7, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(0,0,0,0.5)'
      ctx.fill()

      // Inner dot
      ctx.beginPath()
      ctx.arc(cx, cy, 5, 0, Math.PI * 2)
      ctx.fillStyle = '#f0d080'
      ctx.fill()

      // Settlement label
      ctx.fillStyle = '#fff'
      ctx.font = `bold 9px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(`${i + 1}`, cx, cy)
    })
  }, [heightmap, settlements, world?.map.seed])

  // ── Pan & zoom handlers ──────────────────────────────────────────────────

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    setZoom((z) => Math.max(0.5, Math.min(4, z - e.deltaY * 0.001)))
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = { startX: e.clientX, startY: e.clientY, ox: offset.x, oy: offset.y }
  }, [offset])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return
    setOffset({
      x: dragging.current.ox + (e.clientX - dragging.current.startX),
      y: dragging.current.oy + (e.clientY - dragging.current.startY),
    })
  }, [])

  const handleMouseUp = useCallback(() => { dragging.current = null }, [])

  // ── UI ───────────────────────────────────────────────────────────────────

  if (!world) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-3">🗺️</div>
          <p className="text-sm">Нет активного мира</p>
          <p className="text-xs text-gray-600 mt-1">Создайте или откройте мир во вкладке «Мир»</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── Canvas area ──────────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden bg-gray-950 relative cursor-grab active:cursor-grabbing select-none"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            position: 'absolute',
            top: 20,
            left: 20,
          }}
        >
          <canvas
            ref={canvasRef}
            style={{ imageRendering: 'pixelated', display: 'block' }}
          />
        </div>

        {/* Zoom controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-1">
          <button
            onClick={() => setZoom((z) => Math.min(4, z + 0.25))}
            className="w-8 h-8 bg-gray-800 hover:bg-gray-700 text-white rounded text-lg flex items-center justify-center font-bold"
          >+</button>
          <button
            onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }) }}
            className="w-8 h-8 bg-gray-800 hover:bg-gray-700 text-white rounded text-xs flex items-center justify-center"
          >1×</button>
          <button
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
            className="w-8 h-8 bg-gray-800 hover:bg-gray-700 text-white rounded text-lg flex items-center justify-center font-bold"
          >−</button>
        </div>

        {/* Seed badge */}
        <div className="absolute top-3 left-3 bg-black/50 text-gray-400 text-xs px-2 py-1 rounded font-mono">
          seed: {world.map.seed}
        </div>
      </div>

      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <div className="w-56 shrink-0 bg-surface border-l border-gray-800 overflow-y-auto flex flex-col">

        {/* World info */}
        <div className="p-4 border-b border-gray-800">
          <div className="font-semibold text-sm mb-1">{world.name}</div>
          <div className="text-xs text-gray-400 space-y-0.5">
            <div>{world.settings.genre} · {world.settings.epoch}</div>
            <div>{world.timeline.currentDate}</div>
          </div>
        </div>

        {/* Global state bars */}
        <div className="p-4 border-b border-gray-800 space-y-2">
          <div className="text-xs font-medium text-gray-300 mb-2">Состояние мира</div>
          {([
            ['Стабильность', world.globalState.stability, '#60a5fa'],
            ['Процветание', world.globalState.prosperity, '#4ade80'],
            ['Магия', world.globalState.magicLevel, '#c084fc'],
          ] as [string, number, string][]).map(([label, val, color]) => (
            <div key={label}>
              <div className="flex justify-between text-xs text-gray-400 mb-0.5">
                <span>{label}</span><span>{val}%</span>
              </div>
              <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${val}%`, backgroundColor: color }} />
              </div>
            </div>
          ))}
          <div className="text-xs text-gray-500 mt-1">
            Население: {world.globalState.population.toLocaleString('ru')}
          </div>
        </div>

        {/* Settlements list */}
        <div className="p-4 border-b border-gray-800">
          <div className="text-xs font-medium text-gray-300 mb-2">
            Поселения ({settlements.length})
          </div>
          <div className="space-y-1">
            {settlements.map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                <span className="w-4 h-4 rounded-full bg-yellow-600 text-black flex items-center justify-center text-[10px] font-bold shrink-0">
                  {i + 1}
                </span>
                <span className="font-mono">{Math.round(s.x)}, {Math.round(s.y)}</span>
              </div>
            ))}
            {settlements.length === 0 && (
              <div className="text-xs text-gray-600">Нет поселений</div>
            )}
          </div>
        </div>

        {/* Biome legend */}
        <div className="p-4">
          <div className="text-xs font-medium text-gray-300 mb-2">Биомы</div>
          <div className="space-y-1.5">
            {(Object.entries(BIOME_COLOR) as [BiomeType, string][]).map(([type, color]) => (
              <div key={type} className="flex items-center gap-2 text-xs text-gray-400">
                <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: color }} />
                {BIOME_LABEL[type]}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
