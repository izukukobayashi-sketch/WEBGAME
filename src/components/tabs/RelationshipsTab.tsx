import { useState, useMemo } from 'react'
import { useWorldStore } from '@/store/worldStore'
import { useUIStore } from '@/store/uiStore'
import { RelationshipEditor } from '@/components/editors/RelationshipEditor'
import { createDefaultRelationship, type Relationship, type Character } from '@/types'

type ViewMode = 'list' | 'graph'

// ── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  stranger: 'Незнакомцы', acquaintance: 'Знакомые', friend: 'Друзья',
  'close-friend': 'Близкие друзья', romantic: 'Романтика', partner: 'Партнёры',
  spouse: 'Супруги', family: 'Семья', rival: 'Соперники', enemy: 'Враги',
  mentor: 'Наставник', student: 'Ученик',
}

const STATUS_COLOR: Record<string, string> = {
  stranger: 'text-gray-500', acquaintance: 'text-gray-400', friend: 'text-green-400',
  'close-friend': 'text-green-300', romantic: 'text-pink-400', partner: 'text-pink-500',
  spouse: 'text-red-400', family: 'text-orange-400', rival: 'text-yellow-400',
  enemy: 'text-red-500', mentor: 'text-blue-400', student: 'text-blue-300',
}

function overallScore(r: Relationship): number {
  return (r.trust + r.respect + r.attraction - r.fear * 0.5 - r.envy * 0.3) / 3
}

function scoreColor(v: number): string {
  if (v > 50) return '#4ade80'
  if (v > 20) return '#86efac'
  if (v > -20) return '#9ca3af'
  if (v > -50) return '#fb923c'
  return '#f87171'
}

function DimBar({ label, value }: { label: string; value: number }) {
  const pct = (value + 100) / 2
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-0.5">
        <span>{label}</span>
        <span className="font-mono">{value > 0 ? '+' : ''}{value}</span>
      </div>
      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            backgroundColor: value > 0 ? '#60a5fa' : value < 0 ? '#f87171' : '#6b7280',
          }}
        />
      </div>
    </div>
  )
}

// ── SVG Graph ────────────────────────────────────────────────────────────────

const GW = 600; const GH = 360; const GR = 28

function RelGraph({ chars, rels }: { chars: Character[]; rels: Relationship[] }) {
  const [hovered, setHovered] = useState<string | null>(null)

  const positions = useMemo(() => {
    const n = chars.length
    return Object.fromEntries(chars.map((c, i) => {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2
      const rx = Math.min(GW, GH) / 2 - GR - 24
      return [c.id, { x: GW / 2 + rx * Math.cos(angle), y: GH / 2 + (GH / 2 - GR - 24) * Math.sin(angle), name: c.name }]
    }))
  }, [chars])

  if (chars.length === 0) return <div className="flex items-center justify-center h-48 text-gray-600 text-sm">Нет персонажей</div>
  if (chars.length === 1) return <div className="flex items-center justify-center h-48 text-gray-600 text-sm">Нужно минимум 2 персонажа</div>

  return (
    <svg viewBox={`0 0 ${GW} ${GH}`} className="w-full rounded-xl bg-gray-950 border border-gray-800">
      {rels.map((r) => {
        const from = positions[r.fromCharacterId]; const to = positions[r.toCharacterId]
        if (!from || !to) return null
        const score = overallScore(r); const color = scoreColor(score); const isH = hovered === r.id
        const mx = (from.x + to.x) / 2; const my = (from.y + to.y) / 2
        return (
          <g key={r.id} onMouseEnter={() => setHovered(r.id)} onMouseLeave={() => setHovered(null)}>
            <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              stroke={color} strokeWidth={isH ? 3 : Math.max(1, Math.abs(score) / 30)} strokeOpacity={isH ? 1 : 0.5} />
            {isH && (
              <text x={mx} y={my - 7} textAnchor="middle" fill={color} fontSize="10" className="pointer-events-none">
                {STATUS_LABEL[r.status]} ({score > 0 ? '+' : ''}{Math.round(score)})
              </text>
            )}
          </g>
        )
      })}
      {Object.entries(positions).map(([id, pos]) => {
        const char = chars.find((c) => c.id === id)!
        const initials = char.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
        return (
          <g key={id}>
            <circle cx={pos.x} cy={pos.y} r={GR} fill="#1f2937" stroke="#374151" strokeWidth="2" />
            <text x={pos.x} y={pos.y + 5} textAnchor="middle" fill="#e5e7eb" fontSize="13" fontWeight="bold">{initials}</text>
            <text x={pos.x} y={pos.y + GR + 14} textAnchor="middle" fill="#9ca3af" fontSize="10">{char.name}</text>
          </g>
        )
      })}
    </svg>
  )
}

// ── Main Tab ─────────────────────────────────────────────────────────────────

export function RelationshipsTab() {
  const { world, characters, relationships, createRelationship, updateRelationship, deleteRelationship } = useWorldStore()
  const showNotification = useUIStore((s) => s.showNotification)
  const [editing, setEditing] = useState<Relationship | null>(null)
  const [view, setView] = useState<ViewMode>('list')
  const [expanded, setExpanded] = useState<string | null>(null)

  if (!world) return <div className="p-6 text-gray-400">Сначала откройте мир во вкладке «Мир».</div>

  const getName = (id: string) => characters.find((c) => c.id === id)?.name ?? id

  if (editing) {
    return (
      <div className="p-6 max-w-xl">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setEditing(null)} className="btn-ghost text-sm">← Назад</button>
          <h2 className="text-lg font-semibold">Отношение</h2>
        </div>
        <RelationshipEditor relationship={editing} characters={characters}
          onSave={async (r) => {
            const isNew = !relationships.find((x) => x.id === r.id)
            if (isNew) await createRelationship(r)
            else await updateRelationship(r)
            showNotification('Отношение сохранено', 'success')
            setEditing(null)
          }} />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="text-xl font-bold">Отношения</h2>
        <div className="flex gap-2">
          <div className="flex gap-1">
            {(['list', 'graph'] as ViewMode[]).map((m) => (
              <button key={m} onClick={() => setView(m)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${view === m ? 'bg-accent text-white' : 'bg-surface-overlay text-gray-300 hover:bg-gray-600'}`}>
                {m === 'list' ? '📋 Список' : '🕸 Граф'}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              if (characters.length < 2) { showNotification('Нужно минимум 2 персонажа', 'error'); return }
              setEditing(createDefaultRelationship(world.id, characters[0].id, characters[1].id))
            }}
            className="btn-primary"
          >+ Добавить</button>
        </div>
      </div>

      {view === 'graph' && (
        <div className="space-y-3">
          <RelGraph chars={characters} rels={relationships} />
          <div className="flex gap-6 text-xs text-gray-500 justify-center flex-wrap">
            {[['#4ade80', 'Позитивные'], ['#9ca3af', 'Нейтральные'], ['#f87171', 'Негативные']].map(([c, l]) => (
              <span key={l} className="flex items-center gap-1.5">
                <span className="w-4 h-0.5 inline-block rounded" style={{ backgroundColor: c }} />{l}
              </span>
            ))}
          </div>
        </div>
      )}

      {view === 'list' && (
        <div className="space-y-2">
          {relationships.length === 0 && <p className="text-gray-400 text-sm">Отношений нет. Нажмите «+ Добавить».</p>}
          {relationships.map((r) => {
            const score = overallScore(r); const isExp = expanded === r.id
            return (
              <div key={r.id} className="card">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => setExpanded(isExp ? null : r.id)}>
                  <div className="w-1.5 h-8 rounded-full shrink-0" style={{ backgroundColor: scoreColor(score) }} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{getName(r.fromCharacterId)} → {getName(r.toCharacterId)}</div>
                    <div className={`text-xs ${STATUS_COLOR[r.status] ?? 'text-gray-500'}`}>
                      {STATUS_LABEL[r.status] ?? r.status} · {score > 0 ? '+' : ''}{Math.round(score)}
                    </div>
                  </div>
                  <span className="text-gray-600 text-xs">{isExp ? '▲' : '▼'}</span>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); setEditing(r) }} className="btn-secondary text-xs px-2 py-1">Изм.</button>
                    <button onClick={async (e) => { e.stopPropagation(); await deleteRelationship(r.id); showNotification('Удалено', 'info') }}
                      className="btn-danger text-xs px-2 py-1">✕</button>
                  </div>
                </div>
                {isExp && (
                  <div className="mt-3 pt-3 border-t border-gray-800 space-y-2">
                    <DimBar label="Доверие" value={r.trust} />
                    <DimBar label="Влечение" value={r.attraction} />
                    <DimBar label="Уважение" value={r.respect} />
                    <DimBar label="Страх" value={r.fear} />
                    <DimBar label="Зависть" value={r.envy} />
                    {r.notes && <p className="text-xs text-gray-500 italic mt-2">{r.notes}</p>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
