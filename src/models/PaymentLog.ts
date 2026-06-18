import { Schema, Types } from "mongoose";
import {
  PAYMENT_STATUSES,
  type PaymentStatus
} from "@/lib/constants";
import { getModel } from "@/models/model-helpers";

export interface PaymentLogDocument {
  _id: Types.ObjectId;
  shiftId: Types.ObjectId;
  facilityId?: Types.ObjectId | null;
  stripeSessionId: string;
  stripePaymentIntentId: string;
  stripeChargeId: string;
  amount: number;
  status: PaymentStatus;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentLogSchema = new Schema<PaymentLogDocument>(
  {
    shiftId: {
      type: Schema.Types.ObjectId,
      ref: "Shift",
      required: true,
      index: true
    },
    facilityId: {
      type: Schema.Types.ObjectId,
      ref: "FacilityProfile",
      default: null,
      index: true
    },
    stripeSessionId: {
      type: String,
      default: ""
    },
    stripePaymentIntentId: {
      type: String,
      default: ""
    },
    stripeChargeId: {
      type: String,
      default: ""
    },
    amount: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: "GBP"
    },
    status: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: "PENDING"
    }
  },
  {
    timestamps: true
  }
);

paymentLogSchema.index({ status: 1, createdAt: -1 });
paymentLogSchema.index(
  { stripeSessionId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      stripeSessionId: {
        $exists: true,
        $ne: ""
      }
    }
  }
);
paymentLogSchema.index(
  { stripePaymentIntentId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      stripePaymentIntentId: {
        $exists: true,
        $ne: ""
      }
    }
  }
);
paymentLogSchema.index(
  { stripeChargeId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      stripeChargeId: {
        $exists: true,
        $ne: ""
      }
    }
  }
);

const PaymentLog = getModel<PaymentLogDocument>("PaymentLog", paymentLogSchema);

export default PaymentLog;
