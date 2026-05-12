# Technical Skills — Detailed

## Mobile Development

### Flutter & Dart — Expert
4 years of active Flutter development. Have shipped two apps to the Google Play Store (Stratum and Number Your Days), built a vendor management app and wardrobe app for IVY Community, a fuel/repair order management system for Uasin Gishu County Government (Flutter frontend), a WhatsApp AI assistant app called Miseflow, and the current portfolio project (Next.js, but Flutter is my primary mobile platform).

State management preference: Riverpod. I prefer Riverpod over Bloc and Provider because it is compile-safe — errors are caught at compile time, not runtime — and it is more testable because providers are declared outside the widget tree, making them easy to override in tests. Bloc is powerful but verbose for smaller apps; Provider works but has less safety guarantees.

Most complex Flutter problem solved: Building Miseflow. Flutter does not support floating overlay windows or on-screen content reading natively — these are Android-level capabilities. I solved this by writing a Kotlin backend that handled the floating window, read on-screen content from the active app (e.g. WhatsApp conversations), and passed that data to the Flutter layer which handled the AI chat UI and authentication. This required deep understanding of both Flutter's platform channel mechanism and Android's Accessibility Service API.

Certified: Completed "The Complete Flutter Development Bootcamp with Dart" by Dr. Angela Yu on Udemy (October 2023, 29 hours).

### Firebase — Proficient
Used across multiple projects:
- **Number Your Days**: Firestore for journal entry storage (offline persistence enabled), Firebase Auth for user authentication, Cloud Functions for a daily scheduled analysis job that runs at midnight — reads the day's entries and generates AI insights including sentiment, patterns, and a daily summary. Weekly insights are built from daily summaries, monthly from weekly, yearly from monthly — a layered summarization strategy that keeps token costs low.
- **Vendor App (IVY)**: Firestore for real-time sync of vendor registrations, categories, and products. Real-time listeners keep the admin dashboard live without manual refresh.
- **Wardrobe App (IVY)**: Initially Firebase, then migrated to Django backend when the 3D modeling requirements made a Python backend necessary. Managed the migration including data transfer.

### Android SDK & Kotlin — Working Knowledge
Primary use: implementing native Android features that Flutter cannot handle. Key example: Miseflow required Android's Accessibility Service (to read on-screen content from other apps) and the floating overlay window (SYSTEM_ALERT_WINDOW permission). These are Android-only APIs with no Flutter plugin equivalent. I wrote the Kotlin service layer for both, then passed data back to Flutter via platform channels.

Also taught Kotlin fundamentals at Sabatia Vocational College as part of a mobile development training workshop.

---

## AI & Automation

### LLM Integration — Expert
APIs used: OpenAI (GPT-4o-mini, GPT-4o) and Google Generative AI (Gemini 2.5 Flash Preview, Gemini 3 Pro).

Real integrations built:

**Stratum (GPT-4o-mini):** Financial analysis feature. After parsing M-Pesa transactions from SMS, the app runs a monthly analysis on spending patterns — categories with highest spend, trends, anomalies, and recommendations. The AI also cleans merchant names (M-Pesa SMS merchant names are often truncated or inconsistent — e.g. "NAIVAS LTD*KIAMBU" becomes "Naivas Supermarket").

**Number Your Days (Gemini 2.5 Flash / Gemini 3 Pro):** Tiered analysis system. Gemini 2.5 Flash handles daily analysis (faster, cheaper for high-frequency calls). Gemini 3 Pro handles weekly, monthly, and yearly analysis (more capable for longer context). Each analysis produces a structured output: patterns identified, positive behaviours, areas for improvement, recommendations, and a compressed summary. The summary feeds the next tier's analysis — so monthly analysis ingests weekly summaries rather than raw entries, keeping context windows manageable.

**Atlas (GPT-4o-mini):** Job scoring and application drafting. The LLM acts as a hiring manager evaluating job postings against Samuel's professional profile. Scores 1-10. Above 7: drafts a tailored application and emails it. Above 6: sends job details to email for manual review. Above 5: stores in database for scoring accuracy analysis. Below 5: discarded. Pre-LLM filtering runs first so irrelevant postings never hit the API.

**Miseflow (OpenAI, multiple models):** Users choose from multiple models based on their subscription tier. The AI reads the last 10 messages from an open WhatsApp chat and generates response suggestions in the user's chosen tone (funny, serious, professional, casual, etc.).

### Prompt Engineering — Expert
Framework used consistently: **RCTF**
- **R — Role**: Define what persona the AI should adopt. E.g. "You are a senior hiring manager at a technology company."
- **C — Context**: Provide the full background. E.g. for Atlas, this is Samuel's complete professional profile, skills, and experience.
- **T — Task**: What the AI must do, referencing the context. E.g. "Evaluate the following job posting and score how well Samuel matches the requirements on a scale of 1-10."
- **F — Format**: Specify the exact output structure. E.g. "Respond only with a JSON object containing: score (integer 1-10), reasoning (string, max 100 words), matched_skills (array of strings), missing_skills (array of strings)."

Structured outputs (JSON) are used wherever the response feeds into application logic — this avoids parsing LLM prose and makes the system reliable. Hallucinations are mitigated by constraining the AI to only use provided context ("answer only from the information provided; if you cannot determine an answer from the context, say so").

### Autonomous AI Agents — Proficient
Atlas is the primary example. What makes it autonomous:
- Runs on a schedule (3 times per day) on Oracle Cloud VPS with no human trigger
- Discovers jobs from RSS feeds without human input
- Makes a scoring decision (LLM call) for each job
- Based on score, independently decides: draft application, email digest, store for analysis, or discard
- For high-scoring jobs, drafts and emails a tailored application — the entire flow from discovery to outreach requires zero human involvement

Atlas is currently in active development resolving specific pipeline bugs before a stable scheduled deployment.

### Token Optimization — Proficient
Token optimization strategy in Atlas:
1. **Pre-filter layer** (free): Before any LLM call, the job posting is checked against a set of hard exclusion rules — wrong location (if not remote), seniority level mismatch (e.g. 10+ years required), excluded industries. Postings that fail these checks are discarded without an LLM call.
2. **Keyword relevance check** (lightweight): A simple keyword match against core skills (Flutter, Python, Django, AI) runs before the scoring prompt. Postings with zero keyword matches skip to a low score without using the full scoring prompt.
3. **Tiered scoring prompt**: The scoring prompt only runs on postings that pass the pre-filters. This is the most expensive step and should only run on plausible matches.

This matters in production because LLM API calls have both latency and cost. A system processing hundreds of job postings per day without optimization could spend 10-20x more in API costs than necessary. The pre-filter layer reduces LLM calls by an estimated 60-70% of raw ingested postings.

---

## Backend Development

### Python — Intermediate (Actively Advancing)
Current use: Django for REST APIs, beginning FastAPI for async services, and now building AI pipelines. I have not yet written standalone Python scripts or data pipelines outside of framework contexts — this is an active development area. The RAG service in this portfolio project is my first FastAPI implementation and first Python AI pipeline outside of Django.

Honest level: Stronger in Django than in raw Python. Growing rapidly into scripting, AI tooling, and async Python.

### Django — Proficient
Projects:
- **Uasin Gishu County Government IVMS**: Full Django backend. Roles: Driver, Secretary, Transport Manager, Fuel Attendant, Mechanic, Repair Manager, Super User (Admin). Complex relational schema covering departments, vehicles, employees, fuel stations, fuel orders, repair orders, and reporting. Google Maps API integration for distance-based fuel quota calculation.
- **Wardrobe App (IVY)**: Django backend for a fashion e-commerce and virtual try-on platform. Handles user roles (Super User, Admin/Store Owner, Attendant, Customer), product/inventory management, order processing, and the Measurement API (computer vision pipeline using OpenPose + SMPLX). Migrated from Firebase to Django when 3D modeling requirements demanded server-side Python processing.
- **FreshMarikiti**: Django REST API for a multi-vendor e-commerce platform. User authentication, product management, and order processing endpoints.

Experience: Django ORM (complex queries, relationships, migrations), Django REST Framework, Django admin panel for data entry and management, JWT authentication.

### FastAPI — Working Knowledge (Growing)
Currently building the RAG microservice for this portfolio project in FastAPI. Chosen over Django here because: async-first (essential for streaming AI responses token-by-token via SSE), faster response times for high-frequency AI calls, and auto-generated OpenAPI docs at /docs which aids development.

### PostgreSQL — Proficient
Schema design experience across multiple projects:
- **IVMS (Uasin Gishu)**: Complex multi-role schema — Departments, Employees, Vehicles, Fuel Stations, Fuel Vendors, Fuel Orders (with approval chain tracking), Repair Orders, Notifications, Reports, Budget. Designed to handle the full approval workflow: Driver submits → Secretary reviews → Transport Manager approves → Fuel Attendant fulfils.
- **KSG ICT Platform**: Full asset lifecycle schema (PROCURED → INSPECTED → AVAILABLE → ASSIGNED → UNDER MAINTENANCE → RETIRED), service desk tickets with SLA tracking, role-based access, audit logs, notification events. Built with Prisma ORM on top of PostgreSQL.
- **This portfolio project**: pgvector extension for vector similarity search (1536-dimensional embeddings for RAG), all five tables designed and deployed.

### Node.js & Express / Fastify — Proficient
Built the full backend for the KSG ICT Platform using Node.js + Express: REST API, JWT auth with refresh tokens, role-based access control, Socket.io for real-time WebSocket notifications, Nodemailer for email delivery, node-cron for scheduled jobs (weekly summaries, monthly reports, SLA breach alerts), Prisma ORM for database access. Deployed on Oracle Cloud VPS using Docker + Nginx.

Currently using Fastify (TypeScript) for the portfolio backend API gateway.

### REST API Design — Proficient
Designed and built REST APIs for: IVY Vendor/Wardrobe system (Django REST Framework), Uasin Gishu IVMS (Django), KSG ICT Platform (Express), FreshMarikiti (Django). Consistent approach: resource-based routes, HTTP verbs used correctly, structured error responses with codes and messages, JWT authentication, role-based middleware.

---

## Tools & DevOps

### Git — Working Knowledge
Basic to intermediate: commit, push, pull, branching, merging. Have used Git across all projects. Currently working on improving CI/CD workflow — this portfolio project is the first where a push to main automatically deploys to the VPS via GitHub Actions.

### Docker — Working Knowledge
Deployed the KSG ICT Platform on Oracle Cloud VPS using Docker Compose with four containers: PostgreSQL database, Node.js backend, React frontend served by Nginx, and Nginx reverse proxy with Let's Encrypt SSL. Have practical experience writing Dockerfiles and docker-compose.yml, managing container networking, volume persistence, and environment variable injection.

### Google Maps API — Proficient
Implemented in the Uasin Gishu IVMS: drivers select source and destination from an interactive Google Map (either current GPS location or custom pin). The selected coordinates are passed to the Maps Distance Matrix API which returns the road distance in km. The system then calculates fuel quota: distance × vehicle fuel consumption rate (litres/100km) = litres required. This automated calculation replaced a manual process and directly mitigated fuel over-requesting by making the approved quantity mathematically derived from the actual route.

### Oracle Cloud VPS — Working Knowledge
Running two live deployments on Oracle Cloud Free Tier VPS instances:
- KSG ICT Platform: Docker Compose, Nginx, Let's Encrypt SSL, PostgreSQL, Socket.io
- Atlas (in development): Scheduled Python scripts

### React.js — Proficient
Built the KSG ICT Platform frontend in React.js + Vite with Tailwind CSS, React Query for data fetching and caching, Zustand for auth state, Socket.io client for real-time notifications, and React Router for navigation. Complex multi-role UI with different dashboards and permissions per role.

### Next.js — Learning (Currently Building)
This portfolio project is my first Next.js application. Transitioning from React.js with purpose: App Router, ISR (Incremental Static Regeneration), server-side rendering for SEO, and the ability to auto-refresh data without redeployment.

---

## Honest Gaps

**Python beyond Django**: I know Django well. Raw Python scripting, data pipelines, and AI-specific tooling (LangChain, embedding pipelines, async Python) are areas I am actively building — this portfolio project is part of that progression.

**FastAPI**: First real FastAPI project is this portfolio. Comfortable with the concepts, building practical experience now.

**Next.js**: First project is this portfolio. React knowledge transfers well; App Router and SSR patterns are being learned hands-on.

**Testing**: I write manually tested code. Automated testing (unit tests, integration tests) is an area I have not invested in deeply yet and I am aware this is a gap for production-grade work.

**6-month goals**: Be fully proficient in Python (scripting, AI pipelines, async), ship Atlas as a fully stable autonomous system, build confident Next.js skills through this portfolio, and begin writing tests for new code.