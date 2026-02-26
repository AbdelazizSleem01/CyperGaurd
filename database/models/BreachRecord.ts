import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBreachRecord extends Document {
  companyId: mongoose.Types.ObjectId;
  email: string;
  breachName: string;
  breachDate: string;
  dataClasses: string[];
  source: 'hibp' | 'dehashed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectedAt: Date;
}

const BreachRecordSchema = new Schema<IBreachRecord>({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  email: { type: String, required: true, lowercase: true },
  breachName: { type: String, required: true },
  breachDate: { type: String },
  dataClasses: [{ type: String }],
  source: { type: String, enum: ['hibp', 'dehashed'], required: true },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  detectedAt: { type: Date, default: Date.now },
});

BreachRecordSchema.index({ companyId: 1, email: 1, breachName: 1 }, { unique: true });

export const BreachRecord: Model<IBreachRecord> =
  mongoose.models.BreachRecord || mongoose.model<IBreachRecord>('BreachRecord', BreachRecordSchema);
