import { Schema, Types } from "mongoose";
import {
  WORKER_ROLE_TYPES,
  VERIFICATION_STATUSES,
  type WorkerRoleType,
  type VerificationStatus
} from "@/lib/constants";
import { getModel } from "@/models/model-helpers";

export interface CloudinaryDocument {
  publicId?: string;
  secureUrl?: string;
  resourceType?: string;
  name?: string;
  uploadedAt?: Date;
  expiresAt?: Date;
}

export interface WorkerProfileDocument {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  phone: string;
  addressHistory: string[];
  niNumber: string;
  shareCode: string;
  roleType: WorkerRoleType;
  verificationStatus: VerificationStatus;
  isVerified: boolean;
  cloudinaryDocuments: CloudinaryDocument[];
  createdAt: Date;
  updatedAt: Date;
}

const cloudinaryDocumentSchema = new Schema<CloudinaryDocument>(
  {
    publicId: String,
    secureUrl: String,
    resourceType: String,
    name: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      default: null
    }
  },
  { _id: false }
);

const workerProfileSchema = new Schema<WorkerProfileDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },
    phone: {
      type: String,
      default: ""
    },
    addressHistory: {
      type: [String],
      default: []
    },
    niNumber: {
      type: String,
      default: ""
    },
    shareCode: {
      type: String,
      default: ""
    },
    roleType: {
      type: String,
      enum: WORKER_ROLE_TYPES,
      default: "CARE_SUPPORT"
    },
    verificationStatus: {
      type: String,
      enum: VERIFICATION_STATUSES,
      default: "PENDING"
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    cloudinaryDocuments: {
      type: [cloudinaryDocumentSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

workerProfileSchema.index({ verificationStatus: 1, isVerified: 1 });
workerProfileSchema.index({ roleType: 1, verificationStatus: 1 });

const WorkerProfile = getModel<WorkerProfileDocument>(
  "WorkerProfile",
  workerProfileSchema
);

export default WorkerProfile;
