# Troubleshooting

## Sign-In Issues

- Confirm the account exists and is active.
- Check `DATABASE_URL`, `AUTH_URL`, and `AUTH_SECRET`.
- If you are using the demo seed, open the `frontend` folder and verify that the demo password matches the value printed by `npm run seed:demo`.

## Verification Submission Fails

- Confirm the worker profile has the required personal details and uploaded documents.
- Check `EBC_API_BASE_URL`, `EBC_API_KEY`, and `EBC_WEBHOOK_SECRET`.
- Review the worker's latest verification log for the error payload.

## Payments Do Not Create

- Confirm `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `STRIPE_CURRENCY` are configured.
- Confirm the shift belongs to the facility creating the checkout session.
- Check the payment logs after submitting a checkout request.

## Emails Stay Queued

- Confirm `BREVO_API_KEY`, `BREVO_API_BASE_URL`, `BREVO_SENDER_EMAIL`, and `BREVO_SENDER_NAME` are set.
- Use the API service endpoint to process queued emails; `npm run smoke:test` from the `frontend` folder only verifies the public pages and redirect flow.
- Review `EmailQueueJob` and `EmailLog` records for the latest failure message.

## Document Upload Signature Errors

- Confirm the upload folder is being sent to the signature endpoint.
- Check `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.
- Ensure the request uses the same resource type expected by the upload form.

## Webhook Signature Failures

- Make sure the webhook secret in the external service matches the value in the environment.
- Verify that the API service receives the raw request body.
- Check the webhook event log for the recorded error.

## CORS or Redirect Problems

- Confirm `CORS_ORIGIN` includes the exact frontend origin.
- Confirm `APP_BASE_URL` and `NEXT_PUBLIC_APP_URL` point to the same live site.
- Clear the browser session if you see repeated redirects back to sign-in.
