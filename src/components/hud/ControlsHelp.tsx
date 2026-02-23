const CONTROLS = [
  { key: 'W A S D', label: 'Move' },
  { key: 'E', label: 'Interact' },
  { key: 'C', label: 'Chat' },
]

function KeyBadge({ children }: { children: string }) {
  return (
    <kbd className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-mono font-bold bg-slate-700 border border-slate-500 rounded text-slate-200 shadow-sm">
      {children}
    </kbd>
  )
}

export default function ControlsHelp() {
  return (
    <div className="flex items-center gap-3 bg-slate-900/70 border border-slate-700/50 rounded-lg px-3 py-2 pointer-events-none">
      {CONTROLS.map(({ key, label }) => (
        <div key={key} className="flex items-center gap-1.5">
          <KeyBadge>{key}</KeyBadge>
          <span className="text-xs text-slate-400">{label}</span>
        </div>
      ))}
    </div>
  )
}
