import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRiskAssessment extends Document {
  companyId: mongoose.Types.ObjectId;
  scanId?: mongoose.Types.ObjectId;
  score: number;
  category: 'Low' | 'Medium' | 'High' | 'Critical';
  findings: {
    id: string;
    category: string;
    title: string;
    description: string;
    severity: string;
    recommendation: string;
    affectedAsset: string;
  }[];
  createdAt: Date;
}

const RiskAssessmentSchema = new Schema<IRiskAssessment>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    scanId: { type: Schema.Types.ObjectId, ref: 'ScanResult' },
    score: { type: Number, min: 0, max: 100, required: true },
    category: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], required: true },
    findings: [
      {
        id: String,
        category: String,
        title: String,
        description: String,
        severity: String,
        recommendation: String,
        affectedAsset: String,
      },
    ],
  },
  { timestamps: true }
);

RiskAssessmentSchema.index({ companyId: 1, createdAt: -1 });

export const RiskAssessment: Model<IRiskAssessment> =
  mongoose.models.RiskAssessment ||
  mongoose.model<IRiskAssessment>('RiskAssessment', RiskAssessmentSchema);
