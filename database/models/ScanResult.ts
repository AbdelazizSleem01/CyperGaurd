import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IScanResult extends Document {
  companyId: mongoose.Types.ObjectId;
  domain: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  ports: {
    port: number;
    state: 'open' | 'closed' | 'filtered';
    service: string;
    version?: string;
    product?: string;        // service banner/product information
    banner?: string;         // raw banner or HTTP server header
  }[];
  ssl: {
    domain: string;
    validFrom: Date;
    validTo: Date;
    validUntil: Date;
    issuer: string;
    subject: string;
    daysUntilExpiry: number;
    weakCiphers: string[];
    isValid: boolean;
  } | null;
  subdomains: { subdomain: string; ip?: string; status: string; ports?: number[] }[];
  outdatedSoftware: {
    name: string;
    currentVersion: string;
    latestVersion: string;
    severity: string;
    recommendation?: string;
  }[];
  discoveredPaths: {
    path: string;
    status: number;
    type: string;
  }[];
  // new advanced fields added to capture richer intelligence
  vulnerabilities: {
    title: string;
    description: string;
    severity: string;
    recommendation?: string;
    source?: string;
  }[];
  intelExtras: Record<string, any>;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
}

const ScanResultSchema = new Schema<IScanResult>({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  domain: { type: String, required: true },
  status: { type: String, enum: ['pending', 'running', 'completed', 'failed'], default: 'pending' },
  ports: [
    {
      port: Number,
      state: String,
      service: String,
      version: String,
      product: String,
      banner: String,
    },
  ],
  ssl: {
    domain: String,
    validFrom: Date,
    validTo: Date,
    validUntil: Date,
    issuer: String,
    subject: String,
    daysUntilExpiry: Number,
    weakCiphers: [String],
    isValid: Boolean,
  },
  subdomains: [
    {
      subdomain: String,
      ip: String,
      status: String,
      ports: [Number],
    },
  ],
  outdatedSoftware: [
    {
      name: String,
      currentVersion: String,
      latestVersion: String,
      severity: String,
      recommendation: String,
    },
  ],
  discoveredPaths: [
    {
      path: String,
      status: Number,
      type: String,
    },
  ],
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  error: { type: String },
  // advanced additions
  vulnerabilities: [
    {
      title: String,
      description: String,
      severity: String,
      recommendation: String,
      source: String,
    },
  ],
  intelExtras: { type: Schema.Types.Mixed },
});

ScanResultSchema.index({ companyId: 1, startedAt: -1 });

export const ScanResult: Model<IScanResult> =
  mongoose.models.ScanResult || mongoose.model<IScanResult>('ScanResult', ScanResultSchema);
