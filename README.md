# Samuel Shadiva — Personal Portfolio

My personal portfolio site at [shadivahlabs.com](https://shadivahlabs.com). Built entirely from scratch — not a template. Features a RAG-powered AI chat assistant that answers questions about my background using my own knowledge base as context.

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────────────┐
│    Nginx     │────▶│  Next.js 15      │     │  Fastify API         │
│  (SSL/proxy) │     │  (Frontend)      │     │  (backend-node)      │
│  port 80/443 │────▶│  port 3000       │────▶│  port 4000           │
└─────────────┘     └──────────────────┘     └────────┬─────────────┘
                                                       │
                    ┌──────────────────┐     ┌────────▼─────────────┐
                    │  FastAPI + RAG   │     │  PostgreSQL + pgvector│
                    │  (backend-python)│────▶│  Redis               │
                    │  port 8000       │     └──────────────────────┘
                    └──────────────────┘
```

The monorepo has four main services, all wired together with Docker Compose:

| Service | Stack | Role |
|---|---|---|
| `frontend` | Next.js 15, TypeScript, Tailwind CSS | UI — portfolio, projects, chat |
| `backend-node` | Fastify, TypeScript, PostgreSQL | REST API — projects, skills, GitHub, admin |
| `backend-python` | FastAPI, pgvector, OpenAI | RAG chat — streaming SSE + fit analysis |
| Infrastructure | Nginx, PostgreSQL, Redis, Docker | Reverse proxy, DB, caching |

## Features

**Portfolio sections**
- Hero with real-time availability status (toggled via admin panel)
- Projects with individual case study pages (dynamic slugs)
- Skills grid with proficiency levels, loaded from the database
- GitHub activity feed (pinned repos + recent commits, Redis-cached)
- Experience timeline
- Contact form

**AI Chat (`/chat`)**

The chat widget is the centrepiece of the site. It uses RAG (Retrieval-Augmented Generation) — instead of a generic LLM answer, it searches a vector database of my actual documented experience and injects the most relevant chunks into the prompt before calling GPT-4.

- Two modes: **Visitor** (general Q&A) and **Recruiter** (structured fit analysis against a job description)
- Streaming via Server-Sent Events — tokens stream to the UI in real time
- Topic classifier guards against off-topic or jailbreak attempts
- Chat history is preserved within a session (last 6 exchanges)
- All exchanges are logged (hashed IP, never raw) for admin review
- Fit analysis: paste a JD → LLM extracts requirements → searches knowledge base per requirement → returns a scored fit report

**Knowledge base**

The RAG knowledge base lives in [`knowledge/`](knowledge/) as plain Markdown files:

```
knowledge/
├── samuel_profile.md   # Bio, background, career goals
├── skills_detail.md    # Deep-dive on each technology
├── experience.md       # Work history and roles
├── faq.md              # Common recruiter questions
└── projects/           # Per-project write-ups
```

The [`scripts/ingest.py`](scripts/ingest.py) script chunks these files, generates embeddings with `text-embedding-3-small`, and stores them in PostgreSQL via the pgvector extension. Cosine similarity search retrieves the top-K most relevant chunks at query time.

**Admin panel (`/admin`)**
- Manage projects (create, edit, reorder, set status)
- Manage skills and proficiency levels
- Toggle availability status (shown in the hero badge)
- View chat logs and analytics

## Tech Stack

**Frontend**
- Next.js 15 (App Router, server components, ISR)
- TypeScript, Tailwind CSS
- DM Sans + Space Grotesk + Geist Mono (Google Fonts)
- Deployed as a standalone Docker image

**Backend (Node.js)**
- Fastify with TypeScript
- PostgreSQL (via `pg`)
- Redis for GitHub API response caching
- Rate limiting, request sanitization, cookie-based auth for admin

**Backend (Python)**
- FastAPI with async streaming
- OpenAI SDK (`gpt-4o-mini` for chat, `text-embedding-3-small` for embeddings)
- pgvector for cosine similarity search
- psycopg2 for PostgreSQL

**Infrastructure**
- Docker Compose (all services)
- Nginx reverse proxy with Let's Encrypt SSL
- Oracle Cloud VPS (Ubuntu)
- GitHub Actions for CI/CD

## Local Development

**Prerequisites:** Docker, Node.js 20+, Python 3.11+

1. Copy the environment file and fill in your secrets:
   ```bash
   cp .env.example .env
   ```

2. Start all services:
   ```bash
   docker compose up --build
   ```

3. Seed the database:
   ```bash
   python scripts/seed_projects.py
   python scripts/seed_skills.py
   ```

4. Ingest the knowledge base:
   ```bash
   python scripts/ingest.py
   ```

The frontend runs on [http://localhost:3000](http://localhost:3000) and the API on [http://localhost:4000](http://localhost:4000).

**Frontend only** (without Docker):
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

See [`.env.example`](.env.example) for the full list. Key variables:

| Variable | Description |
|---|---|
| `OPENAI_API_KEY` | For chat completions and embeddings |
| `POSTGRES_PASSWORD` | PostgreSQL password |
| `ADMIN_SECRET` | Secret key for admin panel access |
| `NEXT_PUBLIC_API_URL` | Points the frontend at the API (`http://localhost:4000` in dev) |

## Deployment

The project is deployed on an Oracle Cloud VPS via Docker Compose. Nginx handles SSL termination (Let's Encrypt) and routes traffic to the appropriate service. A GitHub Actions workflow builds and pushes images on merge to `main`.

---

Built by [Samuel Shadiva](https://shadivahlabs.com) — Flutter, Python, and AI engineer based in Nairobi, Kenya.
