# Deployment Guide

## User-Facing App

1. Deploy the `frontend` folder to Vercel with `frontend` as the Root Directory.
2. Import the variables from `frontend/.env.production.example` into Vercel and fill every enabled service's blank secret.
3. Set these URL values exactly (without a trailing slash):
   - `NEXT_PUBLIC_APP_URL=https://careconnect-omega-one.vercel.app`
   - `NEXT_PUBLIC_BACKEND_URL=https://careconnect-backend-rud7.onrender.com`
4. Use the same long random `AUTH_SECRET` and `BACKEND_API_KEY` values on Vercel and Render.
5. Keep `NEXT_PUBLIC_PRELAUNCH_SURVEY_MODE=true` while registration should lead to the waitlist; set it to `false` to enable full worker and facility registration.
6. Build the production bundle with:
   - `npm run build`
7. Apply database indexes during setup or before the first pilot import:
   - `npm run db:indexes`
8. Smoke test the production build locally with:
   - `npm run start`

## API Service

1. Deploy the `backend` folder to Render with `backend` as the Root Directory.
2. Use `npm install` as the build command and `npm start` as the start command.
3. Import the variables from `backend/.env.production.example` into Render and fill every enabled service's blank secret.
4. Set the API environment variables:
   - Required: `DATABASE_URL` and either `JWT_SECRET` or `AUTH_SECRET`
   - Set the signing secret to a long, random value and keep it stable across deploys.
   - Set `APP_BASE_URL`, `NEXT_PUBLIC_APP_URL`, and `CORS_ORIGIN` to `https://careconnect-omega-one.vercel.app`.
   - Set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME` for the environment-managed administrator.
   - Set `BACKEND_API_KEY` to the same value used on Vercel.
   - Optional tuning: `PORT`, `BACKEND_RATE_LIMIT_WINDOW_MS`, `BACKEND_RATE_LIMIT_MAX`
   - Feature-specific credentials:
     - Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_CURRENCY`
     - Brevo: `BREVO_API_KEY`, `BREVO_API_BASE_URL`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME`
     - EBC: `EBC_API_BASE_URL`, `EBC_API_KEY`, `EBC_WEBHOOK_SECRET`
     - Cloudinary: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
5. Health check endpoint:
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
