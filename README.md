# SE Lab PC Booking System

A role-based web application for booking computers in the Software Engineering laboratory. It digitizes the university's existing paper-based equipment-borrowing process into a three-step approval workflow.

```text
Student submits request
        ↓
Pending Advisor Approval
        ↓
Pending Dean Approval
        ↓
Booking Approved
```

If either the Advisor or Dean rejects a request, it becomes `rejected` and the student can view the rejection reason. See [plan.md](plan.md) for the full product plan (roles, workflow, data model, and goals).

## Current status: Phase 1 frontend demo

The code in [app/](app/) is a **frontend-only demo** of the workflow above — fake role-based login, mock data persisted in `localStorage`, and no backend. There is no Supabase client, database, migrations, RLS, or real authentication yet. The target architecture (React + Supabase, with roles, RLS, and conflict-safe bookings) is documented in [agent.md](agent.md) and will land in a later phase.

## Getting started

The app lives in the [app/](app/) subdirectory.

```bash
cd app
npm install
npm run dev
```

Open the local URL and choose Student, Advisor, or Dean. Use **Reset demo data** in the profile menu to restore the seeded requests.

### Checks

```bash
cd app
npm run lint
npm test
npm run build
```

## Project structure

```text
.
├── app/          # React + Vite frontend (see app/README.md)
├── plan.md       # Full product plan: roles, workflow, data model
├── agent.md      # Target architecture and rules for future (Supabase-backed) phases
├── .docs/        # Course/gate submission deliverables (requirements, design, compliance)
└── vercel.json   # Deployment config (Vite build from app/)
```

## Deployment

The app deploys to Vercel using [vercel.json](vercel.json), which builds `app/` and serves `app/dist` as a single-page app.

## Roles

- **Student** — views PC availability, creates booking requests, tracks status, cancels eligible bookings.
- **Advisor** — reviews assigned students' requests, approves/rejects at the advisor stage.
- **Dean** — gives final approval/rejection on advisor-approved requests.

See [plan.md](plan.md) for full role permissions and [agent.md](agent.md) for the intended booking status model and conflict-detection rules.
