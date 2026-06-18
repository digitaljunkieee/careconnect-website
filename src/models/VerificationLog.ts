import { Schema, Types } from "mongoose";
import {
  VERIFICATION_STATUSES,
  type VerificationStatus
} from "@/lib/constants";
import { getModel } from "@/models/model-helpers";

export interface VerificationLogDocument {
  _id: Types.ObjectId;
  workerId: Types.ObjectId;
  ebcApplicantId: string;
  status: VerificationStatus;
  reportUrl: string;
  payload: Record<string, unknown>;
  adminId?: Types.ObjectId;
  adminNotes: string;
  decisionAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const verificationLogSchema = new Schema<VerificationLogDocument>(
  {
    workerId: {
      type: Schema.Types.ObjectId,
      ref: "WorkerProfile",
      required: true,
      index: true
    },
    ebcApplicantId: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: VERIFICATION_STATUSES,
      default: "PENDING"
    },
    reportUrl: {
      type: String,
      default: ""
    },
    payload: {
      type: Schema.Types.Mixed,
      default: {}
    },
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    adminNotes: {
      type: String,
      default: ""
    },
    decisionAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

verificationLogSchema.index({ workerId: 1, createdAt: -1 });
verificationLogSchema.index({ status: 1, createdAt: -1 });
verificationLogSchema.index(
  { ebcApplicantId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      ebcApplicantId: {
        $exists: true,
        $ne: ""
      }
    }
  }
);

const VerificationLog = getModel<VerificationLogDocument>(
  "VerificationLog",
  verificationLogSchema
);

export default VerificationLog;
