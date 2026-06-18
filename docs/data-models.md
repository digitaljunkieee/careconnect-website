# Data Models

The platform uses a small set of linked record types to support care staffing workflows.

## Users

- Stores the account holder's identity and role.
- Key fields: `firstName`, `lastName`, `email`, `phone`, `role`, `isActive`.

## Worker Profiles

- Stores the worker's care background, verification state, and uploaded documents.
- Key fields: `userId`, `phone`, `addressHistory`, `niNumber`, `shareCode`, `roleType`, `verificationStatus`, `isVerified`, `cloudinaryDocuments`.

## Facility Profiles

- Stores the care facility's business details.
- Key fields: `userId`, `companyName`, `address`, `contactNumber`.

## Shifts

- Stores the shift listing posted by a facility.
- Key fields: `facilityId`, `date`, `startTime`, `endTime`, `hourlyRate`, `roleRequired`, `notes`, `status`, `paymentStatus`.

## Applications

- Stores each worker's application for a shift.
- Key fields: `workerId`, `shiftId`, `status`.

## Assignments

- Stores confirmed worker bookings for shifts.
- Key fields: `workerId`, `facilityId`, `shiftId`, `assignedAt`, `status`.
- `shiftId` is unique so a shift can only have one assignment.

## Verification Logs

- Stores verification submissions, outcomes, and review notes.
- Key fields: `workerId`, `ebcApplicantId`, `status`, `reportUrl`, `payload`, `adminId`, `adminNotes`, `decisionAt`.

## Payment Logs

- Stores payment activity tied to a shift.
- Key fields: `shiftId`, `facilityId`, `stripeSessionId`, `stripePaymentIntentId`, `stripeChargeId`, `amount`, `status`, `currency`.

## Notifications

- Stores in-app messages for workers, facilities, and admins.
- Key fields: `userId`, `title`, `message`, `type`, `isRead`.

## Email Queue Jobs

- Stores queued outbound email work items.
- Key fields: `dedupeKey`, `recipients`, `template`, `subject`, `payload`, `status`, `attempts`, `maxAttempts`, `nextRunAt`, `lastError`, `providerMessageId`.

## Email Logs

- Stores a delivery trail for outbound email.
- Key fields: `provider`, `recipientEmail`, `recipientName`, `template`, `subject`, `dedupeKey`, `providerMessageId`, `status`, `attempts`, `payload`, `errorMessage`, `sentAt`.

## Audit Logs

- Stores administrative actions for compliance and traceability.
- Key fields: `adminId`, `action`, `entityType`, `entityId`, `metadata`.

## Webhook Event Logs

- Stores inbound webhook events, processing results, and failure details.
- Key fields: `provider`, `eventId`, `eventType`, `status`, `payload`, `lastError`, `processedAt`.
