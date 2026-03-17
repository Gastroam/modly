import { useState, useRef } from 'react'
import type { Collection } from '@shared/types/collections'

interface Props {
  col:      Collection
  isActive: boolean
  isOnly:   boolean
  onSelect: () => void
  onRename: (name: string) => void
  onDelete: () => void
}

export function CollectionItem({ col, isActive, isOnly, onSelect, onRename, onDelete }: Props): JSX.Element {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(col.name)
  const inputRef = useRef<HTMLInputElement>(null)

  const startEdit = () => {
    setDraft(col.name)
    setEditing(true)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  const commitEdit = () => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== col.name) onRename(trimmed)
    setEditing(false)
  }

  const cancelEdit = () => {
    setDraft(col.name)
    setEditing(false)
  }

  return (
    <div
      className={`
        group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors select-none
        ${isActive ? 'bg-accent/15 text-zinc-100' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}
      `}
      onClick={onSelect}
      onDoubleClick={(e) => { e.preventDefault(); startEdit() }}
    >
      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          autoFocus
          className="flex-1 min-w-0 bg-zinc-700 text-zinc-100 text-sm px-1.5 py-0.5 rounded outline-none border border-accent/50"
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); commitEdit() }
            if (e.key === 'Escape') { e.preventDefault(); cancelEdit() }
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className="flex-1 min-w-0 text-sm truncate">{col.name}</span>
      )}

      <span className="text-[11px] text-zinc-600 shrink-0">{col.jobs.length}</span>

      {!isOnly && !editing && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="opacity-0 group-hover:opacity-100 w-4 h-4 flex items-center justify-center rounded text-zinc-600 hover:text-red-400 transition-all"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  )
}
