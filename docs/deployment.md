# Deployment Guide

## User-Facing App

1. Deploy the `frontend` folder to your frontend host.
2. Set the app environment variables:
   - `NEXT_PUBLIC_APP_URL` for example `https://careconnect-omega-one.vercel.app`
   - `NEXT_PUBLIC_BACKEND_URL` for example `https://careconnect-backend-rud7.onrender.com`
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
   - Required: `DATABASE_URL` and either `JWT_SECRET` or `AUTH_SECRET`
   - Set the signing secret to a long, random value and keep it stable across deploys.
   - Recommended for production: `APP_BASE_URL`, `CORS_ORIGIN`, `BACKEND_API_KEY`
   - Point `APP_BASE_URL` and `CORS_ORIGIN` at `https://careconnect-omega-one.vercel.app`
   - Optional tuning: `PORT`, `BACKEND_RATE_LIMIT_WINDOW_MS`, `BACKEND_RATE_LIMIT_MAX`
   - Feature-specific credentials:
     - Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_CURRENCY`
     - Brevo: `BREVO_API_KEY`, `BREVO_API_BASE_URL`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME`
     - EBC: `EBC_API_BASE_URL`, `EBC_API_KEY`, `EBC_WEBHOOK_SECRET`
     - Cloudinary: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
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
- If you do not have Stripe, Brevo, EBC, or Cloudinary credentials yet, the backend can still deploy, but those features will fail until the values are added.
