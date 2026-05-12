# Samuel Shadiva — Professional Profile

## Summary

I am a software and AI engineer based in Nairobi, Kenya, with a Bachelor of Science in Computer Science (Second Class Upper Division, CUEA, 2024) and currently pursuing a Master of Science in Information Technology at Strathmore University (expected June 2027), with a focus on business intelligence and data analytics.

I build production-grade mobile applications in Flutter, web systems in React.js and Node.js, AI-integrated pipelines in Python, and backend APIs in Django and FastAPI. I have shipped two apps to the Google Play Store, built and deployed a government system for Uasin Gishu County, developed a full ICT asset management and service desk platform for Kenya School of Government, and engineered an autonomous AI job search agent. I am not just a developer who knows tools — I think in systems, I care about what the software actually does for the people using it, and I build things end to end.

## What I Build

I build AI-powered, mobile-first products that solve real problems. My mobile apps are built with Flutter for cross-platform support — one codebase running on both Android and iOS. I design them offline-first, using local storage (Hive in Flutter, SQLite where appropriate) so the app never stops working when connectivity drops, and syncs intelligently when back online.

On the AI side, I integrate large language models not as a gimmick but as a genuine feature layer — using them for financial analysis in Stratum, for journaling insights and pattern detection in Number Your Days, and for autonomous decision-making in Atlas (my job search agent). I apply the RCTF prompt engineering framework (Role, Context, Task, Format) consistently and have developed a token optimization approach that runs conditional logic before hitting the LLM, reducing unnecessary API calls and cost.

For backend systems I use Django when I need a robust ORM, admin panel, and REST framework. I use FastAPI when I need speed and async support. For web platforms I use Node.js with Express. On the frontend, React.js is my primary web framework and I am actively building in Next.js (which this portfolio is built on).

I also have hands-on experience with Docker and container orchestration, having deployed the KSG ICT Platform on Oracle Cloud VPS using Docker Compose with Nginx as a reverse proxy and Let's Encrypt for SSL.

## Technical Approach

Before writing a single line of code, I gather and verify requirements, then design a phased implementation plan where each phase produces a complete, working product — not a half-built feature. This means stakeholders always have something functional to evaluate, and I am never in a position where "it will all work once everything is done."

I care about clean architecture, not over-engineering. Every decision should be justifiable. A good example: in Stratum, I chose Hive over SQLite for local storage because Hive is a pure Dart key-value store with no native bridge overhead, which means it is significantly faster for frequent read/writes on a transaction tracking app where every M-Pesa SMS triggers a write. SQLite would have worked, but Hive was the better-justified choice.

For complex requirements I draft a structured questionnaire for stakeholders to turn vague requests into clear, testable specifications. I believe ambiguous requirements are the single biggest source of rework in software projects.

## Work Philosophy

I prefer to start solo on a new problem — get deep understanding before joining a team discussion — because I want to be an asset to the team, not just a participant. Once I have the context, I collaborate actively.

I run projects in phases with clear completion criteria. I use tools like Notion to track steps within each phase and mark completeness. This applies to my own work and to teams I advise.

When I encounter a bug I cannot resolve immediately, I document what I know, what I have tried, and what I suspect — then bring that structured summary to the team. I do not escalate problems, I escalate contexts.

I communicate progress clearly and proactively. If a deadline is at risk, I surface that early with a plan, not an excuse.

## Current Focus

I am actively deepening my skills in agentic AI — autonomous systems that make decisions and take actions without constant human input. Atlas is my primary proof of concept: an autonomous job search pipeline that ingests job postings, scores them against my profile using an LLM, drafts applications for high-scoring matches, and sends results to my email — running three times daily on a schedule without any manual intervention.

I am also expanding my Python skills beyond Django into FastAPI, AI pipelines, scripting, and data analysis — aligned with my MSc coursework in business intelligence and data analytics at Strathmore.

On the frontend, I am transitioning from React.js to Next.js to leverage server-side rendering and ISR for better SEO and performance in professional-grade web products.

## Career Goals

I am looking for a software engineering or AI engineering position where I can build products that matter. What excites me: early-to-mid stage products in fintech, productivity, or AI-native spaces where the engineering decisions have real impact. I am particularly drawn to roles that bridge mobile and AI — building intelligent mobile applications or AI-powered backend systems.

I prefer a focused, outcomes-driven environment over a noisy one. Remote is ideal and where I do my best work. I am reliable, I communicate clearly, and I deliver.

I am not looking for: purely maintenance roles on legacy systems with no greenfield work, roles with no AI or product component, or roles requiring immediate relocation.

## Location & Availability

- Based in: Nairobi, Kenya
- Timezone: EAT (UTC+3)
- Remote: Strongly preferred, fully open to it
- Relocation: Not available until MSc completion (June 2027). Open to opportunities near Nairobi / Strathmore that allow daytime work and evening classes
- MSc schedule: Part-time evening study at Strathmore — daytime fully available for work
- Full-time availability: Yes, daytime hours

## Contact

- Email: shadivasam@gmail.com
- GitHub: github.com/Sam-scripter
- LinkedIn: linkedin.com/in/samuelshadiva/
- Phone: +254 791 050 491