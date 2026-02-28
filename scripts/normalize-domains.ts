/*
One-off script to normalize domains stored in the database for companies and scans.
Run with: ts-node scripts/normalize-domains.ts (or compile to JS)
*/

import { connectToDatabase } from '../database/connection';
import { Company } from '../database/models/Company';
import { ScanResult } from '../database/models/ScanResult';
import { normalizeDomain } from '../shared/utils';

async function main() {
  await connectToDatabase();
  console.log('Normalizing company domains...');
  const companies = await Company.find({});
  for (const comp of companies) {
    const orig = comp.domain;
    const norm = normalizeDomain(orig);
    if (norm !== orig) {
      console.log(` - updating company ${comp._id}: ${orig} -> ${norm}`);
      comp.domain = norm;
      await comp.save();
    }
  }

  console.log('Normalizing scan record domains...');
  const scans = await ScanResult.find({});
  for (const s of scans) {
    const orig = s.domain;
    const norm = normalizeDomain(orig);
    if (norm !== orig) {
      console.log(` - updating scan ${s._id}: ${orig} -> ${norm}`);
      s.domain = norm;
      await s.save();
    }
  }

  console.log('Done.');
  process.exit(0);
}

main().catch(err => {
  console.error('Normalization script failed', err);
  process.exit(1);
});