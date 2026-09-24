import { Cpu, Pencil, Plus } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../../app/AppContext'
import { Button } from '../../components/ui/Button'
import { Card, PageHeader } from '../../components/ui/Card'
import { Field, Input, Select, Textarea } from '../../components/ui/FormFields'
import { Modal } from '../../components/ui/Modal'
import { Badge } from '../../components/ui/StatusBadge'
import { createPc, updatePc } from './pcService'

const emptyForm = { code: '', room: '', specification: '', status: 'available', notes: '' }

export function PcManagementPage() {
  const { user, pcs, refreshWorkspace } = useApp()
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const openCreate = () => { setEditingId('new'); setForm(emptyForm); setError('') }
  const openEdit = (pc) => {
    setEditingId(pc.databaseId)
    setForm({ code: pc.id, room: pc.room, specification: pc.specification, status: pc.statusValue, notes: pc.notes || '' })
    setError('')
  }
  const close = () => { if (!busy) setEditingId(null) }
  const change = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))

  const save = async (event) => {
    event.preventDefault()
    if (!/^PC-[0-9]{2}$/.test(form.code.trim().toUpperCase())) { setError('PC code must use the format PC-01.'); return }
    if (!form.room.trim()) { setError('Room is required.'); return }
    setBusy(true)
    setError('')
    try {
      if (editingId === 'new') await createPc(form)
      else await updatePc(editingId, form)
      await refreshWorkspace()
      setEditingId(null)
    } catch (nextError) {
      setError(nextError.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={`${user.role === 'technician' ? 'Technician' : 'Dean'} administration`} title="PC management" description="Add workstations, maintain specifications, and remove broken PCs from booking availability." action={<Button onClick={openCreate}><Plus size={17} />Add PC</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {pcs.map((pc) => (
          <Card key={pc.databaseId} className="p-5">
            <div className="flex items-start justify-between"><span className="grid size-11 place-items-center rounded-xl bg-mfu-50 text-mfu-700"><Cpu size={21} /></span><Badge tone={pc.status === 'Available' ? 'green' : pc.status === 'Maintenance' ? 'red' : 'slate'}>{pc.status}</Badge></div>
            <h2 className="mt-5 text-xl font-bold text-slate-950">{pc.id}</h2>
            <p className="mt-1 text-sm text-slate-500">{pc.room}</p>
            <p className="mt-4 min-h-12 border-t border-slate-100 pt-4 text-sm leading-6 text-slate-600">{pc.specification || 'No specification recorded.'}</p>
            {pc.notes && <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">{pc.notes}</p>}
            <Button className="mt-4 w-full" variant="secondary" onClick={() => openEdit(pc)}><Pencil size={16} />Edit PC</Button>
          </Card>
        ))}
      </div>

      <Modal open={editingId !== null} onClose={close} title={editingId === 'new' ? 'Add PC' : 'Edit PC'} description="Maintenance and inactive PCs cannot receive new bookings.">
        <form className="space-y-4" onSubmit={save}>
          <Field label="PC code" required><Input value={form.code} onChange={change('code')} placeholder="PC-11" /></Field>
          <Field label="Room" required><Input value={form.room} onChange={change('room')} placeholder="SE Lab A · 401" /></Field>
          <Field label="Specification"><Textarea value={form.specification} onChange={change('specification')} placeholder="CPU, RAM, GPU, and installed software" /></Field>
          <Field label="Status" required><Select value={form.status} onChange={change('status')}><option value="available">Available</option><option value="maintenance">Maintenance</option><option value="inactive">Inactive</option></Select></Field>
          <Field label="Notes"><Textarea value={form.notes} onChange={change('notes')} placeholder="Maintenance issue or operational note" /></Field>
          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button type="button" variant="secondary" disabled={busy} onClick={close}>Cancel</Button><Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save PC'}</Button></div>
        </form>
      </Modal>
    </div>
  )
}
