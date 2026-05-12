# Kenya School of Government — ICT Asset & Service Desk Platform

## Context
Samuel is currently working as an intern/developer at Kenya School of Government (KSG), building and maintaining a full internal ICT management platform. This is his most complete, production-deployed full-stack system to date — live at ksg-ict.duckdns.org, running on Oracle Cloud VPS with Docker, and actively used by KSG staff.

## What the System Does
The KSG ICT Platform replaces two manual, paper-based and spreadsheet-driven processes with a single integrated digital platform:

1. **Asset Management** — tracking all ICT devices (laptops, printers, phones, network equipment) through their full lifecycle from procurement to retirement
2. **Service Desk** — receiving, assigning, tracking, and resolving ICT support requests from all staff across the campus

## Asset Management Module

### The Problem It Solved
Previously: devices were purchased, assigned to staff via paper forms, and tracked in spreadsheets. There was no centralised view of who had which device, no maintenance history, and no verification that the correct person received the correct device.

### Asset Lifecycle
Every asset moves through a defined status chain: `PROCURED → INSPECTED → AVAILABLE → ASSIGNED → UNDER MAINTENANCE → RETIRED`. The system enforces this chain — you cannot skip stages.

### Digital Acceptance
When a supervisor assigns a device, the system emails the staff member a unique link. The staff member clicks the link, reads the Terms and Conditions, and clicks to accept. This click is timestamped and stored as a legally binding digital signature — replacing the paper acceptance form entirely.

### Audit Trail
Every action on every asset — creation, inspection, assignment, status change, return — is logged with the actor and timestamp. Nothing is ever permanently deleted (soft deletes only).

### Bulk CSV Import
Existing spreadsheet data was imported via CSV upload with a row-by-row success/failure report.

## Service Desk Module

### The Problem It Solved
Previously: staff with IT issues called or walked to the ICT office. There was no record of the issue, who handled it, how long it took, or whether the staff member was satisfied. ICT management had zero visibility into workload or performance.

### Ticket Workflow
1. Staff member raises a ticket: title, description, category, priority, office location
2. Supervisor sees all open tickets on dashboard, assigns to a technician
3. Technician is notified immediately (in-app + email)
4. Technician acknowledges, works on the issue, marks resolved with notes
5. Staff member is notified of resolution via email
6. Staff member reviews: Satisfied or Not Satisfied
7. If not satisfied: supervisor is notified, ticket reopened for reassignment

### SLA Tracking
Each priority level has a target resolution time: Critical (4 hours), High (8 hours), Medium (24 hours), Low (72 hours). The system tracks every ticket against its SLA, flags breaches, and alerts supervisors when deadlines are approaching.

### Real-Time Notifications
Built with Socket.io (WebSocket technology). Notifications appear instantly in the browser notification bell without any page refresh. Email notifications sent via Nodemailer for significant events (ticket assignment, resolution, SLA breach).

## User Roles
Four roles with distinct permission sets:
- **Admin**: full system access, user management, reports
- **Supervisor**: most active role — asset inspection and assignment, ticket assignment and escalation, report generation
- **Technician**: receives assigned tickets, resolves them, adds internal notes
- **User**: accepts assigned assets, raises tickets, reviews resolved tickets

## Technical Stack
| Component | Technology |
|---|---|
| Frontend | React.js + Vite |
| Styling | Tailwind CSS |
| State | Zustand (auth state) |
| Data fetching | React Query |
| Real-time | Socket.io client |
| Backend | Node.js + Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Real-time | Socket.io server |
| Email | Nodemailer |
| Scheduler | node-cron |
| Deployment | Docker + Docker Compose |
| Reverse proxy | Nginx + Let's Encrypt SSL |
| Hosting | Oracle Cloud Free Tier VPS |

## Deployment Architecture
Four Docker containers managed by Docker Compose:
- `ksg_db` — PostgreSQL database with volume persistence
- `ksg_backend` — Node.js/Express API server
- `ksg_frontend` — React app built and served by Nginx
- `ksg_nginx` — Reverse proxy, SSL termination, HTTP → HTTPS redirect

This is Samuel's first production Docker deployment. Managing the container networking, volume mounts, environment variable injection, SSL certificate renewal, and live debugging on a running VPS has given him practical DevOps experience beyond theoretical knowledge.

## Current Status
Live in production at ksg-ict.duckdns.org. Actively used by KSG ICT staff. Ongoing maintenance and feature additions.

## What This Demonstrates
This project demonstrates Samuel's ability to:
- Architect and build a complete full-stack system from requirements to production deployment
- Work within institutional constraints (government client, real users, formal requirements)
- Handle a complex multi-role permission system
- Build real-time features with WebSockets
- Deploy and maintain a Dockerized application on a live VPS
- Write background job schedulers (weekly digest emails, monthly reports, SLA monitoring)