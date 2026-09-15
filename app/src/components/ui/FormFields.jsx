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

export function Select({ className = '', children, ...props }) {
  return (
    <select className={`${controlClass} ${className}`} {...props}>
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
