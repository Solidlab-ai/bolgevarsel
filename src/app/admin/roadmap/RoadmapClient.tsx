'use client'

import { useEffect, useState } from 'react'

// =====================================================================
// TYPES & CONSTANTS
// =====================================================================

type Status = 'idea' | 'planned' | 'in_progress' | 'shipped' | 'wont_do'
type Priority = 'low' | 'medium' | 'high' | 'critical'
type Category = 'feature' | 'bug' | 'improvement' | 'infrastructure' | 'marketing'

type RoadmapItem = {
  id: string
  title: string
  description: string | null
  status: Status
  priority: Priority
  category: Category
  effort_hours: number | null
  target_quarter: string | null
  notes: string | null
  position: number
  created_at: string
  updated_at: string
  shipped_at: string | null
}

const STATUS_COLUMNS: { key: Status; label: string; color: string; bg: string }[] = [
  { key: 'idea',        label: 'Idé',        color: '#94a3b8', bg: 'rgba(148,163,184,0.08)' },
  { key: 'planned',     label: 'Planlagt',   color: '#60a5fa', bg: 'rgba(96,165,250,0.08)' },
  { key: 'in_progress', label: 'I gang',     color: '#fbbf24', bg: 'rgba(251,191,36,0.10)' },
  { key: 'shipped',     label: 'Levert',     color: '#4ade80', bg: 'rgba(74,222,128,0.08)' },
  { key: 'wont_do',     label: 'Skippet',    color: '#64748b', bg: 'rgba(100,116,139,0.06)' },
]

const PRIORITY_META: Record<Priority, { label: string; color: string; emoji: string }> = {
  critical: { label: 'Kritisk',  color: '#ef4444', emoji: '🔥' },
  high:     { label: 'Høy',      color: '#fb923c', emoji: '↑' },
  medium:   { label: 'Middels',  color: '#fbbf24', emoji: '→' },
  low:      { label: 'Lav',      color: '#94a3b8', emoji: '↓' },
}

const CATEGORY_META: Record<Category, { label: string; color: string }> = {
  feature:        { label: 'Funksjon',     color: '#60a5fa' },
  bug:            { label: 'Bug',          color: '#ef4444' },
  improvement:    { label: 'Forbedring',   color: '#a78bfa' },
  infrastructure: { label: 'Infra',        color: '#22d3ee' },
  marketing:      { label: 'Marketing',    color: '#f472b6' },
}

const ADMIN_KEY = 'ulrik-admin-2026'


// =====================================================================
// MAIN COMPONENT
// =====================================================================

export default function RoadmapClient({ initialItems }: { initialItems: RoadmapItem[] }) {
  const [items, setItems] = useState<RoadmapItem[]>(initialItems)
  const [editingItem, setEditingItem] = useState<RoadmapItem | null>(null)
  const [creatingInColumn, setCreatingInColumn] = useState<Status | null>(null)
  const [filterCategory, setFilterCategory] = useState<Category | 'all'>('all')
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all')

  // Drag-and-drop state
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<Status | null>(null)
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null)

  async function refresh() {
    const r = await fetch('/api/admin/roadmap', { headers: { 'x-admin-key': ADMIN_KEY } })
    const d = await r.json()
    if (d.items) setItems(d.items)
  }

  async function moveItem(id: string, newStatus: Status) {
    const prev = items
    setItems(items.map((i) => (i.id === id ? { ...i, status: newStatus } : i)))
    const r = await fetch('/api/admin/roadmap', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': ADMIN_KEY },
      body: JSON.stringify({ id, status: newStatus }),
    })
    if (!r.ok) {
      setItems(prev)
      alert('Kunne ikke flytte item')
    } else {
      refresh()
    }
  }

  async function deleteItem(id: string) {
    if (!confirm('Slett dette item-et permanent?')) return
    const r = await fetch('/api/admin/roadmap', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': ADMIN_KEY },
      body: JSON.stringify({ id }),
    })
    if (r.ok) setItems(items.filter((i) => i.id !== id))
  }

  // ===== Drag-and-drop helpers =====
  // Når dragget item slippes på et target-item ELLER tom kolonne, plasserer vi
  // dragget item i den nye kolonnen før eller etter target (hvis target finnes),
  // ellers nederst i kolonnen.
  function handleDrop(targetStatus: Status, targetItemId: string | null) {
    if (!draggingId) return
    const dragged = items.find((i) => i.id === draggingId)
    if (!dragged) return

    // Bygg ny rekkefølge for målkolonnen
    const sourceStatus = dragged.status
    const sameColumn = sourceStatus === targetStatus

    // Liste av items i målkolonnen, eksklusivt dragget item
    const targetCol = items
      .filter((i) => i.status === targetStatus && i.id !== draggingId)
      .sort((a, b) => a.position - b.position)

    // Beregn ny posisjon
    let newIndex: number
    if (targetItemId) {
      const targetIdx = targetCol.findIndex((i) => i.id === targetItemId)
      newIndex = targetIdx >= 0 ? targetIdx : targetCol.length
    } else {
      newIndex = targetCol.length // tom kolonne → nederst
    }

    // Sett inn dragget item på riktig posisjon
    targetCol.splice(newIndex, 0, { ...dragged, status: targetStatus })

    // Bygg payload for backend: alle items i målkolonnen får ny posisjon (0, 1, 2...)
    const updates = targetCol.map((it, idx) => ({
      id: it.id,
      status: targetStatus,
      position: idx,
    }))

    // Hvis vi flyttet TIL en annen kolonne, må vi også re-pakke source-kolonnen
    // (positions blir "gappy" når et item forsvinner, det er teknisk OK men ryddig å pakke)
    let sourceUpdates: typeof updates = []
    if (!sameColumn) {
      const sourceCol = items
        .filter((i) => i.status === sourceStatus && i.id !== draggingId)
        .sort((a, b) => a.position - b.position)
      sourceUpdates = sourceCol.map((it, idx) => ({
        id: it.id,
        status: sourceStatus,
        position: idx,
      }))
    }

    const allUpdates = [...updates, ...sourceUpdates]

    // Optimistisk: oppdater lokalt state med en gang
    const prev = items
    setItems(
      items.map((it) => {
        const u = allUpdates.find((x) => x.id === it.id)
        return u ? { ...it, status: u.status as Status, position: u.position } : it
      })
    )

    // Send til backend
    fetch('/api/admin/roadmap', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': ADMIN_KEY },
      body: JSON.stringify({ updates: allUpdates }),
    })
      .then((r) => {
        if (!r.ok) {
          setItems(prev)
          alert('Kunne ikke lagre rekkefølge')
        }
      })
      .catch(() => {
        setItems(prev)
        alert('Kunne ikke lagre rekkefølge')
      })

    // Reset drag-state
    setDraggingId(null)
    setDragOverColumn(null)
    setDragOverItemId(null)
  }

  const filtered = items.filter((i) => {
    if (filterCategory !== 'all' && i.category !== filterCategory) return false
    if (filterPriority !== 'all' && i.priority !== filterPriority) return false
    return true
  })

  const stats = {
    total: items.length,
    in_progress: items.filter((i) => i.status === 'in_progress').length,
    shipped: items.filter((i) => i.status === 'shipped').length,
    planned: items.filter((i) => i.status === 'planned').length,
  }

  return (
    <div style={S.page}>
      <nav style={S.nav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <a href="/admin" style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontSize: '0.85rem' }}>← Admin</a>
          <span style={{ color: 'rgba(255,255,255,0.25)' }}>/</span>
          <span style={{ fontSize: '1.1rem', fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}>Roadmap</span>
          <span style={{ background: '#ef4444', color: 'white', padding: '2px 8px', borderRadius: 100, fontSize: '0.68rem', fontWeight: 600 }}>ADMIN</span>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)' }}>
          <span>{stats.total} totalt</span>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
          <span style={{ color: '#fbbf24' }}>{stats.in_progress} i gang</span>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
          <span style={{ color: '#4ade80' }}>{stats.shipped} levert</span>
        </div>
      </nav>

      <div style={S.filterBar}>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Kategori:</span>
          <FilterPill active={filterCategory === 'all'} onClick={() => setFilterCategory('all')} label="Alle" />
          {(Object.keys(CATEGORY_META) as Category[]).map((c) => (
            <FilterPill key={c} active={filterCategory === c} onClick={() => setFilterCategory(c)} label={CATEGORY_META[c].label} color={CATEGORY_META[c].color} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Prioritet:</span>
          <FilterPill active={filterPriority === 'all'} onClick={() => setFilterPriority('all')} label="Alle" />
          {(['critical', 'high', 'medium', 'low'] as Priority[]).map((p) => (
            <FilterPill key={p} active={filterPriority === p} onClick={() => setFilterPriority(p)} label={PRIORITY_META[p].label} color={PRIORITY_META[p].color} />
          ))}
        </div>
      </div>

      <div style={S.board}>
        {STATUS_COLUMNS.map((col) => {
          const colItems = filtered.filter((i) => i.status === col.key)
          const isDragOver = dragOverColumn === col.key
          return (
            <div
              key={col.key}
              style={{
                ...S.column,
                background: col.bg,
                ...(isDragOver ? { outline: `2px dashed ${col.color}99`, outlineOffset: -2 } : {}),
                transition: 'outline 0.12s',
              }}
              onDragOver={(e) => {
                e.preventDefault()
                e.dataTransfer.dropEffect = 'move'
                if (dragOverColumn !== col.key) setDragOverColumn(col.key)
              }}
              onDragLeave={(e) => {
                // Bare nullstill hvis vi forlater kolonnen helt (ikke når vi krysser fra ett barn til et annet)
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setDragOverColumn(null)
                  setDragOverItemId(null)
                }
              }}
              onDrop={(e) => {
                e.preventDefault()
                handleDrop(col.key, dragOverItemId)
              }}
            >
              <div style={S.columnHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                  <span style={{ color: col.color, fontWeight: 600, fontSize: '0.95rem' }}>{col.label}</span>
                  <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>{colItems.length}</span>
                </div>
                <button onClick={() => setCreatingInColumn(col.key)} style={S.addBtn} title={`Nytt item i ${col.label}`}>+</button>
              </div>
              <div style={S.columnBody}>
                {colItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onClick={() => setEditingItem(item)}
                    onMove={(newStatus) => moveItem(item.id, newStatus)}
                    isDragging={draggingId === item.id}
                    isDragOverTarget={dragOverItemId === item.id && draggingId !== item.id}
                    onDragStart={() => setDraggingId(item.id)}
                    onDragEnd={() => { setDraggingId(null); setDragOverColumn(null); setDragOverItemId(null) }}
                    onDragEnterCard={() => setDragOverItemId(item.id)}
                  />
                ))}
                {colItems.length === 0 && <div style={S.emptyHint}>{isDragOver ? 'Slipp her' : 'Ingen items'}</div>}
              </div>
            </div>
          )
        })}
      </div>

      {(editingItem || creatingInColumn) && (
        <ItemModal
          item={editingItem}
          defaultStatus={creatingInColumn || 'idea'}
          onClose={() => { setEditingItem(null); setCreatingInColumn(null) }}
          onSave={async (payload) => {
            const isNew = !editingItem
            const r = await fetch('/api/admin/roadmap', {
              method: isNew ? 'POST' : 'PATCH',
              headers: { 'Content-Type': 'application/json', 'x-admin-key': ADMIN_KEY },
              body: JSON.stringify(isNew ? payload : { ...payload, id: editingItem!.id }),
            })
            if (r.ok) {
              await refresh()
              setEditingItem(null)
              setCreatingInColumn(null)
            } else {
              const e = await r.json()
              alert(`Feil: ${e.error || 'Ukjent'}`)
            }
          }}
          onDelete={editingItem ? () => { deleteItem(editingItem.id); setEditingItem(null) } : undefined}
        />
      )}
    </div>
  )
}


// =====================================================================
// SUB-COMPONENTS
// =====================================================================

function FilterPill({ active, onClick, label, color }: { active: boolean; onClick: () => void; label: string; color?: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? (color ? `${color}33` : 'rgba(255,255,255,0.12)') : 'rgba(255,255,255,0.04)',
        color: active ? (color || 'white') : 'rgba(255,255,255,0.55)',
        border: active && color ? `1px solid ${color}66` : '1px solid rgba(255,255,255,0.06)',
        padding: '4px 12px',
        borderRadius: 100,
        fontSize: '0.78rem',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >{label}</button>
  )
}

function ItemCard({
  item, onClick, onMove,
  isDragging, isDragOverTarget,
  onDragStart, onDragEnd, onDragEnterCard,
}: {
  item: RoadmapItem
  onClick: () => void
  onMove: (s: Status) => void
  isDragging: boolean
  isDragOverTarget: boolean
  onDragStart: () => void
  onDragEnd: () => void
  onDragEnterCard: () => void
}) {
  const cat = CATEGORY_META[item.category]
  const pri = PRIORITY_META[item.priority]
  return (
    <div
      style={{
        ...S.card,
        opacity: isDragging ? 0.35 : 1,
        borderTop: isDragOverTarget
          ? '2px solid #4da8cc'
          : '1px solid rgba(255,255,255,0.06)',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      draggable
      onClick={onClick}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', item.id) // for noen browsers' drag preview
        onDragStart()
      }}
      onDragEnd={onDragEnd}
      onDragEnter={(e) => {
        e.stopPropagation()
        onDragEnterCard()
      }}
      onDragOver={(e) => {
        // La parent column håndtere dropEffect, men stopper propagation slik at vi får fin per-card highlight
        e.preventDefault()
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
        <span style={{ ...S.tag, background: `${cat.color}1f`, color: cat.color, border: `1px solid ${cat.color}33` }}>{cat.label}</span>
        <span style={{ color: pri.color, fontSize: '0.85rem', fontWeight: 600, flexShrink: 0 }} title={pri.label}>{pri.emoji}</span>
      </div>
      <div style={{ fontSize: '0.92rem', fontWeight: 500, color: 'white', lineHeight: 1.35, marginBottom: 6 }}>{item.title}</div>
      {item.description && (
        <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.45, marginBottom: 8, maxHeight: 60, overflow: 'hidden' }}>
          {item.description}
        </div>
      )}
      <div style={{ display: 'flex', gap: 6, fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', alignItems: 'center', flexWrap: 'wrap' }}>
        {item.effort_hours && <span>⏱ {item.effort_hours}t</span>}
        {item.target_quarter && <span>📅 {item.target_quarter}</span>}
        {item.shipped_at && <span style={{ color: '#4ade80' }}>✓ {new Date(item.shipped_at).toLocaleDateString('no')}</span>}
      </div>
      <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {STATUS_COLUMNS.filter((c) => c.key !== item.status).map((c) => (
          <button
            key={c.key}
            onClick={(e) => { e.stopPropagation(); onMove(c.key) }}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              color: c.color,
              fontSize: '0.65rem',
              padding: '2px 7px',
              borderRadius: 100,
              cursor: 'pointer',
              fontWeight: 500,
            }}
            title={`Flytt til ${c.label}`}
          >→ {c.label}</button>
        ))}
      </div>
    </div>
  )
}

function ItemModal({ item, defaultStatus, onClose, onSave, onDelete }: {
  item: RoadmapItem | null
  defaultStatus: Status
  onClose: () => void
  onSave: (payload: any) => Promise<void>
  onDelete?: () => void
}) {
  const [title, setTitle] = useState(item?.title || '')
  const [description, setDescription] = useState(item?.description || '')
  const [status, setStatus] = useState<Status>(item?.status || defaultStatus)
  const [priority, setPriority] = useState<Priority>(item?.priority || 'medium')
  const [category, setCategory] = useState<Category>(item?.category || 'feature')
  const [effortHours, setEffortHours] = useState<string>(item?.effort_hours?.toString() || '')
  const [targetQuarter, setTargetQuarter] = useState(item?.target_quarter || '')
  const [notes, setNotes] = useState(item?.notes || '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  async function handleSave() {
    if (!title.trim()) return alert('Tittel er påkrevd')
    setSaving(true)
    await onSave({
      title: title.trim(),
      description: description.trim() || null,
      status,
      priority,
      category,
      effort_hours: effortHours ? Number(effortHours) : null,
      target_quarter: targetQuarter.trim() || null,
      notes: notes.trim() || null,
    })
    setSaving(false)
  }

  return (
    <div style={S.modalBackdrop} onClick={onClose}>
      <div style={S.modal} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontFamily: "'Fraunces', Georgia, serif", fontWeight: 400, fontSize: '1.4rem', color: 'white' }}>
            {item ? 'Rediger item' : 'Nytt item'}
          </h3>
          <button onClick={onClose} style={S.closeBtn}>×</button>
        </div>

        <Field label="Tittel">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} style={S.input} autoFocus placeholder="F.eks. SOS Alarmsentral" />
        </Field>

        <Field label="Beskrivelse">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...S.input, minHeight: 80, resize: 'vertical', fontFamily: 'inherit' }} placeholder="Hva skal gjøres? Hvorfor er dette viktig?" />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <Field label="Status">
            <select value={status} onChange={(e) => setStatus(e.target.value as Status)} style={S.input}>
              {STATUS_COLUMNS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          </Field>
          <Field label="Prioritet">
            <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} style={S.input}>
              {(Object.keys(PRIORITY_META) as Priority[]).map((p) => (
                <option key={p} value={p}>{PRIORITY_META[p].emoji} {PRIORITY_META[p].label}</option>
              ))}
            </select>
          </Field>
          <Field label="Kategori">
            <select value={category} onChange={(e) => setCategory(e.target.value as Category)} style={S.input}>
              {(Object.keys(CATEGORY_META) as Category[]).map((c) => (
                <option key={c} value={c}>{CATEGORY_META[c].label}</option>
              ))}
            </select>
          </Field>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Estimert tid (timer)">
            <input type="number" step="0.5" min="0" value={effortHours} onChange={(e) => setEffortHours(e.target.value)} style={S.input} placeholder="F.eks. 2.5" />
          </Field>
          <Field label="Mål-kvartal / dato">
            <input type="text" value={targetQuarter} onChange={(e) => setTargetQuarter(e.target.value)} style={S.input} placeholder="F.eks. Q2 2026, Mai, etc." />
          </Field>
        </div>

        <Field label="Notater (intern)">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} style={{ ...S.input, minHeight: 60, resize: 'vertical', fontFamily: 'inherit' }} placeholder="Tekniske detaljer, lenker til dokumenter, etc." />
        </Field>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', marginTop: 24 }}>
          {onDelete && (<button onClick={onDelete} style={S.btnDanger}>Slett</button>)}
          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
            <button onClick={onClose} style={S.btnSecondary}>Avbryt</button>
            <button onClick={handleSave} disabled={saving} style={{ ...S.btnPrimary, opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Lagrer...' : item ? 'Oppdater' : 'Opprett'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block', marginBottom: 14 }}>
      <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, fontWeight: 500 }}>{label}</div>
      {children}
    </label>
  )
}


// =====================================================================
// STYLES
// =====================================================================

const S = {
  page: {
    minHeight: '100vh',
    background: '#0a1f2e',
    color: 'white',
    fontFamily: "'DM Sans', system-ui, sans-serif",
  } as React.CSSProperties,
  nav: {
    padding: '1rem 2rem',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as React.CSSProperties,
  filterBar: {
    padding: '14px 2rem',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    display: 'flex',
    gap: '1.5rem',
    flexWrap: 'wrap',
  } as React.CSSProperties,
  board: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(260px, 1fr))',
    gap: 14,
    padding: '20px',
    overflowX: 'auto',
    minHeight: 'calc(100vh - 180px)',
  } as React.CSSProperties,
  column: {
    background: 'rgba(255,255,255,0.025)',
    borderRadius: 14,
    padding: 12,
    border: '1px solid rgba(255,255,255,0.04)',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  } as React.CSSProperties,
  columnHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '4px 6px 12px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    marginBottom: 12,
  } as React.CSSProperties,
  columnBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    overflowY: 'auto',
    paddingRight: 2,
  } as React.CSSProperties,
  addBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    background: 'rgba(255,255,255,0.06)',
    color: 'rgba(255,255,255,0.7)',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.1rem',
    fontWeight: 300,
    lineHeight: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,
  card: {
    background: 'rgba(255,255,255,0.04)',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    borderLeft: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 10,
    paddingTop: 12,
    paddingRight: 12,
    paddingBottom: 10,
    paddingLeft: 12,
    cursor: 'pointer',
    transition: 'background 0.15s, border 0.15s',
  } as React.CSSProperties,
  tag: {
    fontSize: '0.65rem',
    fontWeight: 600,
    padding: '2px 7px',
    borderRadius: 100,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
  } as React.CSSProperties,
  emptyHint: {
    fontSize: '0.78rem',
    color: 'rgba(255,255,255,0.25)',
    textAlign: 'center' as const,
    padding: '20px 10px',
    fontStyle: 'italic' as const,
  } as React.CSSProperties,
  modalBackdrop: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  } as React.CSSProperties,
  modal: {
    background: '#0d2d42',
    borderRadius: 18,
    padding: '1.8rem',
    border: '1px solid rgba(255,255,255,0.1)',
    width: 560,
    maxWidth: '95vw',
    maxHeight: '92vh',
    overflowY: 'auto' as const,
  } as React.CSSProperties,
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: 'rgba(255,255,255,0.55)',
    fontSize: '1.7rem',
    cursor: 'pointer',
    lineHeight: 1,
    padding: 0,
    width: 32,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,
  input: {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8,
    padding: '9px 12px',
    color: 'white',
    fontSize: '0.92rem',
    fontFamily: 'inherit',
    outline: 'none',
  } as React.CSSProperties,
  btnPrimary: {
    background: '#4da8cc',
    color: 'white',
    border: 'none',
    padding: '9px 18px',
    borderRadius: 8,
    fontSize: '0.92rem',
    fontWeight: 500,
    cursor: 'pointer',
  } as React.CSSProperties,
  btnSecondary: {
    background: 'rgba(255,255,255,0.06)',
    color: 'rgba(255,255,255,0.7)',
    border: 'none',
    padding: '9px 18px',
    borderRadius: 8,
    fontSize: '0.92rem',
    cursor: 'pointer',
  } as React.CSSProperties,
  btnDanger: {
    background: 'rgba(239,68,68,0.15)',
    color: '#f87171',
    border: '1px solid rgba(239,68,68,0.25)',
    padding: '9px 18px',
    borderRadius: 8,
    fontSize: '0.92rem',
    cursor: 'pointer',
  } as React.CSSProperties,
}
