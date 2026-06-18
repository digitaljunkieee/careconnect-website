import { Schema, Types } from "mongoose";
import {
  SHIFT_STATUSES,
  PAYMENT_STATUSES,
  type ShiftStatus,
  type PaymentStatus
} from "@/lib/constants";
import { getModel } from "@/models/model-helpers";

export interface ShiftDocument {
  _id: Types.ObjectId;
  facilityId: Types.ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  hourlyRate: number;
  roleRequired: string;
  notes: string;
  status: ShiftStatus;
  paymentStatus: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const shiftSchema = new Schema<ShiftDocument>(
  {
    facilityId: {
      type: Schema.Types.ObjectId,
      ref: "FacilityProfile",
      required: true,
      index: true
    },
    date: {
      type: Date,
      required: true
    },
    startTime: {
      type: String,
      required: true,
      trim: true
    },
    endTime: {
      type: String,
      required: true,
      trim: true
    },
    hourlyRate: {
      type: Number,
      required: true,
      min: 0
    },
    roleRequired: {
      type: String,
      required: true,
      trim: true
    },
    notes: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: SHIFT_STATUSES,
      default: "OPEN"
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: "PENDING"
    }
  },
  {
    timestamps: true
  }
);

shiftSchema.index({ status: 1, date: 1 });
shiftSchema.index({ facilityId: 1, status: 1, date: 1 });
shiftSchema.index({ roleRequired: 1, hourlyRate: 1, date: 1 });
shiftSchema.index({ paymentStatus: 1, updatedAt: -1 });

const Shift = getModel<ShiftDocument>("Shift", shiftSchema);

export default Shift;
