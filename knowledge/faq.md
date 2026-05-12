# Samuel Shadiva — Frequently Asked Questions

## Technical Preferences

**Why Flutter over React Native?**
Flutter compiles to native ARM code — it does not use a JavaScript bridge at runtime. React Native communicates with native components through a JS bridge, which adds latency and can cause jank on complex UIs. Flutter's widget system gives pixel-perfect control over every element on screen, and Dart is a strongly typed language that catches more errors at compile time than JavaScript does. Having one codebase that produces truly native performance on both Android and iOS without dealing with JS bridge issues or platform-specific module incompatibilities makes Flutter the right choice for production mobile apps. Practically: I have shipped two Play Store apps in Flutter and have 4 years of experience in it — it is where I am most productive.

**When do you use Django vs FastAPI?**
Django when the project needs a full-featured backend with ORM, admin panel, auth, and REST framework out of the box — projects like the Uasin Gishu IVMS or IVY Wardrobe App where I needed all those pieces quickly. FastAPI when the service needs to be async-first and fast — specifically for AI services that stream responses or handle high-frequency inference calls. FastAPI also auto-generates OpenAPI documentation which speeds up development when building APIs consumed by other services. For this portfolio's RAG service, FastAPI was the right choice because streaming AI responses token-by-token requires native async support.

**What is your preferred state management in Flutter?**
Riverpod. It is compile-safe (errors are caught at compile time, not runtime), providers are declared outside the widget tree (making them easy to override in tests), and it handles async state naturally with AsyncValue. Bloc is powerful for very complex flows but adds significant boilerplate for simpler cases. Provider works but has less type safety than Riverpod.

**What AI models do you use?**
OpenAI GPT-4o-mini for most tasks — it is fast, cheap, and capable enough for classification, scoring, and structured output extraction. GPT-4o for tasks requiring deeper reasoning (complex application drafting). Google Gemini 2.5 Flash Preview for high-frequency daily analysis jobs (fast and low-cost). Gemini 3 Pro for longer synthesis tasks (monthly/yearly journal analysis) where the larger context window and stronger reasoning matter.

**What is your prompt engineering framework?**
RCTF: Role (what persona the AI should adopt), Context (full background of the use case), Task (what to do with the context), Format (exact output structure required). I use structured JSON outputs wherever the response feeds into application logic — it makes AI integrations reliable and testable.

**What is your local development setup?**
Windows 11 with WSL (Ubuntu) for Linux tooling. VS Code as primary IDE, Android Studio for Flutter device emulation and platform-specific debugging. Git Bash for terminal. PostgreSQL via pgAdmin. Redis in WSL.

## Career & Availability

**Are you open to contract/freelance work?**
Yes, for the right project. Preference is for longer-term engagements (3+ months) with a clear scope rather than one-off tasks. Available to discuss.

**What is your availability given the MSc?**
The MSc at Strathmore is part-time evening study. Daytime hours are fully available for work. No conflict with a standard 9-5 or equivalent remote schedule.

**What kind of company or team excites you most?**
Early-to-mid stage (seed to Series B) where engineering decisions have real product impact. Domains: fintech, productivity, AI-native products. Team size: 5-30 engineers — large enough to have structure, small enough that your work is visible and meaningful. I am not interested in pure maintenance roles or roles with no AI or product component.

**Are you open to relocation?**
Not until MSc completion in June 2027. Within Nairobi and accessible to Strathmore University is fine for hybrid/in-person arrangements. Fully remote is ideal.

**What timezone and how does that affect remote work?**
EAT (UTC+3). This overlaps with European morning hours (EU 9am = EAT 11am) which works well for European teams. Overlaps with US East Coast from about 3pm-6pm EAT. With async communication, US timezone differences are manageable. I have experience working on projects with no real-time synchronization requirement.

**What is your salary expectation?**
Open to discussion based on role, company stage, and scope. Refer Samuel directly for specifics — shadivasam@gmail.com.

## About Specific Projects

**What is your most technically challenging project?**
Miseflow. It required native Kotlin (Android Accessibility Service and overlay windows), Flutter platform channels, and real-time AI response generation — three technical domains that don't normally need to work together. Most Flutter developers never need to write Kotlin. Building this forced a deep understanding of Android's permission model and inter-process communication at the system level.

**What project are you most proud of?**
The KSG ICT Platform. It is the most complete system I have built — from requirements gathering with a real institutional client, through architecture, full-stack development, Dockerized deployment, live production usage by real staff, and ongoing maintenance. It demonstrates the full cycle of professional software development, not just the coding part.

**Do you have experience leading or teaching other developers?**
Yes. Conducted mobile development training workshops at Sabatia Vocational College, teaching Flutter and Kotlin fundamentals to students. The workshops covered practical mobile development from setup through building and testing a simple app. Participants ranged from beginners to those with some programming background.

**What is the most complex system you have architected?**
The KSG ICT Platform from a systems perspective — multi-role RBAC, WebSocket real-time layer, asset lifecycle state machine, background job scheduling, email notifications, SLA tracking, and full Docker deployment. The Miseflow app from a cross-platform architecture perspective — Flutter + Kotlin + Android system APIs + OpenAI integration all working together.

## Working Style

**How do you handle a problem you have never seen before?**
First, I read the official documentation — not tutorials, the actual docs. Then I search for the specific error message or behaviour in the relevant GitHub issues. If I am still stuck after 30-45 minutes, I write up exactly what I have tried and what I know, and bring that to the team or community (Stack Overflow, Discord). I do not spend hours debugging alone when a quick conversation could unblock in minutes. The key is coming with context, not just a question.

**How do you communicate in a remote team?**
I prefer async by default — I write clear, self-contained messages that don't require a follow-up to understand. For complex or ambiguous topics, I will set up a quick call rather than send a wall of text. I give progress updates proactively — if a task is taking longer than expected, I surface that before the deadline, with context on why and a revised estimate.

**What does your development process look like for a new feature?**
Requirements verification first (are we solving the right problem?). Then phased implementation plan — what is the smallest unit of value I can deliver first? Build that. Verify it works end to end. Then extend. I document decisions (why this approach, what was considered and rejected) because that context is often more valuable than the code itself six months later.

**How do you approach a new codebase?**
Start with the entry point (main.py, index.ts, lib/main.dart). Trace one complete user flow end to end — from HTTP request to database and back. Read the schema/models before reading the business logic. Understand the data model first, then the operations on it.