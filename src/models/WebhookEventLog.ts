import { Schema, Types } from "mongoose";
import { getModel } from "@/models/model-helpers";

export interface WebhookEventLogDocument {
  _id: Types.ObjectId;
  provider: "EBC" | "STRIPE";
  eventId: string;
  eventType: string;
  status: "RECEIVED" | "PROCESSED" | "FAILED" | "IGNORED";
  payload: Record<string, unknown>;
  lastError: string;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const webhookEventLogSchema = new Schema<WebhookEventLogDocument>(
  {
    provider: {
      type: String,
      enum: ["EBC", "STRIPE"],
      required: true,
      index: true
    },
    eventId: {
      type: String,
      required: true,
      index: true
    },
    eventType: {
      type: String,
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ["RECEIVED", "PROCESSED", "FAILED", "IGNORED"],
      default: "RECEIVED",
      index: true
    },
    payload: {
      type: Schema.Types.Mixed,
      default: {}
    },
    lastError: {
      type: String,
      default: ""
    },
    processedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

webhookEventLogSchema.index({ provider: 1, eventId: 1 }, { unique: true });

const WebhookEventLog = getModel<WebhookEventLogDocument>(
  "WebhookEventLog",
  webhookEventLogSchema
);

export default WebhookEventLog;
