export function Button({ variant = 'primary', size = 'md', className = '', ...props }) {
  const variants = {
    primary: 'bg-mfu-700 text-white hover:bg-mfu-800 shadow-sm',
    secondary: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  }
  const sizes = { sm: 'h-9 px-3 text-sm', md: 'h-11 px-4 text-sm', lg: 'h-12 px-5' }

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mfu-600 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  )
}
