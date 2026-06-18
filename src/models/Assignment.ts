import { Schema, Types } from "mongoose";
import { ASSIGNMENT_STATUSES, type AssignmentStatus } from "@/lib/constants";
import { getModel } from "@/models/model-helpers";

export interface AssignmentDocument {
  _id: Types.ObjectId;
  workerId: Types.ObjectId;
  facilityId: Types.ObjectId;
  shiftId: Types.ObjectId;
  assignedAt: Date;
  status: AssignmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const assignmentSchema = new Schema<AssignmentDocument>(
  {
    workerId: {
      type: Schema.Types.ObjectId,
      ref: "WorkerProfile",
      required: true,
      index: true
    },
    facilityId: {
      type: Schema.Types.ObjectId,
      ref: "FacilityProfile",
      required: true,
      index: true
    },
    shiftId: {
      type: Schema.Types.ObjectId,
      ref: "Shift",
      required: true,
      unique: true,
      index: true
    },
    assignedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ASSIGNMENT_STATUSES,
      default: "UPCOMING"
    }
  },
  {
    timestamps: true
  }
);

assignmentSchema.index({ workerId: 1, status: 1, assignedAt: 1 });
assignmentSchema.index({ facilityId: 1, status: 1, assignedAt: 1 });

const Assignment = getModel<AssignmentDocument>("Assignment", assignmentSchema);

export default Assignment;
