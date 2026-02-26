'use strict';

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotificationSettings {
  emailOnNewBreach: boolean;
  emailOnScanComplete: boolean;
  emailOnHighRisk: boolean;
  toastOnNewBreach: boolean;
  toastOnScanComplete: boolean;
  weeklyDigest: boolean;
  notificationEmail: string;
}

export interface IScheduleSettings {
  autoScanEnabled: boolean;
  frequency: 'daily' | 'weekly' | 'manual';
  scanTime: string;
  scanDay: string;
  scanTypes: string[];
  timezone: string;
}

export interface ISettings extends Document {
  companyId: mongoose.Types.ObjectId;
  notifications: INotificationSettings;
  schedule: IScheduleSettings;
  lastAutoScanAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSettingsSchema = new Schema<INotificationSettings>({
  emailOnNewBreach: { type: Boolean, default: true },
  emailOnScanComplete: { type: Boolean, default: false },
  emailOnHighRisk: { type: Boolean, default: true },
  toastOnNewBreach: { type: Boolean, default: true },
  toastOnScanComplete: { type: Boolean, default: true },
  weeklyDigest: { type: Boolean, default: false },
  notificationEmail: { type: String, default: '' },
}, { _id: false });

const ScheduleSettingsSchema = new Schema<IScheduleSettings>({
  autoScanEnabled: { type: Boolean, default: true },
  frequency: { type: String, enum: ['daily', 'weekly', 'manual'], default: 'daily' },
  scanTime: { type: String, default: '02:00' },
  scanDay: { type: String, default: 'monday' },
  scanTypes: [{ type: String, default: ['port-scan', 'ssl-check', 'breach-check', 'risk-calc'] }],
  timezone: { type: String, default: 'UTC' },
}, { _id: false });

const SettingsSchema = new Schema<ISettings>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, unique: true },
    notifications: { type: NotificationSettingsSchema, default: () => ({}) },
    schedule: { type: ScheduleSettingsSchema, default: () => ({}) },
    lastAutoScanAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Settings: Model<ISettings> =
  mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);