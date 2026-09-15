import { X } from 'lucide-react'
import { Button } from './Button'

export function Modal({ open, onClose, title, description, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-[2px]" role="presentation" onMouseDown={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="modal-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="modal-title" className="text-lg font-bold text-slate-950">{title}</h2>
            {description && <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>}
          </div>
          <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" onClick={onClose} aria-label="Close dialog">
            <X size={19} />
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  )
}

export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel = 'Confirm' }) {
  return (
    <Modal open={open} onClose={onClose} title={title} description={description}>
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </Modal>
  )
}
