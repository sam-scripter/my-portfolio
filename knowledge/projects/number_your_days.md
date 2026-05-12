# Number Your Days — Intentional Journaling App

## Overview
Number Your Days is a journaling app for Android, published on the Google Play Store, and accompanied by a web companion at number-your-days.web.app. It is designed around intentional, reflective journaling — not a diary, but a structured tool for self-awareness. What differentiates it from generic journaling apps is an AI layer that analyzes entries over time and surfaces patterns, habits, emotional trends, and personalized recommendations — turning private writing into actionable self-insight.

## The Problem
Generic journaling apps (Google Keep, Apple Notes, Day One) treat entries as isolated text. There is no synthesis, no pattern recognition, no feedback loop. A user can journal every day for a year and have no structured insight into what their writing reveals about their life. Number Your Days turns the accumulated writing into a personal intelligence layer.

## Technical Architecture

### Flutter + Firebase Firestore
- Firestore stores journal entries with offline persistence enabled — the app functions fully offline and syncs when back online
- Data structure: user → entries (date, content, mood tag, entry type) → analysis records (daily/weekly/monthly/yearly)
- Firebase Auth handles user authentication (email/password)

### Security
Firestore security rules ensure users can only read and write their own data — no entry from one user is ever accessible to another, even by accident.

## AI Integration — Tiered Analysis System
This is the most technically interesting part of the app. The challenge: AI analysis of journal entries is expensive if done naively (sending all entries every time). The solution is a layered summarization approach that mirrors how humans think about time.

**Daily Analysis (Gemini 2.5 Flash Preview — fast and cheap):**
- Runs via a Cloud Function triggered at midnight
- Analyzes the day's entries: sentiment, topics mentioned, emotional tone, energy level
- Produces a structured output: { patterns, positives, areas_for_reflection, recommendations, daily_summary }
- The `daily_summary` is a compressed 2-3 sentence synthesis of the day — this is stored separately

**Weekly Analysis (Gemini 2.5 Flash Preview):**
- Runs every Sunday at midnight
- Input: the 7 daily_summary strings from the week — NOT the raw entries
- Produces a weekly_summary plus weekly insights

**Monthly Analysis (Gemini 3 Pro — more capable for longer synthesis):**
- Runs at end of each month
- Input: the 4 weekly_summary strings — NOT individual entries or daily summaries
- Produces monthly patterns, habit identification, emotional arc for the month, monthly_summary

**Yearly Analysis (Gemini 3 Pro):**
- Input: 12 monthly_summary strings
- Produces a year-in-review: major themes, growth areas, patterns that persisted, recommendations for the year ahead

**Why this architecture matters:**
Without summarization chaining, a monthly analysis would need to process 30 days × multiple entries = potentially 50,000+ tokens. With chaining, the monthly analysis processes 4 weekly summaries = roughly 800 tokens. Cost reduction: ~98%. Quality is maintained because each summary captures the essence of that period.

## Current Status
- Live on Google Play Store
- Web companion: number-your-days.web.app (note: the web version is an earlier, simpler version — the full-featured app is on Android)

## Lessons Learned
Cloud Functions on Firebase have cold start latency. The midnight analysis jobs occasionally have a 3-5 second cold start. For background jobs this is acceptable; for user-facing features it would not be. This shaped my preference for dedicated backend services (FastAPI) for latency-sensitive AI features.