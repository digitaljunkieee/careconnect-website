# Environment Setup

CareConnect uses two runtime surfaces:

- The user-facing web app
- The API service that handles integrations, webhooks, and background jobs

## App Variables

- `NEXT_PUBLIC_APP_URL`: Public URL used by the browser and email links
- `AUTH_URL`: Canonical URL used for sign-in and redirects
- `AUTH_SECRET`: Session signing secret
- `DATABASE_URL`: Primary MongoDB connection string

## API Variables

- `APP_BASE_URL`: Base URL used when the API builds links back to the app
- `PORT`: API service listen port
- `CORS_ORIGIN`: Comma-separated list of allowed frontend origins
- `BACKEND_API_KEY`: Shared key required for protected integration endpoints
- `BACKEND_RATE_LIMIT_WINDOW_MS`: Request limit window in milliseconds
- `BACKEND_RATE_LIMIT_MAX`: Maximum requests per client during the rate limit window
- `STRIPE_SECRET_KEY`: Payment provider secret key for shift bookings
- `STRIPE_WEBHOOK_SECRET`: Payment webhook signing secret
- `STRIPE_CURRENCY`: Default checkout currency, usually `gbp`
- `BREVO_API_KEY`: Transactional email service key
- `BREVO_API_BASE_URL`: Transactional email service base URL
- `BREVO_SENDER_EMAIL`: Verified sender email address
- `BREVO_SENDER_NAME`: Verified sender display name
- `EBC_API_BASE_URL`: Verification service base URL
- `EBC_API_KEY`: Verification service key
- `EBC_WEBHOOK_SECRET`: Verification webhook signing secret
- `CLOUDINARY_CLOUD_NAME`: Media upload service cloud name
- `CLOUDINARY_API_KEY`: Media upload service API key
- `CLOUDINARY_API_SECRET`: Media upload service API secret

## Local Development

- Open the `frontend` folder before running app commands
- Copy `frontend/.env.example` into `frontend/.env`
- Fill in both the app and API values before starting the project
- Run the user-facing app with `npm run dev`
- Run the API service with `npm run dev:backend`
- In production, set `BACKEND_API_KEY` and send it with protected API service requests using `x-careconnect-api-key`
