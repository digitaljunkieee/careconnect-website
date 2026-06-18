import { Schema, Types } from "mongoose";
import { getModel } from "@/models/model-helpers";
import type { BrevoTemplateName } from "@/lib/integrations/brevo";

export interface EmailLogDocument {
  _id: Types.ObjectId;
  provider: "BREVO";
  recipientEmail: string;
  recipientName: string;
  template: BrevoTemplateName | string;
  subject: string;
  dedupeKey: string;
  providerMessageId: string;
  status: "QUEUED" | "SENT" | "FAILED";
  attempts: number;
  payload: Record<string, unknown>;
  errorMessage: string;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const emailLogSchema = new Schema<EmailLogDocument>(
  {
    provider: {
      type: String,
      default: "BREVO",
      index: true
    },
    recipientEmail: {
      type: String,
      required: true,
      index: true
    },
    recipientName: {
      type: String,
      default: ""
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
    dedupeKey: {
      type: String,
      default: "",
      index: true
    },
    providerMessageId: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["QUEUED", "SENT", "FAILED"],
      default: "QUEUED",
      index: true
    },
    attempts: {
      type: Number,
      default: 0
    },
    payload: {
      type: Schema.Types.Mixed,
      default: {}
    },
    errorMessage: {
      type: String,
      default: ""
    },
    sentAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

emailLogSchema.index({ status: 1, createdAt: -1 });
emailLogSchema.index({ dedupeKey: 1, status: 1 });

const EmailLog = getModel<EmailLogDocument>("EmailLog", emailLogSchema);

export default EmailLog;
