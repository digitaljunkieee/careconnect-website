import { Schema, Types } from "mongoose";
import { ROLES, type Role } from "@/lib/constants";
import { getModel } from "@/models/model-helpers";

export interface UserDocument {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  avatarUrl: string;
  avatarPublicId: string;
  notificationPreferences: {
    email: boolean;
    inApp: boolean;
    sms: boolean;
    weeklyDigest: boolean;
  };
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    phone: {
      type: String,
      default: ""
    },
    avatarUrl: {
      type: String,
      default: ""
    },
    avatarPublicId: {
      type: String,
      default: ""
    },
    password: {
      type: String,
      required: true
    },
    notificationPreferences: {
      email: {
        type: Boolean,
        default: true
      },
      inApp: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      weeklyDigest: {
        type: Boolean,
        default: true
      }
    },
    role: {
      type: String,
      enum: ROLES,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ createdAt: -1 });

const User = getModel<UserDocument>("User", userSchema);

export default User;
