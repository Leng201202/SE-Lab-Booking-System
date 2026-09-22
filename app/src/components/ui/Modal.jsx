import { X } from 'lucide-react'
import { Button } from './Button'

export function Modal({ open, onClose, title, description, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 grid items-end bg-slate-950/45 p-0 backdrop-blur-[2px] sm:place-items-center sm:p-4" role="presentation" onMouseDown={onClose}>
      <div className="max-h-[calc(100dvh-1rem)] w-full overflow-y-auto rounded-t-2xl bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl sm:max-w-md sm:rounded-2xl sm:p-6" role="dialog" aria-modal="true" aria-labelledby="modal-title" onMouseDown={(event) => event.stopPropagation()}>
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

export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel = 'Confirm', disabled = false }) {
  return (
    <Modal open={open} onClose={onClose} title={title} description={description}>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button className="w-full sm:w-auto" variant="secondary" disabled={disabled} onClick={onClose}>Cancel</Button>
        <Button className="w-full sm:w-auto" disabled={disabled} onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </Modal>
  )
}
