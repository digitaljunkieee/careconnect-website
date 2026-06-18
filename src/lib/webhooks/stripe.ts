import Stripe from "stripe";
import WebhookEventLog from "@/models/WebhookEventLog";
import {
  handleStripeCheckoutCompleted,
  handleStripePaymentFailure,
  handleStripeRefund
} from "@/lib/integrations/stripe";
import { hashSha256 } from "@/lib/signature";

export type StripeWebhookResult = {
  eventId: string;
  eventType: string;
  status: "PROCESSED" | "IGNORED";
  paymentLogId?: string;
};

function getEventId(event: Stripe.Event) {
  return event.id || hashSha256(JSON.stringify(event));
}

export async function processStripeWebhookEvent(
  event: Stripe.Event
): Promise<StripeWebhookResult> {
  const eventId = getEventId(event);
  const existing = await WebhookEventLog.findOne({
    provider: "STRIPE",
    eventId
  });

  if (existing?.status === "PROCESSED") {
    return {
      eventId,
      eventType: event.type,
      status: "IGNORED"
    };
  }

  const eventLog =
    existing ??
    (await WebhookEventLog.create({
      provider: "STRIPE",
      eventId,
      eventType: event.type,
      status: "RECEIVED",
      payload: event as unknown as Record<string, unknown>,
      lastError: "",
      processedAt: null
    }));

  try {
    let result:
      | Awaited<ReturnType<typeof handleStripeCheckoutCompleted>>
      | Awaited<ReturnType<typeof handleStripePaymentFailure>>
      | Awaited<ReturnType<typeof handleStripeRefund>>
      | null = null;

    switch (event.type) {
      case "checkout.session.completed":
        result = await handleStripeCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;
      case "payment_intent.payment_failed":
        result = await handleStripePaymentFailure(
          event.data.object as Stripe.PaymentIntent
        );
        break;
      case "charge.refunded":
        result = await handleStripeRefund(event.data.object as Stripe.Charge);
        break;
      default:
        eventLog.status = "IGNORED";
        eventLog.processedAt = new Date();
        eventLog.lastError = "";
        await eventLog.save();
        return {
          eventId,
          eventType: event.type,
          status: "IGNORED"
        };
    }

    eventLog.status = "PROCESSED";
    eventLog.processedAt = new Date();
    eventLog.payload = {
      ...(eventLog.payload as Record<string, unknown>),
      webhook: event as unknown as Record<string, unknown>
    };
    eventLog.lastError = "";
    await eventLog.save();

    return {
      eventId,
      eventType: event.type,
      paymentLogId: result?.paymentLogId,
      status: "PROCESSED"
    };
  } catch (error) {
    eventLog.status = "FAILED";
    eventLog.lastError = error instanceof Error ? error.message : "Unable to process Stripe webhook.";
    eventLog.payload = {
      ...(eventLog.payload as Record<string, unknown>),
      webhook: event as unknown as Record<string, unknown>
    };
    await eventLog.save();
    throw error;
  }
}
