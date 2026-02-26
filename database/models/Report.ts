import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReport extends Document {
  companyId: mongoose.Types.ObjectId;
  title: string;
  format: 'pdf' | 'excel' | 'word';
  language: 'en' | 'ar';
  riskScore: number;
  riskCategory: string;
  stats: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    openPorts: number;
    subdomains: number;
    sensitivePaths: number;
  };
  sensitivePathsFound: {
    path: string;
    status: number;
    type: string;
  }[];
  summary: string;
  recommendations: string[];
  generatedAt: Date;
  filePath?: string;
}

const ReportSchema = new Schema<IReport>({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  title: { type: String, required: true },
  format: { type: String, enum: ['pdf', 'excel', 'word'], default: 'pdf' },
  language: { type: String, enum: ['en', 'ar'], default: 'en' },
  riskScore: { type: Number, min: 0, max: 100, default: 75 },
  riskCategory: { type: String, default: 'Medium' },
  stats: {
    critical: { type: Number, default: 0 },
    high: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    low: { type: Number, default: 0 },
    openPorts: { type: Number, default: 0 },
    subdomains: { type: Number, default: 0 },
    sensitivePaths: { type: Number, default: 0 },
  },
  sensitivePathsFound: [
    {
      path: String,
      status: Number,
      type: String,
    },
  ],
  summary: { type: String },
  recommendations: [{ type: String }],
  generatedAt: { type: Date, default: Date.now },
  filePath: { type: String },
});

export const Report: Model<IReport> =
  mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);