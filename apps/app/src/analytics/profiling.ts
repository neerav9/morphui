import {
  calculateAdvancedNumericMetrics,
  calculateShannonEntropy,
} from "./metrics";
import type {
  ColumnProfile,
  CleanedColumn,
} from "../types";
export function profileDataset(columns: CleanedColumn[], data: Record<string, unknown>[]): ColumnProfile[] {
  const profiles: ColumnProfile[] = [];
  const MAX_SAMPLES = 2000;
  let sampleData = data.filter((_,i) => i % Math.max(1,Math.floor(data.length/MAX_SAMPLES)) === 0).slice(0,MAX_SAMPLES);
  const temporalCol = columns.find(c => c.role === "TEMPORAL");
  let isChronological = false;
  if (temporalCol) {
    const validDates = sampleData.map(r => Date.parse(String(r[temporalCol.rawName]??""))).filter(d => !isNaN(d));
    if (validDates.length > sampleData.length * 0.5) {
      sampleData.sort((a,b) => { 
        const da=Date.parse(String(a[temporalCol.rawName]??"")),db=Date.parse(String(b[temporalCol.rawName]??"")); 
        return (!isNaN(da)&&!isNaN(db))?da-db:0; 
      });
      isChronological = true;
    }
  }
  for (const col of columns) {
    let nullCount=0, numericCount=0;
    const values: unknown[] = [], valueFrequencies: Record<string,number> = {};
    for (const row of sampleData) {
      const val = row[col.rawName];
      if (val===undefined||val===null||String(val).trim()==="") { nullCount++; continue; }
      const strVal = String(val).trim();
      values.push(val); valueFrequencies[strVal]=(valueFrequencies[strVal]||0)+1;
      if (!isNaN(Number(val))&&strVal!=="") numericCount++;
    }
    const nonNullCount = values.length;
    const isNumeric = nonNullCount>0 && (numericCount/nonNullCount)>0.8;
    const profile: ColumnProfile = { 
      cleanName:col.cleanName, 
      rawKey:col.rawKey, 
      inferredType:isNumeric?"numeric":"categorical", 
      role:col.role, 
      domain:col.domain, 
      nullPercent:Math.round((nullCount/sampleData.length)*100), 
      nullCount,
      uniquePercent:nonNullCount===0?0:Math.round((Object.keys(valueFrequencies).length/nonNullCount)*100), 
      rawValues:[] 
    };
    if (isNumeric && nonNullCount>0) {
      const numValues = values.map(v=>Number(v)).filter(v=>!isNaN(v));
      const advanced = calculateAdvancedNumericMetrics(numValues);
      
      profile.avg = advanced.mean.toString();
      profile.min = advanced.min.toString();
      profile.max = advanced.max.toString();
      profile.stdDev = advanced.stdDev.toString();
      profile.outlierCount = advanced.zScoreOutliers.length;
      profile.entropy = advanced.entropy;
      profile.skewness = advanced.skewness;
      profile.rollingVolatility = advanced.rollingVolatility;
      profile.regimeShiftDetected = advanced.regimeShiftDetected;
      profile.rawValues = numValues.slice(0, 30);

      if (numValues.length>=10) {
        const half=Math.floor(numValues.length/2),avg1=numValues.slice(0,half).reduce((a,b)=>a+b,0)/half,avg2=numValues.slice(half).reduce((a,b)=>a+b,0)/half;
        if (avg1!==0) { 
          const shift=((avg2-avg1)/Math.abs(avg1))*100; 
          if(isChronological) profile.temporalDrift=`${shift>0?"+":""}${shift.toFixed(1)}%`; 
          else profile.sequentialVolatility=`${shift>0?"+":""}${shift.toFixed(1)}%`; 
        }
      }
    } else {
      profile.topClusters = Object.keys(valueFrequencies).sort((a,b)=>valueFrequencies[b]-valueFrequencies[a]).slice(0,4).map(v=>`${v} (${Math.round((valueFrequencies[v]/nonNullCount)*100)}%)`);
      profile.entropy = calculateShannonEntropy(values.map(v => typeof v === 'number' ? v : 1));
    }
    profiles.push(profile);
  }
  return profiles;
}
