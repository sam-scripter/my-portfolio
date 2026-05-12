# Stratum — AI-Powered Financial Tracking App

## Overview
Stratum is a personal finance tracking app for Android, published on the Google Play Store. It is built for M-Pesa users in Kenya — the dominant mobile money platform with over 30 million active users. The core insight: financial tracking fails because it requires manual data entry, which breaks the habit within days. Stratum eliminates data entry entirely by automatically reading M-Pesa SMS notifications, parsing them, and recording every transaction without the user doing anything.

## The Problem
Manual financial tracking has a near-universal dropout problem. Users start with good intentions, miss a few entries, and eventually abandon the tool. Every existing budgeting app on the Kenyan market still requires the user to manually log transactions. Stratum's insight was that M-Pesa already sends an SMS for every transaction — that SMS contains all the data needed (amount, merchant, transaction type, timestamp, balance). If you can parse that SMS automatically, the tracking is zero-effort.

## Technical Architecture

### SMS Listener
Android allows apps to register a BroadcastReceiver for the `SMS_RECEIVED` intent. When an M-Pesa SMS arrives, the receiver fires, captures the raw SMS text, and passes it to the parsing pipeline — all in the background, before the user even opens the notification.

### M-Pesa SMS Parsing
M-Pesa SMS messages follow predictable formats depending on transaction type (send money, receive money, pay bill, buy goods, withdraw, deposit). A regex pipeline identifies the transaction type from the SMS content, then extracts: amount, merchant/recipient name, reference number, transaction cost, and new balance.

Merchant names from M-Pesa SMS are often messy (e.g. "NAIVAS SUPERMARKETS LT*001" or "QUICKMART-THIKA RD"). GPT-4o-mini is used to clean and standardize these merchant names into readable labels and assign a spending category (Groceries, Transport, Utilities, etc.).

### Storage — Hive
Hive (pure Dart NoSQL key-value store) was chosen over SQLite because:
- No native bridge: Hive runs entirely in Dart, meaning no platform channel latency on every read/write
- Transaction tracking involves frequent small writes (one per SMS received) — Hive handles this significantly faster than SQLite
- Offline-first: all data lives locally on device, no internet required for core functionality

### State Management — Riverpod
Riverpod manages the app state: transaction list, category summaries, filter state, analysis results. Chosen for compile-time safety and testability.

## AI Integration — GPT-4o-mini
Two AI use cases:

**1. Merchant name cleaning and categorization:**
Prompt (RCTF framework):
- Role: Financial data processing assistant
- Context: Raw M-Pesa merchant names extracted from SMS are often truncated, contain special characters, or include branch codes
- Task: Clean the merchant name to a readable label and assign one spending category from a fixed list
- Format: JSON — { "clean_name": string, "category": string }

Hallucinations are mitigated by providing a fixed category list and instructing the model to choose from only those options.

**2. Monthly financial analysis:**
Runs on demand. Passes the user's categorized transaction summary for the month (not raw transactions — a pre-aggregated summary to minimize tokens). Returns: top spending categories, month-over-month comparison, unusual spending patterns, and 3 actionable recommendations.

## Why Hive Over SQLite
Hive is a pure Dart implementation — it runs on the Dart VM without any native bridge. SQLite in Flutter requires the sqflite plugin which uses platform channels (Dart → Android/iOS native → back to Dart). For an app that writes a transaction every time an SMS arrives, the bridge latency adds up. Hive eliminates it entirely.

## Current Status
- Live on Google Play Store
- Actively maintained

## Lessons Learned
The SMS parsing regex required more edge cases than expected — M-Pesa has changed its SMS format multiple times over the years and different transaction types have subtly different structures. Building a robust parser required collecting many real SMS examples. The lesson: never assume a third-party data format is consistent — always test against real-world data.