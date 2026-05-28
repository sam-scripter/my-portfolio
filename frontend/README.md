# Frontend — Next.js 15

The portfolio UI. Built with Next.js 15 App Router, TypeScript, and Tailwind CSS.

See the [root README](../README.md) for the full project overview and architecture.

## Development

```bash
npm install
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000). Requires `NEXT_PUBLIC_API_URL` to point at a running instance of `backend-node` (default: `http://localhost:4000`).

## Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── layout.tsx        # Root layout + global metadata
│   ├── page.tsx          # Home (ISR, revalidates every hour)
│   ├── projects/[slug]/  # Individual project case study pages
│   ├── chat/             # AI chat page
│   ├── admin/            # Admin panel
│   ├── sitemap.ts        # Dynamic sitemap (/sitemap.xml)
│   └── robots.ts         # Robots rules (/robots.txt)
├── components/
│   ├── sections/         # Portfolio sections (Hero, Projects, Skills, etc.)
│   ├── chat/             # Chat widget components
│   └── ui/               # Shared UI primitives (Button, Badge, Card)
├── lib/
│   ├── api.ts            # All backend API calls
│   └── utils.ts
├── hooks/
│   └── useChat.ts        # Chat state + SSE streaming logic
└── types/index.ts        # Shared TypeScript types
```

## Build

```bash
npm run build
npm start
```

The Dockerfile builds a standalone output (`output: "standalone"` in `next.config.ts`) for minimal image size.
