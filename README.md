# SMC Hub

Internal CRM and player management system for SMC Hockey Agency.

Built with Next.js 15, React 19, TypeScript, and Tailwind CSS. This is a frontend-only
prototype: all data is seeded from mock data and persisted to the browser's
`localStorage`. There is no backend yet.

## Modules

- **Dashboard** — stats, upcoming contract expirations, tasks, recent activity
- **Players** — full player profiles (general, representation, financial, contact,
  documents, notes, follow-up)
- **Clubs** — partner club directory
- **Contacts** — independent contact database
- **Tasks** — task management connected to players

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To reset all data back to the seeded mock data, clear `localStorage` for the site
(all keys are prefixed with `smc-hub:`).
