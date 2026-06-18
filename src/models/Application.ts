import { Schema, Types } from "mongoose";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/constants";
import { getModel } from "@/models/model-helpers";

export interface ApplicationDocument {
  _id: Types.ObjectId;
  workerId: Types.ObjectId;
  shiftId: Types.ObjectId;
  status: ApplicationStatus;
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<ApplicationDocument>(
  {
    workerId: {
      type: Schema.Types.ObjectId,
      ref: "WorkerProfile",
      required: true,
      index: true
    },
    shiftId: {
      type: Schema.Types.ObjectId,
      ref: "Shift",
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: APPLICATION_STATUSES,
      default: "PENDING"
    }
  },
  {
    timestamps: true
  }
);

applicationSchema.index({ workerId: 1, shiftId: 1 }, { unique: true });
applicationSchema.index({ shiftId: 1, status: 1, createdAt: -1 });
applicationSchema.index({ workerId: 1, status: 1, createdAt: -1 });

const Application = getModel<ApplicationDocument>("Application", applicationSchema);

export default Application;
