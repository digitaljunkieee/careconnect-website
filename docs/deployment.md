# Deployment Guide

## User-Facing App

1. Deploy the `frontend` folder to your frontend host.
2. Set the app environment variables:
   - `NEXT_PUBLIC_APP_URL`
   - `AUTH_URL`
   - `AUTH_SECRET`
   - `DATABASE_URL`
3. Build the production bundle with:
   - `npm run build`
4. Apply database indexes during setup or before the first pilot import:
   - `npm run db:indexes`
5. Smoke test the production build locally with:
   - `npm run start`

## API Service

1. Deploy the `backend` folder as the API service.
2. Set the API environment variables:
   - `APP_BASE_URL`
   - `PORT`
   - `CORS_ORIGIN`
   - `BACKEND_API_KEY`
   - `BACKEND_RATE_LIMIT_WINDOW_MS`
   - `BACKEND_RATE_LIMIT_MAX`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_CURRENCY`
   - `BREVO_API_KEY`
   - `BREVO_API_BASE_URL`
   - `BREVO_SENDER_EMAIL`
   - `BREVO_SENDER_NAME`
   - `EBC_API_BASE_URL`
   - `EBC_API_KEY`
   - `EBC_WEBHOOK_SECRET`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `DATABASE_URL`
3. Start the service with:
   - `npm run start`
4. Health check endpoint:
   - `GET /health`

## Webhook URLs

- EBC events: `POST /webhooks/ebc`
- Payment events: `POST /webhooks/stripe`

## Notes

- Restrict CORS to known frontend origins.
- Keep `BACKEND_API_KEY` private and rotate it before pilot onboarding.
- Keep webhook secrets aligned with the external services.
- Verify sender details before enabling transactional email in production.
