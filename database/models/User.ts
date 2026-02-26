import mongoose, { Schema, Document, Model } from 'mongoose';
import type { UserRole } from '../../shared/types';

export interface IApiKey {
  keyId: string;
  name: string;
  key: string;
  createdAt: Date;
  lastUsed: Date | null;
  expiresAt: Date | null;
  permissions: string[];
}

export interface IActiveSession {
  sessionId: string;
  userAgent: string;
  ipAddress: string;
  createdAt: Date;
  lastActivity: Date;
  isCurrent: boolean;
}

export interface IUser extends Document {
  email: string;
  name: string;
  passwordHash: string;
  role: UserRole;
  companyId: mongoose.Types.ObjectId;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  lastPasswordChange: Date;
  activeSessions: IActiveSession[];
  loginAttempts: number;
  lockUntil: Date | null;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ActiveSessionSchema = new Schema<IActiveSession>({
  sessionId: { type: String, required: true },
  userAgent: { type: String, default: 'Unknown' },
  ipAddress: { type: String, default: 'Unknown' },
  createdAt: { type: Date, default: Date.now },
  lastActivity: { type: Date, default: Date.now },
  isCurrent: { type: Boolean, default: false },
}, { _id: false });

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, select: false },
    lastPasswordChange: { type: Date, default: Date.now },
    activeSessions: [ActiveSessionSchema],
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
  },
  { timestamps: true }
);


UserSchema.index({ companyId: 1 });

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
