import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  domain: string;
  emailDomains: string[];
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    domain: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    emailDomains: [{ type: String, lowercase: true, trim: true }],
  },
  { timestamps: true }
);

// always normalize the domain before save/update
CompanySchema.pre('save', function (next) {
  if (this.isModified('domain')) {
    const { normalizeDomain } = require('../../shared/utils');
    this.domain = normalizeDomain(this.domain);
  }
  next();
});

CompanySchema.pre('findOneAndUpdate', function (next) {
  const update: any = this.getUpdate();
  if (update && update.domain) {
    const { normalizeDomain } = require('../../shared/utils');
    update.domain = normalizeDomain(update.domain);
  }
  next();
});



export const Company: Model<ICompany> =
  mongoose.models.Company || mongoose.model<ICompany>('Company', CompanySchema);
