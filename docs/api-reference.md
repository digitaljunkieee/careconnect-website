# API Reference

CareConnect exposes route groups for the app itself and a separate API service for integrations.

## App Routes

### Authentication

- `POST /api/auth/register`
  - Registers a worker or facility account.
- `POST /api/auth/[...nextauth]`
  - Handles sign-in and session management.

### Worker Routes

- `GET /api/worker/profile`
- `GET /api/worker/shifts`
- `GET /api/worker/applications`
- `GET /api/worker/assignments`
- `GET /api/worker/documents`
- `POST /api/worker/verification`

### Facility Routes

- `GET /api/facility/profile`
- `GET /api/facility/shifts`
- `POST /api/facility/shifts`
- `GET /api/facility/shifts/[shiftId]`
- `PATCH /api/facility/shifts/[shiftId]`
- `DELETE /api/facility/shifts/[shiftId]`
- `GET /api/facility/shifts/[shiftId]/applications`
- `POST /api/facility/applications/[applicationId]/decision`

### Admin Routes

- `GET /api/admin/workers/[workerId]`
- `GET /api/admin/facilities/[facilityId]`
- `POST /api/admin/verifications/[workerProfileId]/decision`
- `GET /api/admin/reports/compliance`
- `GET /api/admin/payments/export`
- `GET /api/admin/notifications`
- `PATCH /api/admin/settings/profile`
- `PATCH /api/admin/settings/password`
- `GET /api/admin/shifts/[shiftId]`

## API Service Routes

### Health

- `GET /health`
  - Returns service and database readiness.

### Integrations

Protected integration routes require `x-careconnect-api-key` in production.

- `POST /integrations/ebc/applicants`
  - Body: `workerProfileId`
  - Submits a worker for verification.
- `POST /integrations/stripe/checkout`
  - Body: `shiftId`, `facilityId`, optional `successUrl`, optional `cancelUrl`
  - Creates a checkout session for a shift booking.
- `POST /integrations/emails/queue`
  - Body: `to`, `template`, optional `payload`, optional `dedupeKey`, optional `subject`
  - Queues outbound email work.
- `POST /integrations/emails/process`
  - Body: optional `batchSize`
  - Processes queued email jobs.
- `POST /integrations/cloudinary/signature`
  - Body: `folder`, optional `publicId`, optional `resourceType`
  - Returns an upload signature for direct document uploads.

### Webhooks

- `POST /webhooks/ebc`
  - Accepts signed verification events from the screening service.
- `POST /webhooks/stripe`
  - Accepts signed payment events from the payment provider.

## Response Shape

- Success responses follow the app's JSON envelope with a `data` object and a human-readable `message`.
- Validation failures return a `400` with a flattened field error payload.
- Unauthorized access returns `401`.
- Missing records return `404`.
- External-service failures return `502` when the integration cannot be completed safely.
