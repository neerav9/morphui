import type {
  ColumnProfile,
  CausalRelation,
} from "../types";
export function calculateCausalRelations(profiles: ColumnProfile[], rawData: Record<string, unknown>[]): CausalRelation[] {
  const relations: CausalRelation[] = [];
  const numericProfiles = profiles.filter(p => p.inferredType === "numeric");
  const MAX_COMPARE_SAMPLES = 1000;
  const samples = rawData.slice(0, MAX_COMPARE_SAMPLES);

  for (let i = 0; i < numericProfiles.length; i++) {
    for (let j = i + 1; j < numericProfiles.length; j++) {
      const colA = numericProfiles[i];
      const colB = numericProfiles[j];

      const x: number[] = [];
      const y: number[] = [];

      for (const row of samples) {
        // Safe mapping using verified raw CSV keys
        const valA = Number(row[colA.rawKey]); 
        const valB = Number(row[colB.rawKey]);
        if (!isNaN(valA) && !isNaN(valB)) {
          x.push(valA);
          y.push(valB);
        }
      }

      const len = x.length;
      if (len < 5) continue;

      const meanX = x.reduce((a, b) => a + b, 0) / len;
      const meanY = y.reduce((a, b) => a + b, 0) / len;

      let covarianceSum = 0;
      let varXSum = 0;
      let varYSum = 0;

      for (let k = 0; k < len; k++) {
        const diffX = x[k] - meanX;
        const diffY = y[k] - meanY;
        covarianceSum += diffX * diffY;
        varXSum += diffX * diffX;
        varYSum += diffY * diffY;
      }

      const covariance = covarianceSum / len;
      const denom = Math.sqrt(varXSum * varYSum);
      const pearsonR = denom === 0 ? 0 : covarianceSum / denom;

      let direction: CausalRelation["direction"] = "stable_uncoupled";
      if (pearsonR >= 0.45) direction = "positive_feedback";
      else if (pearsonR <= -0.45) direction = "inverse_coupling";

      if (Math.abs(pearsonR) >= 0.35) {
        relations.push({
          source: colA.cleanName,
          target: colB.cleanName,
          covariance: parseFloat(covariance.toFixed(3)),
          pearsonR: parseFloat(pearsonR.toFixed(3)),
          direction,
          entropyGap: parseFloat(Math.abs((colA.entropy ?? 0) - (colB.entropy ?? 0)).toFixed(3))
        });
      }
    }
  }

  return relations.sort((a,b) => Math.abs(b.pearsonR) - Math.abs(a.pearsonR));
}