export function Field({ label, error, hint, children, required }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
      {error ? (
        <span className="mt-1.5 block text-sm text-red-600">{error}</span>
      ) : hint ? (
        <span className="mt-1.5 block text-xs text-slate-500">{hint}</span>
      ) : null}
    </label>
  )
}

const controlClass =
  'h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-mfu-500 focus:ring-3 focus:ring-mfu-100'

export function Input({ className = '', ...props }) {
  return <input className={`${controlClass} ${className}`} {...props} />
}

// Custom chevron so the arrow sits inset from the border instead of the
// browser's default, which hugs the right edge.
const selectChevron = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`

export function Select({ className = '', style, children, ...props }) {
  return (
    <select
      className={`${controlClass} cursor-pointer appearance-none pr-11 disabled:cursor-not-allowed ${className}`}
      style={{ backgroundImage: selectChevron, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.875rem center', backgroundSize: '16px 16px', ...style }}
      {...props}
    >
      {children}
    </select>
  )
}

export function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={`min-h-28 w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-mfu-500 focus:ring-3 focus:ring-mfu-100 ${className}`}
      {...props}
    />
  )
}
