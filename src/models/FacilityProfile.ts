import { Schema, Types } from "mongoose";
import { getModel } from "@/models/model-helpers";

export interface FacilityProfileDocument {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  companyName: string;
  address: string;
  contactNumber: string;
  website: string;
  facilityType: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const facilityProfileSchema = new Schema<FacilityProfileDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },
    companyName: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      default: ""
    },
    contactNumber: {
      type: String,
      default: ""
    },
    website: {
      type: String,
      default: ""
    },
    facilityType: {
      type: String,
      default: ""
    },
    description: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

facilityProfileSchema.index({
  companyName: "text",
  address: "text",
  website: "text",
  facilityType: "text",
  description: "text"
});
facilityProfileSchema.index({ createdAt: -1 });

const FacilityProfile = getModel<FacilityProfileDocument>(
  "FacilityProfile",
  facilityProfileSchema
);

export default FacilityProfile;
