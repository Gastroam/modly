import { useState } from 'react'
import { StorageSection } from './components/StorageSection'
import { AboutSection }   from './components/AboutSection'

type Section = 'storage' | 'about'

const SECTIONS: { id: Section; label: string; icon: JSX.Element }[] = [
  {
    id: 'storage',
    label: 'Storage',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
        <line x1="3" y1="12" x2="21" y2="12" />
      </svg>
    )
  },
  {
    id: 'about',
    label: 'About',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    )
  }
]

// ─── Page shell ───────────────────────────────────────────────────────────────

export default function SettingsPage(): JSX.Element {
  const [section, setSection] = useState<Section>('storage')

  return (
    <div className="flex h-full">

      {/* Left nav */}
      <nav className="w-52 shrink-0 border-r border-zinc-800 bg-surface-400 py-5 px-3 flex flex-col gap-0.5">
        <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider px-3 mb-3">Settings</p>
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            className={`
              flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] text-left transition-colors
              ${section === s.id
                ? 'bg-accent/15 text-accent-light'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'}
            `}
          >
            <span className={section === s.id ? 'text-accent-light' : 'text-zinc-600'}>{s.icon}</span>
            {s.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-surface-400">
        <div className="p-8">
          {section === 'storage' && <StorageSection />}
          {section === 'about'   && <AboutSection />}
        </div>
      </div>

    </div>
  )
}
