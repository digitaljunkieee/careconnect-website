import { Schema, Types } from "mongoose";
import { getModel } from "@/models/model-helpers";
import type { BrevoTemplateName } from "@/lib/integrations/brevo";

export interface EmailQueueJobDocument {
  _id: Types.ObjectId;
  dedupeKey: string;
  recipients: Array<{
    email: string;
    name?: string;
  }>;
  template: BrevoTemplateName | string;
  subject: string;
  payload: Record<string, unknown>;
  status: "PENDING" | "PROCESSING" | "SENT" | "FAILED";
  attempts: number;
  maxAttempts: number;
  nextRunAt: Date;
  lastError: string;
  providerMessageId: string;
  createdAt: Date;
  updatedAt: Date;
}

const emailQueueJobSchema = new Schema<EmailQueueJobDocument>(
  {
    dedupeKey: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    recipients: {
      type: [
        {
          email: {
            type: String,
            required: true
          },
          name: {
            type: String,
            default: ""
          }
        }
      ],
      default: []
    },
    template: {
      type: String,
      required: true,
      index: true
    },
    subject: {
      type: String,
      default: ""
    },
    payload: {
      type: Schema.Types.Mixed,
      default: {}
    },
    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "SENT", "FAILED"],
      default: "PENDING",
      index: true
    },
    attempts: {
      type: Number,
      default: 0
    },
    maxAttempts: {
      type: Number,
      default: 5
    },
    nextRunAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    lastError: {
      type: String,
      default: ""
    },
    providerMessageId: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

emailQueueJobSchema.index({ status: 1, nextRunAt: 1, createdAt: 1 });

const EmailQueueJob = getModel<EmailQueueJobDocument>(
  "EmailQueueJob",
  emailQueueJobSchema
);

export default EmailQueueJob;
