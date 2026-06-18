# Architecture Overview

CareConnect is organized around three business workflows:

1. Care workers create profiles, complete verification, and apply for shifts.
2. Care facilities post shifts, review applicants, and confirm bookings.
3. Administrators review compliance, oversee payments, and monitor activity.

## Core Surfaces

- The public web experience introduces the platform and routes people to sign in or register.
- The worker dashboard focuses on verification status, available shifts, applications, and assignments.
- The facility dashboard focuses on open shifts, applicants, bookings, and profile details.
- The admin dashboard centralizes verification reviews, compliance tracking, payments, and support actions.

## Supporting Services

- Verification requests are sent to the external screening service and tracked in the database.
- Shift payments are created through the payment provider and reconciled through webhook events.
- Emails are queued, deduplicated, and recorded for later delivery.
- Document uploads are signed before upload so the browser can send files directly to storage.

## Data Flow

1. A worker or facility registers and creates a profile.
2. A worker uploads documents and submits verification details.
3. A facility posts a shift and reviews applicants.
4. A booking is confirmed, payment is recorded, and notifications are sent.
5. Admins monitor the resulting records through the dashboard and reporting tools.

## Operational Principle

The user interface stays focused on care staffing tasks. Business actions live in the app, while integrations and delivery jobs are handled by the API service.
