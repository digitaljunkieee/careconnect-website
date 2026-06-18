import Stripe from "stripe";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import PaymentLog from "@/models/PaymentLog";
import Shift from "@/models/Shift";
import FacilityProfile from "@/models/FacilityProfile";
import User from "@/models/User";
import { createHttpError } from "@/lib/http-error";
import { createNotification, notifyAdmins } from "@/lib/notifications";
import { recordAuditLog } from "@/lib/audit";
import { getAppBaseUrl } from "@/lib/app-url";

type StripeConfig = {
  secretKey: string;
  webhookSecret: string;
  currency: string;
  appBaseUrl: string;
};

export type StripeCheckoutInput = {
  shiftId: string;
  facilityId: string;
  successUrl?: string;
  cancelUrl?: string;
};

export type StripeCheckoutResult = {
  checkoutSessionId: string;
  checkoutUrl: string;
  paymentLogId: string;
  amount: number;
  currency: string;
};

export type StripeWebhookProcessedResult = {
  eventId: string;
  eventType: string;
  paymentLogId?: string;
  status: "PROCESSED" | "IGNORED";
};

const stripeClientCache = new Map<string, Stripe>();

function getStripeConfig(): StripeConfig {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const currency = (process.env.STRIPE_CURRENCY ?? "gbp").toLowerCase();

  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY environment variable.");
  }

  if (!webhookSecret) {
    throw new Error("Missing STRIPE_WEBHOOK_SECRET environment variable.");
  }

  return {
    secretKey,
    webhookSecret,
    currency,
    appBaseUrl: getAppBaseUrl()
  };
}

export function getStripeClient() {
  const config = getStripeConfig();

  if (!stripeClientCache.has(config.secretKey)) {
    stripeClientCache.set(config.secretKey, new Stripe(config.secretKey));
  }

  return stripeClientCache.get(config.secretKey)!;
}

export function getStripeWebhookSecret() {
  return getStripeConfig().webhookSecret;
}

function getShiftHours(startTime: string, endTime: string) {
  const [startHours, startMinutes] = startTime.split(":").map(Number);
  const [endHours, endMinutes] = endTime.split(":").map(Number);

  if (
    Number.isNaN(startHours) ||
    Number.isNaN(startMinutes) ||
    Number.isNaN(endHours) ||
    Number.isNaN(endMinutes)
  ) {
    return 0;
  }

  const startTotal = startHours * 60 + startMinutes;
  let endTotal = endHours * 60 + endMinutes;

  if (endTotal <= startTotal) {
    endTotal += 24 * 60;
  }

  return Math.max((endTotal - startTotal) / 60, 0);
}

function calculateShiftAmount(shift: { hourlyRate: number; startTime: string; endTime: string }) {
  const hours = getShiftHours(shift.startTime, shift.endTime);
  return Math.round(shift.hourlyRate * Math.max(hours, 1) * 100) / 100;
}

function buildStripeCheckoutUrls(
  input: StripeCheckoutInput,
  config: StripeConfig
) {
  const successUrl =
    input.successUrl?.trim() ||
    `${config.appBaseUrl}/dashboard/facility?payment=success`;
  const cancelUrl =
    input.cancelUrl?.trim() ||
    `${config.appBaseUrl}/dashboard/facility?payment=cancelled`;

  return { successUrl, cancelUrl };
}

async function getFacilityContext(shiftId: string, facilityId: string) {
  const [shift, facility] = await Promise.all([
    Shift.findById(shiftId).lean(),
    FacilityProfile.findById(facilityId).lean()
  ]);

  if (!shift) {
    throw createHttpError(404, "Shift not found.");
  }

  if (!facility) {
    throw createHttpError(404, "Facility profile not found.");
  }

  if (String(shift.facilityId) !== String(facility._id)) {
    throw createHttpError(400, "Shift does not belong to the supplied facility.");
  }

  return { shift, facility };
}

async function getAuditAdminId() {
  const admin = await User.findOne({ role: "ADMIN", isActive: true })
    .select("_id")
    .lean();

  return admin?._id ? String(admin._id) : "";
}

async function createPaymentLogEntry(input: {
  shiftId: string;
  facilityId: string;
  amount: number;
  currency: string;
}) {
  const paymentLog = await PaymentLog.create({
    shiftId: input.shiftId,
    facilityId: input.facilityId,
    stripeSessionId: "",
    stripePaymentIntentId: "",
    stripeChargeId: "",
    amount: input.amount,
    status: "PENDING",
    currency: input.currency.toUpperCase()
  });

  return paymentLog;
}

async function updatePaymentLogFromSession(
  session: Stripe.Checkout.Session,
  nextStatus: "PAID" | "FAILED" | "REFUNDED"
) {
  const metadata = session.metadata ?? {};
  const paymentLogId = metadata.paymentLogId ?? "";
  const paymentLogQuery: Record<string, unknown> = {};

  if (paymentLogId) {
    paymentLogQuery._id = new mongoose.Types.ObjectId(paymentLogId);
  } else if (session.id) {
    paymentLogQuery.stripeSessionId = session.id;
  }

  if (session.payment_intent) {
    paymentLogQuery.stripePaymentIntentId = String(session.payment_intent);
  }

  const paymentLog = await PaymentLog.findOne(paymentLogQuery).populate("shiftId");
  if (!paymentLog) {
    throw createHttpError(404, "Payment log not found for Stripe session.");
  }

  paymentLog.stripeSessionId = session.id;
  paymentLog.stripePaymentIntentId = String(session.payment_intent ?? paymentLog.stripePaymentIntentId);
  paymentLog.status = nextStatus;
  if (session.currency) {
    paymentLog.currency = session.currency.toUpperCase();
  }
  if (typeof session.amount_total === "number") {
    paymentLog.amount = session.amount_total / 100;
  }

  await paymentLog.save();

  const shift = paymentLog.shiftId as unknown as { _id?: mongoose.Types.ObjectId; facilityId?: mongoose.Types.ObjectId };

  if (shift?._id) {
    await Shift.findByIdAndUpdate(shift._id, {
      $set: {
        paymentStatus: nextStatus
      }
    });
  }

  return paymentLog;
}

async function updatePaymentLogFromPaymentIntent(
  paymentIntent: Stripe.PaymentIntent,
  nextStatus: "FAILED" | "PAID"
) {
  const query: Record<string, unknown>[] = [
    { stripePaymentIntentId: paymentIntent.id }
  ];

  if (paymentIntent.metadata?.stripeSessionId) {
    query.push({ stripeSessionId: paymentIntent.metadata.stripeSessionId });
  }

  if (paymentIntent.metadata?.paymentLogId && mongoose.isValidObjectId(paymentIntent.metadata.paymentLogId)) {
    query.push({ _id: new mongoose.Types.ObjectId(paymentIntent.metadata.paymentLogId) });
  }

  const paymentLog = await PaymentLog.findOne({ $or: query }).populate("shiftId");

  if (!paymentLog) {
    throw createHttpError(404, "Payment log not found for payment intent.");
  }

  paymentLog.stripePaymentIntentId = paymentIntent.id;
  paymentLog.status = nextStatus;
  paymentLog.currency = paymentIntent.currency?.toUpperCase() ?? paymentLog.currency;
  paymentLog.amount = (paymentIntent.amount_received ?? paymentIntent.amount ?? 0) / 100;
  await paymentLog.save();

  const shift = paymentLog.shiftId as unknown as { _id?: mongoose.Types.ObjectId };
  if (shift?._id) {
    await Shift.findByIdAndUpdate(shift._id, {
      $set: {
        paymentStatus: nextStatus === "FAILED" ? "FAILED" : "PAID"
      }
    });
  }

  return paymentLog;
}

async function updatePaymentLogFromRefund(charge: Stripe.Charge) {
  const paymentLog = await PaymentLog.findOne({
    $or: [
      { stripeChargeId: charge.id },
      { stripePaymentIntentId: String(charge.payment_intent ?? "") },
      { stripeSessionId: String(charge.metadata?.stripeSessionId ?? "") }
    ]
  }).populate("shiftId");

  if (!paymentLog) {
    throw createHttpError(404, "Payment log not found for refund.");
  }

  paymentLog.stripeChargeId = charge.id;
  paymentLog.status = "REFUNDED";
  await paymentLog.save();

  const shift = paymentLog.shiftId as unknown as { _id?: mongoose.Types.ObjectId };
  if (shift?._id) {
    await Shift.findByIdAndUpdate(shift._id, {
      $set: {
        paymentStatus: "REFUNDED"
      }
    });
  }

  return paymentLog;
}

async function notifyPaymentParties(
  facilityUserId: string,
  adminMessage: string,
  facilityMessage: string,
  type: "SUCCESS" | "WARNING" | "INFO" = "INFO",
  session?: mongoose.ClientSession
) {
  if (facilityUserId) {
    await createNotification(
      {
        userId: facilityUserId,
        title: "Payment update",
        message: facilityMessage,
        type
      },
      session
    );
  }

  await notifyAdmins(
    {
      title: "Payment update",
      message: adminMessage,
      type: "INFO"
    },
    session
  );
}

export async function createStripeCheckoutSession(
  input: StripeCheckoutInput
): Promise<StripeCheckoutResult> {
  await connectDB();
  const config = getStripeConfig();
  const stripe = getStripeClient();
  const { shift, facility } = await getFacilityContext(input.shiftId, input.facilityId);
  const amount = calculateShiftAmount({
    hourlyRate: shift.hourlyRate ?? 0,
    startTime: shift.startTime,
    endTime: shift.endTime
  });

  if (amount <= 0) {
    throw createHttpError(400, "Unable to calculate a valid payment amount for the shift.");
  }

  const paymentLog = await createPaymentLogEntry({
    shiftId: String(shift._id),
    facilityId: String(facility._id),
    amount,
    currency: config.currency
  });

  const { successUrl, cancelUrl } = buildStripeCheckoutUrls(input, config);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: undefined,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: config.currency,
          unit_amount: Math.round(amount * 100),
          product_data: {
            name: `${shift.roleRequired} on ${new Date(shift.date).toLocaleDateString("en-GB")}`,
            description: `Facility payment for ${facility.companyName}`
          }
        }
      }
    ],
    metadata: {
      shiftId: String(shift._id),
      facilityId: String(facility._id),
      paymentLogId: String(paymentLog._id)
    }
  });

  paymentLog.stripeSessionId = session.id;
  await paymentLog.save();

  return {
    checkoutSessionId: session.id,
    checkoutUrl: session.url ?? "",
    paymentLogId: String(paymentLog._id),
    amount,
    currency: config.currency.toUpperCase()
  };
}

export async function handleStripeCheckoutCompleted(
  session: Stripe.Checkout.Session
): Promise<StripeWebhookProcessedResult> {
  await connectDB();
  const paymentLog = await updatePaymentLogFromSession(session, "PAID");

  const shift = await Shift.findById(paymentLog.shiftId).populate({
    path: "facilityId",
    select: "userId companyName"
  });

  const facilityUserId = String(
    (shift?.facilityId as unknown as { userId?: mongoose.Types.ObjectId } | null)?.userId ?? ""
  );
  const facilityName = String(
    (shift?.facilityId as unknown as { companyName?: string } | null)?.companyName ?? "your facility"
  );
  const adminId = await getAuditAdminId();

  await notifyPaymentParties(
    facilityUserId,
    `A Stripe checkout for ${facilityName} was completed.`,
    `Your payment for ${facilityName} has been confirmed.`,
    "SUCCESS"
  );

  if (adminId) {
    await recordAuditLog({
      adminId,
      action: "PAYMENT_RECEIVED",
      entityType: "PAYMENT",
      entityId: String(paymentLog._id),
      metadata: {
        stripeSessionId: session.id,
        paymentIntentId: String(session.payment_intent ?? ""),
        amount: paymentLog.amount,
        currency: paymentLog.currency
      }
    });
  }

  return {
    eventId: session.id,
    eventType: "checkout.session.completed",
    paymentLogId: String(paymentLog._id),
    status: "PROCESSED"
  };
}

export async function handleStripePaymentFailure(
  paymentIntent: Stripe.PaymentIntent
): Promise<StripeWebhookProcessedResult> {
  await connectDB();
  const paymentLog = await updatePaymentLogFromPaymentIntent(paymentIntent, "FAILED");

  const shift = await Shift.findById(paymentLog.shiftId).populate({
    path: "facilityId",
    select: "userId companyName"
  });
  const facilityUserId = String(
    (shift?.facilityId as unknown as { userId?: mongoose.Types.ObjectId } | null)?.userId ?? ""
  );
  const facilityName = String(
    (shift?.facilityId as unknown as { companyName?: string } | null)?.companyName ?? "your facility"
  );
  const adminId = await getAuditAdminId();

  await notifyPaymentParties(
    facilityUserId,
    `A payment attempt for ${facilityName} failed.`,
    `We could not complete the payment for ${facilityName}. Please try again.`,
    "WARNING"
  );

  if (adminId) {
    await recordAuditLog({
      adminId,
      action: "PAYMENT_FAILED",
      entityType: "PAYMENT",
      entityId: String(paymentLog._id),
      metadata: {
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount ?? 0,
        currency: paymentIntent.currency
      }
    });
  }

  return {
    eventId: paymentIntent.id,
    eventType: "payment_intent.payment_failed",
    paymentLogId: String(paymentLog._id),
    status: "PROCESSED"
  };
}

export async function handleStripeRefund(
  charge: Stripe.Charge
): Promise<StripeWebhookProcessedResult> {
  await connectDB();
  const paymentLog = await updatePaymentLogFromRefund(charge);

  const shift = await Shift.findById(paymentLog.shiftId).populate({
    path: "facilityId",
    select: "userId companyName"
  });
  const facilityUserId = String(
    (shift?.facilityId as unknown as { userId?: mongoose.Types.ObjectId } | null)?.userId ?? ""
  );
  const facilityName = String(
    (shift?.facilityId as unknown as { companyName?: string } | null)?.companyName ?? "your facility"
  );
  const adminId = await getAuditAdminId();

  await notifyPaymentParties(
    facilityUserId,
    `A payment refund was processed for ${facilityName}.`,
    `A refund was issued for your payment to ${facilityName}.`,
    "WARNING"
  );

  if (adminId) {
    await recordAuditLog({
      adminId,
      action: "PAYMENT_REFUNDED",
      entityType: "PAYMENT",
      entityId: String(paymentLog._id),
      metadata: {
        chargeId: charge.id,
        paymentIntentId: String(charge.payment_intent ?? ""),
        amount: charge.amount_refunded ?? charge.amount ?? 0,
        currency: charge.currency
      }
    });
  }

  return {
    eventId: charge.id,
    eventType: "charge.refunded",
    paymentLogId: String(paymentLog._id),
    status: "PROCESSED"
  };
}

export {
  calculateShiftAmount,
  updatePaymentLogFromPaymentIntent,
  updatePaymentLogFromRefund,
  updatePaymentLogFromSession
};
