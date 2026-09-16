import { Cpu, MapPin, MemoryStick, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card, PageHeader } from '../../components/ui/Card'
import { Badge } from '../../components/ui/StatusBadge'
import { mockPcs } from '../../data/mockPcs'

export function PcListPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="SE Lab inventory" title="Lab PCs" description="Browse the demo workstation inventory and current availability." action={<Link to="/book"><Button><Plus size={17} />Create request</Button></Link>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {mockPcs.map((pc) => (
          <Card key={pc.id} className="p-4 sm:p-5">
            <div className="flex items-start justify-between"><span className="grid size-11 place-items-center rounded-xl bg-mfu-50 text-mfu-700"><Cpu size={21} /></span><Badge tone={pc.status === 'Available' ? 'green' : pc.status === 'Booked' ? 'violet' : 'amber'}>{pc.status}</Badge></div>
            <h2 className="mt-5 text-xl font-bold text-slate-950">{pc.id}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500"><MapPin size={14} />{pc.room}</p>
            <p className="mt-4 flex items-start gap-2 border-t border-slate-100 pt-4 text-sm leading-6 text-slate-600"><MemoryStick size={15} className="mt-1 shrink-0 text-slate-400" />{pc.specification}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
