export default function Spinner({ label = 'Loading…' }) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-600">
      <div
        className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700"
        aria-hidden="true"
      />
      <span>{label}</span>
    </div>
  )
}

