# Pilot Launch Checklist

Use this checklist before sending CareConnect into a pilot environment.

## Before Launch

- Open the `frontend` folder before running the app, seed, and smoke-test commands.
- Set all app and API environment variables.
- Set `BACKEND_API_KEY` for the API service and confirm protected integration requests include `x-careconnect-api-key`.
- Run `npm run seed:demo` to populate realistic worker, facility, shift, booking, and activity data.
- Run `npm run seed:admin` if you want a separate admin login with your own credentials.
- Run `npm run db:indexes` before pilot data import or first live onboarding.
- Run `npm run smoke:test` or `npm run test:e2e` to confirm the public pages and unauthenticated redirects still behave correctly.
- Run `npm run typecheck`.
- Run `npm run lint`.
- Run `npm run build`.
- Confirm the worker, facility, and admin dashboards load with the expected demo data.

## Operational Checks

- Verify the verification service can receive submissions.
- Verify the payment provider webhook points to the live API service.
- Verify the email sender is approved and able to send outbound messages.
- Verify the document upload credentials are active.
- Verify CORS only allows your intended frontend origin.
- Confirm API rate limits are appropriate for the pilot traffic profile.
- Send signed test payloads to the verification and payment webhook endpoints.

## Launch Day

- Open the site in a fresh browser session and confirm the landing page, registration pages, and sign-in page read as a polished care staffing product.
- Sign in as a worker and confirm the dashboard shows verification status, available shifts, applications, and assignments.
- Sign in as a facility and confirm the dashboard shows open shifts, pending applications, upcoming bookings, and recently filled shifts.
- Sign in as an admin and confirm verification review, compliance, payment, and notification pages load correctly.

## After Launch

- Watch for verification failures, payment failures, and email queue retries.
- Review notifications and audit logs daily during the pilot.
- Capture any copy or workflow issues for the next release cycle.
