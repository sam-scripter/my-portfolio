# Uasin Gishu County Government — Integrated Vehicle Management System (IVMS)

## Context
Contracted engagement with Uasin Gishu County Government, May 2023 – August 2023, during final year of undergraduate studies at CUEA. This was Samuel's first professional backend development engagement with a government client. The project was also submitted as his final year project for the BSc Computer Science degree (graded, supervised by Mr. Eliakim Akama).

## The Problem
The county government managed a fleet of vehicles across multiple departments. The entire process for fuel and repair orders was paper-based and manual:

1. A driver needing fuel fills out a paper requisition form
2. The form goes to a secretary for initial review
3. Secretary passes to Transport Manager for approval
4. Transport Manager approves, estimates fuel required, signs
5. Driver takes the signed form to the fuel attendant
6. Attendant dispenses fuel, records in a register

**Problems with this process:**
- No digital audit trail — paper forms could be lost, altered, or backdated
- Drivers could over-request fuel with no objective validation of the quantity needed
- Fuel theft: drivers could claim fuel for routes they didn't travel, or attendants could dispense more than approved
- Management had no real-time visibility into fuel consumption per vehicle
- Repair orders followed the same broken process — mechanics had no formal job tracking
- The entire approval chain was slow — a fuel request could take days to process

## The Solution — Flutter + Django + PostgreSQL

### User Roles
The system replaced every paper form with a digital workflow across six roles:

- **Driver**: submits fuel and repair requests via the Flutter mobile app; selects source and destination from an interactive Google Map
- **Secretary**: first-level review of incoming requests; can flag issues before it reaches the Transport Manager
- **Transport Manager**: final approval/rejection authority; can edit the fuel quantity if the calculated amount seems incorrect; manages vehicle records
- **Fuel Attendant**: sees approved fuel orders; marks as dispensed after fuel is given
- **Mechanic**: sees assigned repair orders; updates repair status; logs parts used
- **Repair Manager**: assigns mechanics to repair jobs; manages the repair store inventory
- **Super User / Admin**: full system access; manages all users, departments, vehicles, fuel stations

### Google Maps API Integration
This is the key anti-theft feature. The flow:

1. Driver opens a new fuel request
2. Driver selects source location (current GPS location or custom map pin) and destination location (map pin) — they cannot type free text; they must select from the actual map, which validates the locations exist
3. The two coordinates are passed to the Google Maps Distance Matrix API
4. The API returns the road distance in kilometres between the two points
5. The system retrieves the vehicle's fuel consumption rate (litres per 100km, stored in the vehicle record)
6. Fuel quota is calculated: (distance_km / 100) × consumption_rate = litres_required
7. This calculated quantity is pre-filled in the request — the driver cannot change it; the Transport Manager can edit if needed

**Impact**: A driver can no longer request 50 litres for a 10km trip. The system calculates that a 10km trip in a vehicle consuming 10L/100km requires exactly 1 litre. The calculated quantity is the ceiling of what can be approved.

### Database Schema
Complex relational schema designed to handle the full operational scope:
- **Departments**: name, budget allocation, department head
- **Employees**: name, role, department, contact, vehicle assignment
- **Vehicles**: registration, make, model, fuel type, consumption rate (L/100km), department assignment, current status
- **Fuel Stations**: name, location, current stock level
- **Fuel Vendors**: supplier details for station restocking
- **Fuel Orders**: driver, vehicle, source coordinates, destination coordinates, distance (km), calculated litres, requested litres, approval status, approved by, approval date, dispensed by, dispense date, notes
- **Repair Orders**: driver, vehicle, reported issue, assigned mechanic, assigned repair shop, parts used, repair status, dates, notes
- **Notifications**: recipient, event type, message, read status, timestamp
- **Reports**: aggregated fuel consumption per vehicle per period, repair history per vehicle

### Automated Reporting
The system generates reports that were previously impossible with the paper system:
- Fuel consumption per vehicle (per week/month)
- Approval turnaround time (time from request to approval)
- Most fuel-intensive routes
- Repair frequency per vehicle (identifies vehicles that need replacement)

These reports gave county management data for fleet optimization decisions for the first time.

## Working with a Government Client
Government clients operate with institutional constraints that commercial clients don't have: formal sign-off requirements, data sensitivity (employee records, fleet data), procurement processes, and stakeholders who are not technical. Requirements gathering involved structured questionnaires translated into non-technical language. Every design decision was documented and signed off before implementation to avoid scope creep disputes.

## Academic Context
This project was also submitted as Samuel's final year project at CUEA. The academic version includes a full research component: literature review of existing vehicle management systems, feasibility study, system analysis, and formal methodology documentation. The project received a Second Class Upper Division grade.

## Duration & Impact
- May 2023 – August 2023
- Replaced a fully manual, paper-based fuel requisition process
- First government client engagement
- Delivered both the working system and formal academic documentation