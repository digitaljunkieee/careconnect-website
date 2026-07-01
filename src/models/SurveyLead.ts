import { Schema, Types } from "mongoose";
import { getModel } from "@/models/model-helpers";
import {
  SURVEY_LEAD_STATUSES,
  SURVEY_USER_TYPES,
  type SurveyLeadStatus,
  type SurveyUserType
} from "@/lib/validators/survey";

export interface SurveyLeadDocument {
  _id: Types.ObjectId;
  fullName: string;
  email: string;
  phone: string;
  userType: SurveyUserType;
  location: string;
  surveyAnswers: Record<string, unknown>;
  notificationConsent: boolean;
  status: SurveyLeadStatus;
  createdAt: Date;
  updatedAt: Date;
}

const surveyLeadSchema = new Schema<SurveyLeadDocument>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: "", trim: true },
    userType: { type: String, required: true, enum: SURVEY_USER_TYPES, index: true },
    location: { type: String, required: true, trim: true },
    surveyAnswers: { type: Schema.Types.Mixed, required: true, default: {} },
    notificationConsent: { type: Boolean, required: true, default: true, index: true },
    status: { type: String, required: true, enum: SURVEY_LEAD_STATUSES, default: "WAITLISTED", index: true }
  },
  {
    collection: "survey_leads",
    timestamps: true
  }
);

surveyLeadSchema.index({ createdAt: -1 });

export default getModel<SurveyLeadDocument>("SurveyLead", surveyLeadSchema);
