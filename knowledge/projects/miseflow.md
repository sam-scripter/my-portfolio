# Miseflow — AI-Powered Conversation Assistant

## Overview
Miseflow is an Android utility app that reads the content of open WhatsApp conversations and provides AI-generated response suggestions directly in a floating overlay window — without leaving WhatsApp. It is privacy-conscious: conversation content is processed locally as much as possible, and users control when the AI reads their screen.

## The Problem
WhatsApp is the primary communication channel for both personal and professional conversations in Kenya and across Africa. Crafting the right response — especially in professional or sensitive contexts — requires mental energy. Miseflow provides an AI assistant that understands the conversation context and suggests responses in the user's chosen tone.

## Technical Architecture

### The Flutter + Kotlin Split
This is the most technically complex project in Samuel's portfolio from an architecture standpoint. Flutter cannot natively:
1. Create a floating overlay window that persists over other apps
2. Read on-screen content from other apps

Both of these capabilities are required for Miseflow's core functionality. The solution: write these features in Kotlin (native Android), then communicate with Flutter via platform channels.

**Kotlin layer handles:**
- `SYSTEM_ALERT_WINDOW` permission — creates and manages the floating overlay window that stays on top of WhatsApp
- Android Accessibility Service — reads visible on-screen text from any app the user has open, including WhatsApp chat bubbles
- Content extraction logic — identifies that WhatsApp is the foreground app, locates the chat message text in the accessibility node tree, extracts the last 10 messages

**Flutter layer handles:**
- Authentication (user login and subscription management)
- The UI inside the floating overlay window — chat interface with the AI, tone selector, response suggestions
- Platform channel communication — receives extracted conversation text from Kotlin, sends it to the AI API, receives and displays the response

**Platform channel flow:**
```
Kotlin detects WhatsApp open
→ Kotlin reads last 10 messages via Accessibility Service
→ Kotlin sends message array to Flutter via MethodChannel
→ Flutter formats prompt with conversation context + selected tone
→ Flutter calls OpenAI API
→ Flutter displays AI response suggestions in overlay
→ User copies preferred suggestion and pastes into WhatsApp
```

### AI Integration
Multiple OpenAI models available to users based on subscription tier (gpt-4o-mini for base tier, gpt-4o for premium). The prompt includes:
- The last 10 messages from the conversation (with sender labels)
- The user's selected tone: Funny, Serious, Professional, Casual, Empathetic
- Instruction to generate 3 response options, short enough to be realistic WhatsApp messages

### Privacy Architecture
The Accessibility Service only activates when the user explicitly triggers the overlay. It does not run continuously in the background reading all screen content passively. The user taps the floating button to activate reading — this is a deliberate privacy design choice.

## Subscription Model
Free tier: limited AI calls per day, gpt-4o-mini only
Premium tier: higher limits, access to gpt-4o

## Current Status
Built and tested. Not currently on the Play Store — was a proof-of-concept and technical exploration project.

## Why This Project Matters (Technically)
Miseflow represents Samuel's deepest dive into native Android development. Most Flutter developers never need to touch Kotlin — Miseflow required understanding Android's permission model, the Accessibility Service API, overlay window management, and platform channel communication. It pushed the boundaries of what Flutter is designed to do.