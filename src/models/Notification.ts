import { Schema, Types } from "mongoose";
import {
  NOTIFICATION_RECIPIENT_ROLES,
  NOTIFICATION_TYPES,
  type NotificationRecipientRole,
  type NotificationType
} from "@/lib/constants";
import { getModel } from "@/models/model-helpers";

export interface NotificationDocument {
  _id: Types.ObjectId;
  recipient: Types.ObjectId;
  recipientRole: NotificationRecipientRole;
  userId?: Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  actionUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<NotificationDocument>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    recipientRole: {
      type: String,
      enum: NOTIFICATION_RECIPIENT_ROLES,
      required: true,
      index: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      default: "system"
    },
    isRead: {
      type: Boolean,
      default: false
    },
    actionUrl: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipientRole: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });

const Notification = getModel<NotificationDocument>(
  "Notification",
  notificationSchema
);

export default Notification;
