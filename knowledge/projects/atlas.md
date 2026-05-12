# Atlas — Autonomous Job Search Agent

## Overview
Atlas is an autonomous AI pipeline that automates the job search process for software engineers. It discovers job postings, evaluates each one against Samuel's professional profile using an LLM scoring system, drafts tailored applications for strong matches, and sends results via email — all without any human trigger. It runs three times per day on a schedule on Oracle Cloud VPS.

The name Atlas reflects its purpose: carrying the operational weight of job searching so the engineer can focus on building.

## The Problem
Technical job searching is high-friction and unsystematic:
- Job boards surface hundreds of irrelevant postings for every relevant one
- Evaluating each posting manually is time-consuming and inconsistent
- Writing tailored applications for every viable role is labour-intensive
- Most engineers apply reactively (when they have time) rather than systematically

Atlas solves this by making job discovery and triage continuous and automatic.

## Architecture — The Full Pipeline

### Stage 1: Discovery (RSS Ingestion)
Atlas subscribes to RSS feeds from job boards and company career pages. On each run (3x daily), it fetches new postings from all feeds and deduplicates against already-processed postings stored in the database.

### Stage 2: Pre-Filter Layer (No LLM cost)
Before any API call, each raw posting passes through a hard filter:
- Location check: if not remote and not Nairobi/Kenya — discard
- Seniority check: if "10+ years required" or "Staff/Principal Engineer" — discard  
- Exclusion list: specific industries or company names marked as not relevant — discard
- Keyword relevance: if zero keywords from [Flutter, Python, Django, FastAPI, AI, Machine Learning, Mobile, Android] match the posting — discard

This layer filters approximately 60-70% of raw postings before any LLM call, directly reducing API cost and latency.

### Stage 3: LLM Scoring (GPT-4o-mini)
For postings that pass pre-filters, the scoring prompt runs.

**Prompt structure (RCTF framework):**
- Role: "You are a senior hiring manager at a technology company evaluating a candidate"
- Context: Samuel's full professional profile — skills, experience, projects, education
- Task: "Evaluate the following job posting. Score how well the candidate matches the requirements on a scale of 1-10. Consider: technical skill match, experience level match, and role type alignment."
- Format: Strict JSON — { "score": integer, "reasoning": string (max 100 words), "matched_skills": array, "missing_skills": array, "application_angle": string }

### Stage 4: Score-Based Routing
- **Score ≥ 8**: Draft a tailored application using the `application_angle` from the scoring output, email the draft to Samuel, store in database with status "applied"
- **Score 6-7**: Email the posting details to Samuel with matched/missing skills summary, store in database with status "review"  
- **Score 5**: Store in database with status "borderline" — used for scoring accuracy analysis
- **Score < 5**: Discard

**Token optimization note:** Only postings scored ≥ 6 trigger an application draft prompt (a second LLM call). Postings scored 5 are stored as-is. This means the expensive application drafting step only runs on the minority of high-confidence matches.

### Stage 5: Application Drafting (GPT-4o-mini, conditional)
For scores ≥ 8:
- Prompt context: Samuel's profile + job posting + the `application_angle` identified during scoring
- Output: A tailored cover letter and email subject line
- Delivered to Samuel's email immediately

## Deployment
Runs on Oracle Cloud VPS. Python script scheduled via cron (3x daily). Results stored in PostgreSQL database.

## Current Status
Atlas is in active development. The core pipeline is built and has been tested manually. Specific bugs being resolved before stable scheduled deployment:
- Occasional RSS feed parsing failures on non-standard feed formats
- Application draft prompt producing inconsistent lengths (sometimes too short, sometimes too long for an email)
- Database deduplication logic has an edge case with reposts of the same job

Target: fully scheduled, stable autonomous operation within the next few weeks.

## Tech Stack
Python, OpenAI API (GPT-4o-mini), RSS parsing (feedparser), PostgreSQL, Oracle Cloud VPS, cron scheduling, SMTP email delivery

## Lessons Learned
The scoring rubric required calibration. Initial runs produced too many scores in the 6-7 range — the model was being generous. Tightening the context to include explicit criteria ("a score of 8 requires: Flutter as a primary requirement, Python or AI in the stack, remote-friendly, mid-level experience range") improved score distribution significantly. Prompt precision matters as much as prompt completeness.