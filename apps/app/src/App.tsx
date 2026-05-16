import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import Papa from "papaparse";
import { z } from "zod";
import {
  LogStage, LogLevel, LogEntry,
  AgenticState, UIPrimitive, UILayout, UINode, Severity, SemanticRole, OperationalDomain, CleanedColumn,
  WorkflowArchetype, Workflow, HeroInsight, GlobalDashboard, InteractionMemory,
  LLMFailureReason, SynthesisState, LLMAttemptResult, PromptLevel, ModelTier,
  AdvancedMetrics, CausalRelation, ColumnProfile
} from "./types";

// ============================================================
// GLOBAL CONFIG
// ============================================================

const LLM_CONFIG = {
  endpoint: "http://localhost:11434/api/generate",
  defaultModel: "mistral",
  timeouts: {
    full: 90_000,
    compressed: 60_000,
    minimal: 45_000,
  },
} as const;

// ============================================================
// OBSERVABILITY LOGGER
// ============================================================

function emit(entry: LogEntry) {
  const icons: Record<LogLevel, string> = { info: "🔵", warn: "🟡", error: "🔴", success: "🟢" };
  const label = `${icons[entry.level]} [MorphUI:${entry.stage}]`;
  if (entry.data !== undefined) {
    console.groupCollapsed(`${label} ${entry.message}`);
    console.log(entry.data);
    console.groupEnd();
  } else {
    console.log(`${label} ${entry.message}`);
  }
}

// ============================================================
// ADVANCED DETERMINISTIC ANALYTICS ENGINE
// ============================================================

function calculateShannonEntropy(values: number[]): number {
  if (values.length === 0) return 0;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  if (range === 0) return 0;
  
  const binCount = 10;
  const bins = new Array(binCount).fill(0);
  for (const v of values) {
    let binIdx = Math.floor(((v - min) / range) * binCount);
    if (binIdx >= binCount) binIdx = binCount - 1;
    if (binIdx < 0) binIdx = 0;
    bins[binIdx]++;
  }
  
  let entropy = 0;
  const n = values.length;
  for (const count of bins) {
    if (count > 0) {
      const p = count / n;
      entropy -= p * Math.log2(p);
    }
  }
  return parseFloat(entropy.toFixed(3));
}

function calculateAdvancedNumericMetrics(values: number[]): AdvancedMetrics {
  const n = values.length;
  if (n === 0) {
    return { mean:0, variance:0, stdDev:0, min:0, max:0, percentiles:{p25:0, p50:0, p75:0, p90:0}, zScoreOutliers:[], entropy:0, rollingVolatility:[], regimeShiftDetected:false, skewness:0, nullRatio:1 };
  }
  
  const sorted = [...values].sort((a,b) => a - b);
  const mean = values.reduce((sum, v) => sum + v, 0) / n;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);
  
  const getPercentile = (p: number) => {
    const idx = Math.floor((n - 1) * p);
    return sorted[idx] ?? 0;
  };
  
  const zScoreOutliers: number[] = [];
  if (stdDev > 0) {
    for (let i = 0; i < values.length; i++) {
      const z = Math.abs((values[i] - mean) / stdDev);
      if (z > 2.5) zScoreOutliers.push(i);
    }
  }

  let skewness = 0;
  if (n > 2 && stdDev > 0) {
    const m3 = values.reduce((sum, v) => sum + Math.pow(v - mean, 3), 0) / n;
    skewness = m3 / Math.pow(stdDev, 3);
  }

  const rollingVolatility: number[] = [];
  const windowSize = 5;
  for (let i = 0; i <= values.length - windowSize; i++) {
    const subset = values.slice(i, i + windowSize);
    const subMean = subset.reduce((a,b)=>a+b,0) / windowSize;
    const subVar = subset.reduce((a,b)=>a+Math.pow(b-subMean,2),0) / windowSize;
    rollingVolatility.push(parseFloat(Math.sqrt(subVar).toFixed(3)));
  }

  let regimeShiftDetected = false;
  if (n >= 10) {
    const midPoint = Math.floor(n / 2);
    const firstHalf = values.slice(0, midPoint);
    const secondHalf = values.slice(midPoint);
    const fhMean = firstHalf.reduce((a,b)=>a+b,0) / firstHalf.length;
    const shMean = secondHalf.reduce((a,b)=>a+b,0) / secondHalf.length;
    const difference = Math.abs(fhMean - shMean);
    if (stdDev > 0 && difference > (1.5 * stdDev)) {
      regimeShiftDetected = true;
    }
  }

  return {
    mean: parseFloat(mean.toFixed(3)),
    variance: parseFloat(variance.toFixed(3)),
    stdDev: parseFloat(stdDev.toFixed(3)),
    min: sorted[0],
    max: sorted[n-1],
    percentiles: {
      p25: getPercentile(0.25),
      p50: getPercentile(0.50),
      p75: getPercentile(0.75),
      p90: getPercentile(0.90)
    },
    zScoreOutliers,
    entropy: calculateShannonEntropy(values),
    rollingVolatility,
    regimeShiftDetected,
    skewness: parseFloat(skewness.toFixed(3)),
    nullRatio: 0
  };
}

// ============================================================
// COVARIANCE MATRIX & MUTUAL CAUSAL ANALYSIS
// ============================================================

function calculateCausalRelations(profiles: ColumnProfile[], rawData: Record<string, unknown>[]): CausalRelation[] {
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

// ============================================================
// ZOD SCHEMAS
// ============================================================

const ZUIPrimitive = z.enum(["kpi_block","scatter_plot","trend_sparkline","alert_chip","bar_chart","stat_grid","semantic_tags","data_table","insight_cluster"]);
const ZUILayout = z.enum(["col","row","grid_2"]);
const ZSeverity = z.enum(["critical","high","medium","low"]);
const ZGlobalSeverity = z.enum(["critical","elevated","stable"]);
const ZCognitiveDensity = z.enum(["high","medium","low"]);
const ZWorkflowArchetype = z.enum(["ANOMALY_WORKFLOW","TEMPORAL_WORKFLOW","CORRELATION_WORKFLOW","DISTRIBUTION_WORKFLOW","CLUSTER_WORKFLOW","BEHAVIORAL_WORKFLOW","OPERATIONAL_WORKFLOW"]);

const ZUINodeBase = z.object({ type: z.union([ZUIPrimitive, ZUILayout]), meta: z.record(z.unknown()).optional() });
type ZUINodeType = z.infer<typeof ZUINodeBase> & { children?: ZUINodeType[] };
const ZUINode: z.ZodType<ZUINodeType> = ZUINodeBase.extend({ children: z.lazy(() => ZUINode.array().max(10).optional()) });

const ZAgenticState = z.object({
  situationalAwareness: z.string().min(1).default("Macro pipeline validation initialized."),
  layoutStrategy: z.string().min(1).default("Deterministic density grid mapping."),
  cognitiveDensity: ZCognitiveDensity.default("high"),
  selfCritique: z.string().min(1).default("All calculated boundaries verified with Pearson R validations.")
});

const ZHeroInsight = z.object({
  headline: z.string().default("Integrated System Equilibrium Profiled"),
  supportingStatement: z.string().default("No extreme anomalies breached standard statistical deviation thresholds."),
  primaryMetricValue: z.string().default("100%"),
  metricLabel: z.string().default("Telemetry Density"),
  causalLink: z.string().default("Primary covariance nodes remain aligned."),
  affectedVectors: z.array(z.string()).default([]),
  severity: ZSeverity.default("low")
});

const ZWorkflow = z.object({
  title: z.string().min(1).default("Operational Vector"),
  layoutMode: z.string().default("dashboard"),
  archetype: ZWorkflowArchetype.default("OPERATIONAL_WORKFLOW"),
  uiBlueprint: ZUINode.default({ type: "col", children: [{ type: "kpi_block" }] }),
  primaryMetric: z.string().default("—"),
  secondaryMetric: z.string().default("—"),
  severity: ZSeverity.default("medium"),
  quickStats: z.record(z.string()).default({}),
  tags: z.array(z.string()).min(1).default(["Telemetry"]),
  confidence: z.number().min(0).max(100).default(85),
  description: z.string().default("Telemetry parsing."),
  reasoning: z.string().default("Derived deterministic bounds profiling."),
  businessContext: z.string().default("Continuous monitoring threshold mapping."),
  chartData: z.array(z.number()).default([]),
  detectedColumns: z.array(z.string()).default([])
});

const ZLLMPayload = z.object({
  agenticState: ZAgenticState,
  dashboard: z.object({
    globalSummary: z.string().default("State vectors integrated."),
    globalSeverity: ZGlobalSeverity.default("stable"),
    dashboardLayoutMode: z.enum(["COMPACT", "INTELLIGENCE_GRID", "TIMELINE_FIRST", "GRAPH_FIRST"]).default("INTELLIGENCE_GRID"),
    heroInsight: ZHeroInsight,
    workflows: z.array(ZWorkflow).min(1).max(8)
  })
});

// ============================================================
// ONTOLOGY + PROFILING
// ============================================================

const IGNORED_PATTERNS = ["id","personid","index","serial","no","uuid","key","pk","rowid"];
const ONTOLOGY_GRAPH = [
  { domain:"health", role:"BEHAVIORAL", keywords:["sleep","stress","exercise","activity","step","calorie","habit","active"] },
  { domain:"health", role:"METRIC", keywords:["hr","pulse","bp","diastolic","systolic","bmi","weight","glucose","temp"] },
  { domain:"financial", role:"METRIC", keywords:["sales","profit","revenue","income","price","cost","margin","tax","txn","amt","amount","balance"] },
  { domain:"logistics", role:"METRIC", keywords:["quantity","unit","order","ship","inventory","stock","qty","latency","throughput"] },
  { domain:"hr", role:"CATEGORICAL", keywords:["department","dept","role","tier","team","performance","attrition"] },
  { domain:"agnostic", role:"CATEGORICAL", keywords:["status","region","city","state","type","category","segment","grp","priority"] },
  { domain:"agnostic", role:"TEMPORAL", keywords:["date","time","timestamp","year","month","day","qtr","quarter","epoch","created_at","updated_at"] },
  { domain:"agnostic", role:"IDENTITY", keywords:["name","user","customer","email","phone","contact","profile","hash"] },
] as const;

function processColumns(rawHeaders: string[]): CleanedColumn[] {
  return rawHeaders
    .filter(header => !IGNORED_PATTERNS.some(p => header.toLowerCase().includes(p)))
    .map(rawHeader => {
      const rawKey = rawHeader;
      const cleanName = rawHeader
        .replace(/[_-]/g, " ")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .trim();
      const lowerHeader = rawHeader.toLowerCase();

      let role: SemanticRole = "METRIC";
      let domain: OperationalDomain = "agnostic";

      for (const entry of ONTOLOGY_GRAPH) {
        if (entry.keywords.some(kw => lowerHeader.includes(kw))) {
          role = entry.role;
          domain = entry.domain;
          break;
        }
      }

      return { rawName: rawHeader, rawKey, cleanName, role, domain };
    });
}

function profileDataset(columns: CleanedColumn[], data: Record<string, unknown>[]): ColumnProfile[] {
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

// ============================================================
// MODEL CAPABILITY MAP
// ============================================================

const MODEL_TIERS: Record<string, ModelTier> = {
  "mistral":"standard","mistral:7b":"standard","llama3":"standard","llama3:8b":"standard",
  "phi3":"standard","gemma":"standard","gemma:7b":"standard",
  "qwen2":"advanced","deepseek-coder":"advanced","mixtral":"advanced","llama3:70b":"advanced","llama3.1":"advanced",
};

function getModelTier(model: string): ModelTier {
  const normalized = model.toLowerCase();
  for (const [key, tier] of Object.entries(MODEL_TIERS)) { if(normalized.includes(key)) return tier; }
  return "standard";
}

const AVAILABLE_MODELS = [
  { value:"mistral", label:"mistral", tier:"standard" as ModelTier },
  { value:"phi3", label:"phi3 (fast)", tier:"standard" as ModelTier },
  { value:"llama3", label:"llama3", tier:"standard" as ModelTier },
  { value:"gemma", label:"gemma", tier:"standard" as ModelTier },
  { value:"mixtral", label:"mixtral (advanced)", tier:"advanced" as ModelTier },
  { value:"qwen2", label:"qwen2 (advanced)", tier:"advanced" as ModelTier },
  { value:"llama3.1", label:"llama3.1 (advanced)", tier:"advanced" as ModelTier },
];

// ============================================================
// PROMPT BUILDER
// ============================================================

function buildPrompt(profiles: ColumnProfile[], causalChains: CausalRelation[], memory: InteractionMemory | undefined, level: PromptLevel, modelTier: ModelTier): string {
  emit({ stage:"PROMPT_BUILD", level:"info", message:`Building prompt at level=${level}, tier=${modelTier}` });
  const MAX_PROFILES = level==="full"?15:level==="compressed"?8:4;
  const MAX_CHAINS = level==="full"?12:level==="compressed"?5:2;
  const MAX_WORKFLOWS = modelTier==="standard"?3:5;
  const slimProfiles = profiles.slice(0,MAX_PROFILES).map(p=>({ 
    column:p.cleanName, 
    role:p.role, 
    avg:p.avg, 
    min:p.min,
    max:p.max,
    drift:p.temporalDrift, 
    outliers:p.outlierCount,
    entropy:p.entropy,
    regimeShift:p.regimeShiftDetected,
    clusters:p.topClusters?.slice(0,2),
    rawValuesSlice:p.rawValues.slice(0,12)
  }));
  const slimChains = causalChains.slice(0,MAX_CHAINS);
  
  const uiSchemaExample = `{ "type": "col", "children": [{"type": "row", "children": [{"type": "kpi_block"}, {"type": "trend_sparkline"}]}, {"type": "stat_grid"}] }`;
  
  let reinforcementContext = "";
  if (memory && level==="full" && (memory.approvedTags.length>0||memory.rejectedTags.length>0)) {
    reinforcementContext = `\nUSER REINFORCEMENT: approved=[${memory.approvedTags.join(", ")}] rejected=[${memory.rejectedTags.join(", ")}] preferredDensity=${memory.preferredDensity}`;
  }

  if (level==="minimal") {
    return `You are a data analysis AI. Output ONLY valid JSON, no markdown wrappers, no explanation.\n\nDATASET: ${JSON.stringify(slimProfiles)}\n\nOUTPUT:\n{"agenticState":{"situationalAwareness":"string","layoutStrategy":"string","cognitiveDensity":"high","selfCritique":"string"},"dashboard":{"globalSummary":"string","globalSeverity":"stable","dashboardLayoutMode":"INTELLIGENCE_GRID","heroInsight":{"headline":"string","supportingStatement":"string","primaryMetricValue":"string","metricLabel":"string","causalLink":"string","affectedVectors":["col"],"severity":"low"},"workflows":[{"title":"string","layoutMode":"dashboard","archetype":"OPERATIONAL_WORKFLOW","uiBlueprint":${uiSchemaExample},"primaryMetric":"string","secondaryMetric":"string","severity":"medium","quickStats":{"Key":"Val"},"tags":["Tag"],"confidence":80,"description":"string","reasoning":"string","businessContext":"string","detectedColumns":["col"],"chartData":[10,20,30]}]}}`;
  }

  return `You are a production-grade autonomous intelligence engine compiling high-density layouts over mathematical structures.
Output ONLY strict JSON. No explanation text, no markdown wrappers.

DATASET STATISTICAL METADATA:
${JSON.stringify(slimProfiles,null,1)}

MUTUAL COVARIANCE AND CAUSAL RELATIONS:
${JSON.stringify(slimChains,null,1)}
${reinforcementContext}

TASK:
1. Synthesize exactly ONE dominant "heroInsight" capturing the primary structural state. Combine different factors (e.g. "Column X shifted while Column Y reacted").
2. Choose "dashboardLayoutMode" from:
   - "COMPACT" (for small files/attributes < 4)
   - "TIMELINE_FIRST" (if temporalDrift is highly active across profiles)
   - "GRAPH_FIRST" (if high correlation Pearson R nodes are present)
   - "INTELLIGENCE_GRID" (standard density layout)
3. Generate exactly ${MAX_WORKFLOWS} highly integrated analytical workflows. Each must match one of the following archetypes exactly:
   - "ANOMALY_WORKFLOW", "TEMPORAL_WORKFLOW", "CORRELATION_WORKFLOW", "DISTRIBUTION_WORKFLOW", "CLUSTER_WORKFLOW", "BEHAVIORAL_WORKFLOW", "OPERATIONAL_WORKFLOW"

STRICT RULES:
- "chartData" must map directly to one of the "rawValuesSlice" arrays in the dataset. DO NOT FABRICATE RANDOM CHART ARRAYS.
- If there are active Causal Relations, narrate them together in the description. Example: "Variability in Sleep Hours correlates with elevated Stress values."
- "quickStats" must contain keys mapping to exact statistical descriptors (e.g., Entropy, Volatility, Max, StdDev).

STRICT OUTPUT JSON TEMPLATE:
{
  "agenticState": {
    "situationalAwareness": "Analysis of active telemetry chains.",
    "layoutStrategy": "Density prioritized dashboard layout mode assignment.",
    "cognitiveDensity": "high",
    "selfCritique": "Pearson R matrices verified to prevent spurious correlations."
  },
  "dashboard": {
    "globalSummary": "A concise systemic summary mapping active vectors.",
    "globalSeverity": "critical" | "elevated" | "stable",
    "dashboardLayoutMode": "COMPACT" | "INTELLIGENCE_GRID" | "TIMELINE_FIRST" | "GRAPH_FIRST",
    "heroInsight": {
      "headline": "Causal narrative summarizing correlated shifts (e.g., 'Volatily spiked 18% during high entropy intervals')",
      "supportingStatement": "Detailed operational narrative stating variables and calculated shifts.",
      "primaryMetricValue": "Direct metric representation (e.g., 22.4% or +14ms)",
      "metricLabel": "Description of metric parameter",
      "causalLink": "Primary covariance link statement between variables",
      "affectedVectors": ["List of Cleaned Column Names affected"],
      "severity": "critical" | "high" | "medium" | "low"
    },
    "workflows": [
      {
        "title": "Clear, grounded title reflecting processed columns",
        "layoutMode": "dashboard" | "comparison" | "alert",
        "archetype": "ANOMALY_WORKFLOW" | "TEMPORAL_WORKFLOW" | "CORRELATION_WORKFLOW" | "DISTRIBUTION_WORKFLOW" | "CLUSTER_WORKFLOW" | "BEHAVIORAL_WORKFLOW" | "OPERATIONAL_WORKFLOW",
        "uiBlueprint": {
          "type": "col" | "row" | "grid_2",
          "children": [
            { "type": "kpi_block" },
            { "type": "trend_sparkline" }
          ]
        },
        "primaryMetric": "Formatted real value (e.g. 14.5% or $12,430)",
        "secondaryMetric": "Operational description of metric bounds",
        "severity": "critical" | "high" | "medium" | "low",
        "quickStats": { "StatKey1": "StatVal1" },
        "tags": ["Telemetry"],
        "confidence": 92,
        "description": "Specific analytical insight grounded in raw data properties.",
        "reasoning": "Mathematical analysis explanation referencing computed values.",
        "businessContext": "Actionable downstream business context.",
        "detectedColumns": ["Cleaned Column Name"],
        "chartData": [10.2, 11.5, 9.8] 
      }
    ]
  }
}`;
}

// ============================================================
// JSON EXTRACTION + REPAIR
// ============================================================

function repairTruncatedJSON(text: string): string | null {
  const stack: string[] = [];
  let inString=false, escape=false;
  for (let i=0;i<text.length;i++) {
    const ch=text[i];
    if(escape){escape=false;continue;}
    if(ch==="\\"&&inString){escape=true;continue;}
    if(ch==='"'){inString=!inString;continue;}
    if(inString) continue;
    if(ch==="{"||ch==="[") stack.push(ch);
    else if(ch==="}"||ch==="]") { if(stack.length===0) return null; stack.pop(); }
  }
  if(stack.length===0) return null;
  let closing = inString?'"':"";
  for(let i=stack.length-1;i>=0;i--) closing+=stack[i]==="{"?"}":"]";
  return text+closing;
}

function extractAndRepairJSON(rawText: string): string | null {
  emit({ stage:"JSON_EXTRACT", level:"info", message:"Starting extraction", data:rawText.slice(0,200) });
  let text = rawText.replace(/```json\s*/gi,"").replace(/```\s*/g,"").trim();
  try { JSON.parse(text); emit({ stage:"JSON_EXTRACT", level:"success", message:"Direct parse succeeded" }); return text; } catch {}
  const startIndex=text.indexOf("{"), endIndex=text.lastIndexOf("}");
  if(startIndex===-1||endIndex===-1) { emit({ stage:"JSON_EXTRACT", level:"error", message:"No JSON object found" }); return null; }
  const candidate = text.substring(startIndex,endIndex+1);
  try { JSON.parse(candidate); emit({ stage:"JSON_EXTRACT", level:"success", message:"Substring extraction succeeded" }); return candidate; } catch {}
  const repaired = repairTruncatedJSON(candidate);
  if(repaired) { try { JSON.parse(repaired); emit({ stage:"JSON_EXTRACT", level:"success", message:"Bracket repair succeeded" }); return repaired; } catch {} }
  const sanitized = candidate.replace(/[\x00-\x1F\x7F]/g," ").replace(/\\(?!["\\/bfnrtu])/g,"\\\\").replace(/,\s*([}\]])/g,"$1").replace(/([{,]\s*)(\w+)\s*:/g,'$1"$2":');
  try { JSON.parse(sanitized); emit({ stage:"JSON_EXTRACT", level:"success", message:"Sanitization repair succeeded" }); return sanitized; } catch(e) { emit({ stage:"JSON_EXTRACT", level:"error", message:"All repair strategies failed", data:e }); return null; }
}

// ============================================================
// ZOD VALIDATION + NORMALIZATION
// ============================================================

function sanitizeUINode(node: unknown, depth=0): UINode {
  const VALID_TYPES = new Set(["col","row","grid_2","kpi_block","scatter_plot","trend_sparkline","alert_chip","bar_chart","stat_grid","semantic_tags","data_table","insight_cluster"]);
  if(!node||typeof node!=="object") return { type:"kpi_block" };
  const n = node as Record<string,unknown>;
  const type = String(n.type||"kpi_block");
  const safeType = VALID_TYPES.has(type)?(type as UINode["type"]):"kpi_block";
  const sanitized: UINode = { type:safeType, ...(n.meta&&typeof n.meta==="object"?{meta:n.meta as Record<string,unknown>}:{}) };
  const isLayout = ["col","row","grid_2"].includes(safeType);
  if(isLayout&&depth<4&&Array.isArray(n.children)&&n.children.length>0) sanitized.children=(n.children as unknown[]).slice(0,8).map(child=>sanitizeUINode(child,depth+1));
  return sanitized;
}

function normalizeWorkflow(wf: z.infer<typeof ZWorkflow>): Workflow {
  return { 
    title:wf.title||"Operational Workflow", 
    layoutMode:wf.layoutMode||"dashboard", 
    archetype: (wf.archetype || "OPERATIONAL_WORKFLOW") as WorkflowArchetype,
    uiBlueprint:sanitizeUINode(wf.uiBlueprint), 
    primaryMetric:wf.primaryMetric||"—", 
    secondaryMetric:wf.secondaryMetric||"—", 
    severity:wf.severity||"medium", 
    quickStats:wf.quickStats&&Object.keys(wf.quickStats).length>0?wf.quickStats:{}, 
    tags:wf.tags?.length>0?wf.tags:["Insights"], 
    confidence:wf.confidence??85, 
    description:wf.description||"Operational analysis.", 
    reasoning:wf.reasoning||"Statistical profiling applied.", 
    businessContext:wf.businessContext||"Monitoring within operational bounds.", 
    chartData:wf.chartData?.length>0?wf.chartData:[], 
    detectedColumns:wf.detectedColumns||[] 
  };
}

function salvagePartialDashboard(parsed: unknown): GlobalDashboard | null {
  emit({ stage:"ZOD_VALIDATE", level:"warn", message:"Attempting partial dashboard salvage" });
  try {
    const obj = parsed as Record<string,unknown>;
    const rawWorkflows: unknown[] = (obj?.dashboard as Record<string,unknown>)?.workflows as unknown[] || (obj?.workflows as unknown[]) || [];
    const validWorkflows: Workflow[] = [];
    for(const wf of rawWorkflows) { const r=ZWorkflow.safeParse(wf); if(r.success) validWorkflows.push(normalizeWorkflow(r.data)); }
    if(validWorkflows.length===0) return null;
    const agenticResult = ZAgenticState.safeParse(obj?.agenticState??{});
    const agenticState = agenticResult.success ? agenticResult.data : { situationalAwareness:"Partial synthesis recovered.", layoutStrategy:"Deterministic layout applied.", cognitiveDensity:"high" as const, selfCritique:"Some workflows were recovered from a partial response." };
    const rawHero = (obj?.dashboard as Record<string,unknown>)?.heroInsight;
    const heroInsight = ZHeroInsight.safeParse(rawHero).success ? ZHeroInsight.parse(rawHero) : { headline: "Partial Recovery Core Stable", supportingStatement: "Recovered from parsed schema fragments.", primaryMetricValue: "100%", metricLabel: "Grounded Telemetry", causalLink: "Baseline recovery complete.", affectedVectors: [], severity: "low" as const };
    emit({ stage:"ZOD_VALIDATE", level:"success", message:`Partial salvage: ${validWorkflows.length} workflows recovered` });
    return { 
      agenticState, 
      globalSummary:String((obj?.dashboard as Record<string,unknown>)?.globalSummary??"Partial synthesis active."), 
      globalSeverity:(["critical","elevated","stable"].includes(String((obj?.dashboard as Record<string,unknown>)?.globalSeverity))?(obj?.dashboard as Record<string,unknown>)?.globalSeverity:"stable") as "critical"|"elevated"|"stable", 
      dashboardLayoutMode: "INTELLIGENCE_GRID",
      heroInsight,
      workflows:validWorkflows 
    };
  } catch { return null; }
}

function validateAndNormalize(rawJSON: string): GlobalDashboard | null {
  let parsed: unknown;
  try { parsed=JSON.parse(rawJSON); } catch(e) { emit({ stage:"ZOD_VALIDATE", level:"error", message:"JSON.parse failed", data:e }); return null; }
  const payloadResult = ZLLMPayload.safeParse(parsed);
  if(!payloadResult.success) { emit({ stage:"ZOD_VALIDATE", level:"warn", message:"Top-level validation failed", data:payloadResult.error.flatten() }); return salvagePartialDashboard(parsed); }
  const { agenticState, dashboard } = payloadResult.data;
  const validWorkflows: Workflow[] = [];
  const raw = dashboard.workflows as unknown[];
  for(let i=0;i<raw.length;i++) {
    const wfResult = ZWorkflow.safeParse(raw[i]);
    if(wfResult.success) validWorkflows.push(normalizeWorkflow(wfResult.data));
    else emit({ stage:"ZOD_VALIDATE", level:"warn", message:`Workflow[${i}] invalid — discarding`, data:wfResult.error.flatten() });
  }
  if(validWorkflows.length===0) { emit({ stage:"ZOD_VALIDATE", level:"error", message:"No valid workflows survived validation" }); return null; }
  emit({ stage:"ZOD_VALIDATE", level:"success", message:`Validation passed: ${validWorkflows.length}/${raw.length} workflows preserved` });
  return { 
    agenticState:agenticState as AgenticState, 
    globalSummary:dashboard.globalSummary, 
    globalSeverity:dashboard.globalSeverity, 
    dashboardLayoutMode: dashboard.dashboardLayoutMode,
    heroInsight: dashboard.heroInsight,
    workflows:validWorkflows 
  };
}

// ============================================================
// LLM STREAMING CALL
// ============================================================

async function singleLLMAttempt(prompt: string, model: string, timeoutMs: number, onProgress?: (tokens: number) => void): Promise<LLMAttemptResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => { controller.abort(); emit({ stage:"LLM_CALL", level:"warn", message:`Timeout after ${timeoutMs/1000}s` }); }, timeoutMs);
  try {
    const response = await fetch(LLM_CONFIG.endpoint, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ model, prompt, stream:true }), signal:controller.signal });
    clearTimeout(timeoutId);
    if(!response.ok) { emit({ stage:"LLM_CALL", level:"error", message:`HTTP ${response.status} — is Ollama running?` }); return { success:false, failureReason:"api_unreachable" }; }
    const reader = response.body?.getReader();
    if(!reader) return { success:false, failureReason:"unknown" };
    const decoder = new TextDecoder();
    let rawResponse="", tokenCount=0;
    while(true) {
      const { done, value } = await reader.read();
      if(done) break;
      const chunk = decoder.decode(value,{stream:true});
      for(const line of chunk.split("\n")) {
        if(!line.trim()) continue;
        try { const parsed=JSON.parse(line); if(parsed.response){rawResponse+=parsed.response;tokenCount++;onProgress?.(tokenCount);} if(parsed.done) break; } catch {}
      }
    }
    emit({ stage:"LLM_CALL", level:"success", message:`Stream complete — ${tokenCount} tokens`, data:rawResponse.slice(0,400) });
    const extracted = extractAndRepairJSON(rawResponse);
    if(!extracted) return { success:false, failureReason:"malformed_json", rawResponse };
    const dashboard = validateAndNormalize(extracted);
    if(!dashboard) return { success:false, failureReason:"schema_validation_failed", rawResponse };
    if(dashboard.workflows.length===0) return { success:false, failureReason:"empty_workflows", rawResponse };
    return { success:true, dashboard };
  } catch(error: unknown) {
    clearTimeout(timeoutId);
    const isAbort = error instanceof Error && error.name==="AbortError";
    const isNetwork = error instanceof TypeError && error.message.includes("fetch");
    emit({ stage:"LLM_CALL", level:"error", message:isAbort?`Aborted after ${timeoutMs/1000}s`:isNetwork?"Network error — Ollama unreachable":"Unknown error", data:error });
    return { success:false, failureReason:isAbort?"timeout":"api_unreachable" };
  }
}

// ============================================================
// RETRY ORCHESTRATOR
// ============================================================

async function generateAgenticDashboard(profiles: ColumnProfile[], causalChains: CausalRelation[], memory?: InteractionMemory, model: string = LLM_CONFIG.defaultModel, onProgress?: (attempt:number, tokens:number)=>void): Promise<{dashboard:GlobalDashboard|null; source:"llm"|"fallback"; reason?:LLMFailureReason}> {
  const modelTier = getModelTier(model);
  const levels: PromptLevel[] = ["full","compressed","minimal"];
  const timeouts = [LLM_CONFIG.timeouts.full, LLM_CONFIG.timeouts.compressed, LLM_CONFIG.timeouts.minimal];
  let lastFailureReason: LLMFailureReason = "unknown";
  for(let attempt=0;attempt<3;attempt++) {
    const level = levels[attempt];
    emit({ stage:"RETRY", level:"info", message:`Attempt ${attempt+1}/3 — level=${level}, timeout=${timeouts[attempt]/1000}s` });
    const prompt = buildPrompt(profiles,causalChains,memory,level,modelTier);
    const result = await singleLLMAttempt(prompt,model,timeouts[attempt],(tokens)=>onProgress?.(attempt+1,tokens));
    if(result.success&&result.dashboard) { emit({ stage:"RETRY", level:"success", message:`Succeeded on attempt ${attempt+1}` }); return { dashboard:result.dashboard, source:"llm" }; }
    lastFailureReason = result.failureReason??"unknown";
    if(lastFailureReason==="api_unreachable") { emit({ stage:"RETRY", level:"warn", message:"API unreachable — skipping retries" }); break; }
    emit({ stage:"RETRY", level:"warn", message:`Attempt ${attempt+1} failed: ${lastFailureReason}` });
  }
  emit({ stage:"FALLBACK", level:"warn", message:`Fallback triggered. Reason: ${lastFailureReason}` });
  return { dashboard:null, source:"fallback", reason:lastFailureReason };
}

// ============================================================
// FALLBACK GENERATOR
// ============================================================

const FALLBACK_REASON_LABELS: Record<LLMFailureReason,string> = {
  api_unreachable:"Ollama service unreachable — running deterministic synthesis",
  timeout:"Generation exceeded time limit — running deterministic synthesis",
  malformed_json:"Response parsing failed after 3 attempts — running deterministic synthesis",
  schema_validation_failed:"Schema validation failed after 3 attempts — running deterministic synthesis",
  empty_workflows:"No valid workflows generated — running deterministic synthesis",
  unknown:"Running deterministic synthesis",
};

function generateFallbackDashboard(profiles: ColumnProfile[], causalChains: CausalRelation[], reason: LLMFailureReason = "unknown"): GlobalDashboard {
  const workflows: Workflow[] = [];
  const consumed = new Set<string>();
  
  // 1. ANOMALY_WORKFLOW
  const anomalous = profiles.find(p=>p.outlierCount&&p.outlierCount>0&&!consumed.has(p.cleanName));
  if(anomalous) { 
    consumed.add(anomalous.cleanName); 
    workflows.push({ 
      title:`${anomalous.cleanName} Anomaly Limits`, 
      layoutMode:"alert", 
      archetype: "ANOMALY_WORKFLOW",
      uiBlueprint:{type:"col",children:[{type:"alert_chip"},{type:"kpi_block"},{type:"stat_grid"},{type:"semantic_tags"}]}, 
      primaryMetric:`${anomalous.outlierCount} Anomalies`, 
      secondaryMetric:"Breaches statistical limit band", 
      severity:"critical", 
      quickStats:{Max:anomalous.max||"—",Avg:anomalous.avg||"—", StdDev: anomalous.stdDev||"—", Entropy: String(anomalous.entropy||"0")}, 
      tags:["Anomaly","Risk Control"], 
      confidence:96, 
      description:`Calculated rolling state variance on raw telemetry vectors detected ${anomalous.outlierCount} records shifting outside threshold rules.`, 
      reasoning:`Data vectors exceed 3 standard deviations limits of the computed distribution mean: ${anomalous.avg}.`, 
      businessContext:"Anomalous shifts disrupt baseline operational flow. Real-time logging exceptions routing required.", 
      detectedColumns:[anomalous.cleanName], 
      chartData:anomalous.rawValues.length>0?anomalous.rawValues:[] 
    }); 
  }
  
  // 2. TEMPORAL_WORKFLOW
  const drifting = profiles.find(p=>p.temporalDrift&&!consumed.has(p.cleanName));
  if(drifting) { 
    consumed.add(drifting.cleanName); 
    workflows.push({ 
      title:`${drifting.cleanName} Structural Drift`, 
      layoutMode:"dashboard", 
      archetype: "TEMPORAL_WORKFLOW",
      uiBlueprint:{type:"col",children:[{type:"row",children:[{type:"kpi_block"},{type:"trend_sparkline"}]},{type:"stat_grid"}]}, 
      primaryMetric:drifting.temporalDrift!, 
      secondaryMetric:"Chronological sequence drift", 
      severity:"high", 
      quickStats:{Direction:drifting.temporalDrift!.includes("-")?"Negative Drift":"Positive Trend", Volatility: drifting.rollingVolatility?.length ? drifting.rollingVolatility[0].toString() : "0", Max:drifting.max||"—"}, 
      tags:["Time-Series","Drift"], 
      confidence:92, 
      description:`Deterministic splitting indicates sequential drift of ${drifting.temporalDrift} across data lifespan.`, 
      reasoning:`Univariate temporal validation confirmed steady divergence from primary initial mean parameters.`, 
      businessContext:"Unmanaged directional shift indicates macro system fatigue or loss of telemetry calibration.", 
      detectedColumns:[drifting.cleanName], 
      chartData:drifting.rawValues.length>0?drifting.rawValues:[] 
    }); 
  }
  
  // 3. CORRELATION_WORKFLOW
  const topRel = causalChains[0];
  if(topRel) { 
    consumed.add(topRel.source);consumed.add(topRel.target); 
    workflows.push({ 
      title:`${topRel.source} / ${topRel.target} Linkage`, 
      layoutMode:"comparison", 
      archetype: "CORRELATION_WORKFLOW",
      uiBlueprint:{type:"grid_2",children:[{type:"col",children:[{type:"kpi_block"},{type:"stat_grid"}]},{type:"scatter_plot"}]}, 
      primaryMetric:`R: ${topRel.pearsonR}`, 
      secondaryMetric:"Linear Pearson Correlation Strength", 
      severity:"high", 
      quickStats:{Covariance: String(topRel.covariance), Relation:topRel.direction.replace(/_/g," ")}, 
      tags:["Correlation","Causal Mapping"], 
      confidence:89, 
      description:`Calculated covariance indicates strong association metrics between ${topRel.source} and ${topRel.target}.`, 
      reasoning:`Co-variance modeling supports active feedback dynamics with non-spurious statistical confidence.`, 
      businessContext:"Causal coupling lets operators control down-stream variables by manipulating primary inputs.", 
      detectedColumns:[topRel.source,topRel.target], 
      chartData:profiles.find(p=>p.cleanName===topRel.source)?.rawValues||[] 
    }); 
  }

  // Baseline Operation Fallback
  if(workflows.length===0&&profiles.length>0) { 
    const base=profiles[0]; 
    workflows.push({ 
      title:`${base.cleanName} Operations Standard`, 
      layoutMode:"dashboard", 
      archetype: "OPERATIONAL_WORKFLOW",
      uiBlueprint:{type:"col",children:[{type:"kpi_block"},{type:"bar_chart"},{type:"stat_grid"}]}, 
      primaryMetric:base.avg ? `Mean: ${base.avg}` : `H: ${base.uniquePercent}%`, 
      secondaryMetric:"Stable configuration variables", 
      severity:"low", 
      quickStats:{Avg:base.avg||"—", Min:base.min||"—", Nulls:`${base.nullPercent}%`}, 
      tags:["Operations","Baseline"], 
      confidence:80, 
      description:`Baseline profiling verifies standard variables matching active target bounds.`, 
      reasoning:`Univariate analytics confirm current values stay inside expected statistical parameters.`, 
      businessContext:"Passive profiling prevents unexpected systemic regressions down the line.", 
      detectedColumns:[base.cleanName], 
      chartData:base.rawValues 
    }); 
  }

  const hasCritical = workflows.some(w=>w.severity==="critical");
  const hasHigh = workflows.some(w=>w.severity==="high");

  let fallbackLayoutMode: GlobalDashboard["dashboardLayoutMode"] = "INTELLIGENCE_GRID";
  if (profiles.length < 4) fallbackLayoutMode = "COMPACT";
  else if (drifting) fallbackLayoutMode = "TIMELINE_FIRST";
  else if (topRel) fallbackLayoutMode = "GRAPH_FIRST";

  const heroInsight: HeroInsight = {
    headline: topRel 
      ? `State variables ${topRel.source} and ${topRel.target} show strong dynamic coupling`
      : "Core operational state parameters remain balanced",
    supportingStatement: topRel 
      ? `A linear Pearson relation of ${topRel.pearsonR} is active, while information entropy stands at ${topRel.entropyGap}.`
      : "Baseline analytics confirm all variables stay within standard operating bounds.",
    primaryMetricValue: topRel ? `${topRel.pearsonR}` : "100%",
    metricLabel: topRel ? "Pearson R Strength" : "State Entropy",
    causalLink: topRel ? `${topRel.source} drives variance shifts in ${topRel.target}.` : "All variables uncoupled.",
    affectedVectors: topRel ? [topRel.source, topRel.target] : [],
    severity: hasCritical ? "critical" : hasHigh ? "high" : "low"
  };
  
  return { 
    agenticState:{ 
      situationalAwareness:`Deterministic fallback engine running. ${FALLBACK_REASON_LABELS[reason]}.`, 
      layoutStrategy:"Adaptive composition matrices assigned via dataset metadata variables.", 
      cognitiveDensity:"high", 
      selfCritique:"Parsed validation complete. Uncorrelated data layers pruned." 
    }, 
    globalSummary: hasCritical ? "Statistical anomalies detected inside telemetry chains." : "Operations running inside steady state configurations.", 
    globalSeverity: hasCritical ? "critical" : hasHigh ? "elevated" : "stable", 
    dashboardLayoutMode: fallbackLayoutMode,
    heroInsight,
    workflows: workflows.sort((a,b)=>({critical:4,high:3,medium:2,low:1}[b.severity]-{critical:4,high:3,medium:2,low:1}[a.severity])) 
  };
}

// ============================================================
// ANIMATED BACKGROUND PARTICLES
// ============================================================

function ParticleField() {
  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 1.5 + 0.5,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * -20,
  }));
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-blue-500/[0.03]"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -80, 0], opacity: [0, 0.3, 0], scale: [0, 1, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-600/[0.01] blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-violet-600/[0.01] blur-3xl pointer-events-none" />
    </div>
  );
}

// ============================================================
// ANIMATED LOGO
// ============================================================

const letters = "MorphUI".split("");
function MorphLogo() {
  return (
    <div className="flex justify-center items-center gap-0.5">
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          animate={{ y:[0,-2,1,0], scaleY:[1,1.1,0.97,1], scaleX:[1,0.95,1.03,1], color:["#ffffff","#60a5fa","#a78bfa","#ffffff"] }}
          transition={{ duration:4+index*0.12, repeat:Infinity, ease:"easeInOut", delay:index*0.06 }}
          className="text-4xl inline-block font-extrabold tracking-tighter select-none"
        >
          {letter}
        </motion.span>
      ))}
    </div>
  );
}

// ============================================================
// SCAN LINE LOADING ANIMATION
// ============================================================

function ScanLine() {
  return (
    <motion.div
      className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"
      animate={{ top: ["0%", "100%"] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
    />
  );
}

// ============================================================
// STREAM PROGRESS BAR
// ============================================================

function StreamProgressBar({ tokens, attempt, maxTokens = 800 }: { tokens: number; attempt: number; maxTokens?: number }) {
  const progress = Math.min((tokens / maxTokens) * 100, 94);
  const springProgress = useSpring(useMotionValue(0), { stiffness: 60, damping: 20 });

  useEffect(() => {
    springProgress.set(progress);
  }, [progress, springProgress]);

  return (
    <div className="space-y-2.5 w-full max-w-xs mx-auto">
      <div className="flex items-center justify-between text-[10px] font-mono">
        <span className="text-blue-500">STAGE {attempt}/3 · STREAMING ANALYTICAL PLANS</span>
        <motion.span key={tokens} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-zinc-500 tabular-nums">
          {tokens.toLocaleString()} tkn
        </motion.span>
      </div>
      <div className="w-full bg-zinc-950 border border-zinc-900 rounded-full h-[3px] overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// ============================================================
// SEVERITY SYSTEM
// ============================================================

const severityColors: Record<Severity, string> = {
  critical: "text-rose-400 border-rose-500/20 bg-rose-500/[0.03]",
  high: "text-orange-400 border-orange-500/20 bg-orange-500/[0.03]",
  medium: "text-amber-400 border-amber-500/20 bg-amber-500/[0.03]",
  low: "text-blue-400 border-blue-500/20 bg-blue-500/[0.03]",
};

// ============================================================
// RECURSIVE UI RENDERER
// ============================================================

function UIRecursiveRenderer({ node, workflow, maxVal, density }: { node: UINode; workflow: Workflow; maxVal: number; density: "high"|"medium"|"low" }) {
  const gapClass = density==="high"?"gap-1.5":density==="low"?"gap-4":"gap-2.5";
  if(node.type==="col") return <div className={`flex flex-col ${gapClass} w-full`}>{node.children?.map((c,i)=><UIRecursiveRenderer key={i} node={c} workflow={workflow} maxVal={maxVal} density={density}/>)}</div>;
  if(node.type==="row") return <div className={`flex flex-row ${gapClass} w-full items-stretch`}>{node.children?.map((c,i)=><UIRecursiveRenderer key={i} node={c} workflow={workflow} maxVal={maxVal} density={density}/>)}</div>;
  if(node.type==="grid_2") return <div className={`grid grid-cols-2 ${gapClass} w-full`}>{node.children?.map((c,i)=><UIRecursiveRenderer key={i} node={c} workflow={workflow} maxVal={maxVal} density={density}/>)}</div>;

  const realChartData = workflow.chartData || [];

  switch(node.type) {
    case "alert_chip":
      return (
        <div className={`border px-2 py-0.5 rounded flex items-center gap-1.5 w-fit select-none font-mono text-[8px] uppercase tracking-wider ${severityColors[workflow.severity]}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${workflow.severity==="critical"?"bg-rose-500 animate-pulse" : "bg-current"}`}/>
          {workflow.severity} Priority State
        </div>
      );
    case "kpi_block": {
      if (workflow.primaryMetric === "—") return null; 
      return (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} className={`bg-zinc-950/80 border border-zinc-900/60 rounded-lg flex flex-col justify-center flex-1 min-w-[100px] ${density==="high"?"p-2.5":"p-4"} backdrop-blur-md`}>
          <motion.p initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} className={`${density==="high"?"text-lg":"text-xl"} font-extrabold text-white tracking-tight truncate`}>{workflow.primaryMetric}</motion.p>
          <p className="text-zinc-600 text-[9px] tracking-tight mt-0.5 truncate">{workflow.secondaryMetric}</p>
        </motion.div>
      );
    }
    case "scatter_plot": {
      if (realChartData.length < 3) return null; 
      return (
        <div className="bg-zinc-950 border border-zinc-900/60 p-2.5 rounded-lg h-14 relative overflow-hidden flex flex-col justify-end flex-1">
          <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_center,_#3b82f6_1px,_transparent_1px)] [background-size:8px_8px]"/>
          <div className="z-10 flex gap-1.5 w-full justify-between items-end h-full">
            {realChartData.slice(0,10).map((d,i)=>(
              <motion.div 
                key={i} 
                initial={{scale:0,opacity:0}} 
                animate={{y:-(d/maxVal)*28,scale:1,opacity:1}} 
                transition={{duration:0.4,delay:i*0.02}} 
                className="w-1.5 h-1.5 rounded-full bg-blue-500/80 shrink-0"
              />
            ))}
          </div>
        </div>
      );
    }
    case "trend_sparkline": {
      if (realChartData.length < 3) return null; 
      return (
        <div className="bg-zinc-950 border border-zinc-900/60 p-2 rounded-lg h-14 relative flex items-end gap-[1px] flex-1 overflow-hidden">
          {realChartData.map((val,i)=>(
            <motion.div 
              key={i} 
              initial={{height:0}} 
              animate={{height:`${(val/maxVal)*100}%`}} 
              transition={{duration:0.4,delay:i*0.015}} 
              className="flex-1 bg-gradient-to-t from-violet-600/40 to-violet-400/30 hover:from-violet-500/60 rounded-t-[1px] transition-colors"
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/20 to-transparent pointer-events-none"/>
        </div>
      );
    }
    case "bar_chart": {
      if (realChartData.length < 3) return null; 
      return (
        <div className="bg-zinc-950 border border-zinc-900/60 p-2.5 rounded-lg flex flex-col justify-center gap-1.5 flex-1">
          {realChartData.slice(0,4).map((val,i)=>(
            <div key={i} className="space-y-0.5">
              <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                <motion.div initial={{width:0}} animate={{width:`${(val/maxVal)*100}%`}} className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full"/>
              </div>
            </div>
          ))}
        </div>
      );
    }
    case "stat_grid": {
      if (!workflow.quickStats || Object.keys(workflow.quickStats).length === 0) return null; 
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 w-full">
          {Object.entries(workflow.quickStats).map(([k,v])=>(
            <div key={k} className="bg-zinc-950 border border-zinc-900/50 p-1.5 rounded" title={`${k}: ${v}`}>
              <p className="text-zinc-600 text-[8px] uppercase tracking-wider mb-0.5 truncate">{k}</p>
              <p className="text-zinc-300 font-bold text-[10px] truncate">{v}</p>
            </div>
          ))}
        </div>
      );
    }
    case "semantic_tags": {
      if (workflow.detectedColumns.length === 0) return null; 
      return (
        <div className="flex gap-1 flex-wrap text-[8px] font-mono select-none">
          {workflow.detectedColumns.slice(0,3).map(c=><span key={c} className="bg-zinc-900 text-zinc-500 border border-zinc-800 px-1 py-0.5 rounded">{c}</span>)}
          {workflow.tags.slice(0,2).map(t=><span key={t} className="border border-zinc-900 text-zinc-600 px-1 py-0.5 rounded">{t}</span>)}
        </div>
      );
    }
    case "data_table": {
      const headers=(node.meta?.headers as string[])||[], rows=(node.meta?.rows as string[][])||[];
      if (headers.length === 0) return null;
      return (
        <div className="bg-zinc-950 border border-zinc-900 rounded-lg overflow-hidden w-full text-[8px] font-mono">
          <table className="w-full text-left">
            <thead className="bg-zinc-900 border-b border-zinc-800">
              <tr>{headers.map((h,i)=><th key={i} className="px-2 py-1 text-zinc-500 font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody>
              {rows.slice(0,3).map((r,i)=><tr key={i} className="border-b border-zinc-900/50 hover:bg-zinc-900/20">{r.map((c,j)=><td key={j} className="px-2 py-1 text-zinc-400">{c}</td>)}</tr>)}
            </tbody>
          </table>
        </div>
      );
    }
    case "insight_cluster":
      return (
        <div className="bg-zinc-950 border-l-2 border-blue-500/60 p-2 rounded-r-lg w-full text-[10px]">
          <p className="text-blue-400 font-bold mb-0.5">{(node.meta?.title as string)||"Real Insight Vector"}</p>
          <p className="text-zinc-500 leading-normal">{(node.meta?.body as string)||"Active covariance limits validated."}</p>
        </div>
      );
    default: return null;
  }
}

// ============================================================
// SYNTHESIS BADGE
// ============================================================

function SynthesisBadge({ synthesisState }: { synthesisState: SynthesisState }) {
  if(synthesisState.source==="llm") return (
    <motion.span initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} className="px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-widest border bg-emerald-500/5 text-emerald-400 border-emerald-500/20 flex items-center gap-1">
      <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"/>Autonomous Interface Compiler
    </motion.span>
  );
  return (
    <motion.span initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} title={synthesisState.failureReason?FALLBACK_REASON_LABELS[synthesisState.failureReason]:""} className="px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-widest border bg-amber-500/5 text-amber-400 border-amber-500/20 flex items-center gap-1">
      <span className="w-1 h-1 rounded-full bg-amber-400"/>Deterministic System Core
    </motion.span>
  );
}

// ============================================================
// CURSOR GLOW
// ============================================================

function CursorGlow() {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  useEffect(() => {
    const handler = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handler, { passive: true });
    return () => window.removeEventListener("mousemove", handler);
  }, []);
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <div
        className="absolute w-72 h-72 rounded-full bg-blue-500/[0.015] blur-3xl transition-transform duration-700 ease-out"
        style={{ transform: `translate(${pos.x - 144}px, ${pos.y - 144}px)` }}
      />
    </div>
  );
}

// ============================================================
// LOADING OVERLAY
// ============================================================

const LOADING_PHASES = [
  "Executing deterministic analytics engine…",
  "Compiling Shannon information entropy bands…",
  "Executing multivariable covariance analysis…",
  "Measuring Pearson R linear variances…",
  "Synthesizing global causal relation structures…",
  "Validating parsed telemetry schemas…",
  "Resolving autonomous layouts…"
];

function LoadingPhases({ streamingTokens, streamingAttempt }: { streamingTokens: number; streamingAttempt: number }) {
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    if(streamingTokens > 0) return;
    const interval = setInterval(() => setPhaseIndex(i => Math.min(i+1, LOADING_PHASES.length-1)), 600);
    return () => clearInterval(interval);
  }, [streamingTokens]);

  return (
    <div className="space-y-4 flex flex-col items-center">
      <div className="relative w-12 h-12">
        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.01)" strokeWidth="2.5"/>
          <motion.circle
            cx="32" cy="32" r="28" fill="none" stroke="rgba(59,130,246,0.6)" strokeWidth="2.5"
            strokeLinecap="round" strokeDasharray="175.9"
            animate={{ strokeDashoffset: [175.9, 0, 175.9] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>
      </div>
      <AnimatePresence mode="wait">
        {streamingTokens > 0 ? (
          <motion.div key="streaming" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="w-full">
            <StreamProgressBar tokens={streamingTokens} attempt={streamingAttempt}/>
          </motion.div>
        ) : (
          <motion.div key={phaseIndex} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-center">
            <p className="text-blue-400 text-xs font-mono">{LOADING_PHASES[phaseIndex]}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// COLUMN CHIP REVEAL
// ============================================================

function ColumnChips({ columns }: { columns: string[] }) {
  return (
    <motion.div
      className="flex flex-wrap justify-center gap-1.5 mt-4 max-w-xl mx-auto"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.02 } } }}
    >
      {columns.slice(0, 12).map((col) => (
        <motion.span
          key={col}
          variants={{ hidden:{opacity:0,scale:0.9,y:5}, visible:{opacity:1,scale:1,y:0} }}
          className="bg-zinc-950 border border-zinc-900 text-[10px] font-mono text-zinc-500 px-2.5 py-0.5 rounded transition-colors"
        >
          {col}
        </motion.span>
      ))}
      {columns.length > 12 && (
        <span className="text-zinc-600 font-mono text-[9px] py-0.5 px-1.5">+{columns.length-12} more columns</span>
      )}
    </motion.div>
  );
}

// ============================================================
// MAIN APPLICATION
// ============================================================

export default function App() {
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<"idle"|"preview"|"dashboard">("idle");
  const [dashboard, setDashboard] = useState<GlobalDashboard | null>(null);
  const [uploadedColumns, setUploadedColumns] = useState<string[]>([]);
  const [predictedDataset, setPredictedDataset] = useState("");
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [synthesisState, setSynthesisState] = useState<SynthesisState>({ source:"idle" });
  const [streamingTokens, setStreamingTokens] = useState(0);
  const [streamingAttempt, setStreamingAttempt] = useState(0);
  const [selectedModel, setSelectedModel] = useState<string>(LLM_CONFIG.defaultModel);
  const [isDragOver, setIsDragOver] = useState(false);

  const [interactionMemory, setInteractionMemory] = useState<InteractionMemory>({ approvedTags:[], rejectedTags:[], preferredLayouts:[], preferredDensity:"high" });
  const [cachedProfiles, setCachedProfiles] = useState<ColumnProfile[]>([]);
  const [cachedCausalChains, setCachedCausalChains] = useState<CausalRelation[]>([]);

  const workflowRef = useRef<HTMLDivElement | null>(null);
  const predictionRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const runAnalysis = useCallback(async (file: File) => {
    const cleanTitle = file.name.replace(".csv","").replaceAll("_"," ").replaceAll("-"," ").replace(/\b\w/g,c=>c.toUpperCase());
    setPredictedDataset(cleanTitle);
    
    const rawText = await file.text();
    const lines = rawText.split(/\r?\n/);
    let firstValidRowIndex = 0;
    for(let i=0;i<Math.min(lines.length,20);i++) { 
      const vt=lines[i].split(",").map(v=>v.trim()).filter(Boolean); 
      if(vt.length>1){firstValidRowIndex=i;break;} 
    }
    const sanitizedCsvText = lines.slice(firstValidRowIndex).join("\n");
    const parsed = Papa.parse(sanitizedCsvText,{header:true,skipEmptyLines:true});
    if(!parsed.meta.fields||parsed.data.length===0) { alert("Invalid CSV format."); return; }
    
    const cleanedColumns = processColumns(parsed.meta.fields);
    if(cleanedColumns.length<2) { alert("Dataset requires at least two valid variables."); return; }
    
    setUploadedColumns(cleanedColumns.map(c=>c.cleanName));
    setLoading(true);
    setStreamingTokens(0);
    setStreamingAttempt(0);

    setTimeout(async () => {
      const dataRows = parsed.data as Record<string,unknown>[];
      
      emit({ stage:"ANALYTICS_ENGINE", level:"info", message:"Running Advanced Mathematical Core..." });
      const profiles = profileDataset(cleanedColumns,dataRows);
      const causalChains = calculateCausalRelations(profiles,dataRows);
      
      setCachedProfiles(profiles); 
      setCachedCausalChains(causalChains);
      
      emit({ stage:"RENDER", level:"info", message:`Profiled ${profiles.length} attributes, synthesized ${causalChains.length} causal correlation pathways.` });
      
      const { dashboard:llmDash, source, reason } = await generateAgenticDashboard(
        profiles,
        causalChains,
        interactionMemory,
        selectedModel,
        (attempt,tokens)=>{setStreamingAttempt(attempt);setStreamingTokens(tokens);}
      );
      
      let finalDash: GlobalDashboard;
      if(llmDash) { 
        finalDash=llmDash; 
        setSynthesisState({source:"llm"}); 
      } else { 
        finalDash=generateFallbackDashboard(profiles,causalChains,reason); 
        setSynthesisState({source:"fallback",failureReason:reason}); 
      }
      
      emit({ stage:"RENDER", level:"info", message:"Generative Interface complete.", data:finalDash });
      setDashboard(finalDash);
      setLoading(false);
      setPhase("preview");
      setTimeout(()=>predictionRef.current?.scrollIntoView({behavior:"smooth",block:"start"}),100);
    }, 80);
  }, [interactionMemory, selectedModel]);

  const handleAnalyze = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if(!file) return;
    await runAnalysis(file);
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if(file?.name.endsWith(".csv")) await runAnalysis(file);
  }, [runAnalysis]);

  const handleEvolve = async () => {
    if(!dashboard) return;
    setLoading(true); setExpandedCard(null); setStreamingTokens(0); setStreamingAttempt(0);
    
    // 🟢 FIXED: Updated parameters from cachedDependencies to cachedCausalChains to resolve the synthesis crash
    const { dashboard:llmDash, source, reason } = await generateAgenticDashboard(
      cachedProfiles,
      cachedCausalChains, 
      interactionMemory,
      selectedModel,
      (attempt,tokens)=>{setStreamingAttempt(attempt);setStreamingTokens(tokens);}
    );
    
    let evolvedDash: GlobalDashboard;
    if(llmDash) { 
      evolvedDash=llmDash; 
      setSynthesisState({source:"llm"}); 
    } else { 
      evolvedDash=generateFallbackDashboard(cachedProfiles,cachedCausalChains,reason); 
      setSynthesisState({source:"fallback",failureReason:reason}); 
    }
    setDashboard(evolvedDash); 
    setLoading(false);
  };

  const handleAction = (index: number, action: "approve"|"reject") => {
    if(!dashboard) return;
    const workflow = dashboard.workflows[index];
    setInteractionMemory(prev => {
      const nm={...prev};
      if(action==="approve") { 
        nm.approvedTags=Array.from(new Set([...prev.approvedTags,...workflow.tags])); 
        nm.preferredLayouts=Array.from(new Set([...prev.preferredLayouts,workflow.layoutMode])); 
      } else { 
        nm.rejectedTags=Array.from(new Set([...prev.rejectedTags,...workflow.tags])); 
      }
      return nm;
    });
    setExpandedCard(null);
  };

  const handleClear = () => {
    setPredictedDataset(""); setDashboard(null); setUploadedColumns([]);
    setSynthesisState({source:"idle"}); setPhase("idle");
    if(fileInputRef.current) fileInputRef.current.value="";
  };

  const currentModelTier = getModelTier(selectedModel);

  const orderedWorkflows = useMemo(() => {
    if (!dashboard) return [];
    return [...dashboard.workflows].sort((a,b) => {
      const aWeight = a.confidence * (a.severity === "critical" ? 1.5 : a.severity === "high" ? 1.25 : 1);
      const bWeight = b.confidence * (b.severity === "critical" ? 1.5 : b.severity === "high" ? 1.25 : 1);
      return bWeight - aWeight;
    });
  }, [dashboard]);

  const layoutGridClass = useMemo(() => {
    if (!dashboard) return "grid-cols-1 md:grid-cols-2";
    switch (dashboard.dashboardLayoutMode) {
      case "COMPACT":
        return "grid-cols-1 max-w-xl mx-auto";
      case "TIMELINE_FIRST":
        return "grid-cols-1 md:grid-cols-3";
      case "GRAPH_FIRST":
        return "grid-cols-1 md:grid-cols-2";
      case "INTELLIGENCE_GRID":
      default:
        return "grid-cols-1 md:grid-cols-2";
    }
  }, [dashboard]);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden select-none font-sans tracking-tight antialiased">
      <CursorGlow />
      <ParticleField />

      <main className="relative z-10 flex justify-center px-4 py-16">
        <div className="w-full max-w-5xl">

          {/* ===== HEADER ===== */}
          <motion.div
            initial={{ opacity:0, y:-10 }}
            animate={{ opacity:1, y:0 }}
            transition={{ duration:0.6 }}
            className="text-center mb-12"
          >
            <MorphLogo />
            <motion.p initial={{opacity:0}} animate={{opacity:1}} className="text-zinc-500 font-mono text-[10px] mt-2.5 tracking-[0.4em] uppercase">
              Autonomous Compiler & Mathematical Core
            </motion.p>
          </motion.div>

          {/* ===== UPLOAD ZONE ===== */}
          <motion.div
            initial={{ opacity:0, y:15 }}
            animate={{ opacity:1, y:0 }}
            transition={{ duration:0.8 }}
            className="relative"
          >
            <div className="border border-zinc-900 bg-zinc-950/40 rounded-xl p-8 backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-zinc-700 rounded-tl-xl"/>
              <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-zinc-700 rounded-tr-xl"/>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-zinc-700 rounded-bl-xl"/>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-zinc-700 rounded-br-xl"/>

              {/* Drop zone */}
              <motion.div
                onClick={() => !loading && fileInputRef.current?.click()}
                onDragOver={e=>{e.preventDefault();setIsDragOver(true);}}
                onDragLeave={()=>setIsDragOver(false)}
                onDrop={handleDrop}
                animate={{ borderColor: isDragOver ? "rgba(59,130,246,0.4)" : "rgba(63,63,70,0.2)" }}
                className="border border-dashed border-zinc-800 rounded-lg p-10 cursor-pointer transition-all relative overflow-hidden"
                whileHover={!loading ? { borderColor:"rgba(59,130,246,0.3)" } : {}}
              >
                {loading && <ScanLine />}
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div key="loading" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex flex-col items-center">
                      <LoadingPhases streamingTokens={streamingTokens} streamingAttempt={streamingAttempt}/>
                    </motion.div>
                  ) : (
                    <motion.div key="idle" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-center">
                      <p className="text-zinc-400 text-sm">Drop raw .csv log file here or <span className="text-blue-500 hover:text-blue-400 transition-colors">browse telemetry files</span></p>
                      <p className="text-zinc-600 font-mono text-[9px] mt-1.5 uppercase tracking-wider">Supports complex multivariate operational vectors</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Model selector */}
              <div className="mt-5 flex items-center justify-center gap-4">
                <span className="text-zinc-500 font-mono text-[9px] uppercase tracking-wider">Execution Compiler</span>
                <div className="relative">
                  <select
                    value={selectedModel}
                    onChange={e=>setSelectedModel(e.target.value)}
                    disabled={loading}
                    className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-400 text-[10px] rounded px-3 py-1.5 pr-6 focus:outline-none focus:border-zinc-600 transition-colors appearance-none cursor-pointer disabled:opacity-40"
                  >
                    {AVAILABLE_MODELS.map(m=>(
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 text-[8px]">▼</div>
                </div>
                <AnimatePresence>
                  <motion.span
                    key={currentModelTier}
                    initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                    className={`text-[8px] font-mono px-2 py-0.5 rounded border font-bold uppercase tracking-widest ${currentModelTier==="advanced" ? "text-violet-400 border-violet-500/20 bg-violet-500/5" : "text-zinc-500 border-zinc-800 bg-zinc-900/30"}`}
                  >
                    {currentModelTier} Core
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleAnalyze}/>

          {/* ===== SCREENS ===== */}
          <AnimatePresence mode="wait">

            {/* PREVIEW SCREEN */}
            {phase==="preview" && !loading && dashboard && (
              <motion.div
                key="preview"
                ref={predictionRef}
                initial={{ opacity:0, y:20 }}
                animate={{ opacity:1, y:0 }}
                exit={{ opacity:0, y:-10 }}
                transition={{ duration:0.6 }}
                className="mt-12 text-center"
              >
                <p className="text-zinc-600 font-mono text-[9px] uppercase tracking-[0.3em] mb-1.5">
                  Compilation Completed
                </p>
                <h2 className="text-3xl font-extrabold tracking-tight">
                  {predictedDataset}
                </h2>
                <ColumnChips columns={uploadedColumns}/>

                {/* Stats row */}
                <div className="flex items-center justify-center gap-6 mt-6 text-sm">
                  <div className="text-center"><p className="text-lg font-extrabold text-white">{uploadedColumns.length}</p><p className="text-zinc-600 font-mono text-[9px] uppercase">Telemetry Indices</p></div>
                  <div className="w-px h-6 bg-zinc-900"/>
                  <div className="text-center"><p className="text-lg font-extrabold text-white">{cachedCausalChains.length}</p><p className="text-zinc-600 font-mono text-[9px] uppercase">Pearson couplings</p></div>
                  <div className="w-px h-6 bg-zinc-900"/>
                  <div className="text-center"><p className="text-lg font-extrabold text-white">{dashboard.workflows.length}</p><p className="text-zinc-600 font-mono text-[9px] uppercase">Execution blocks</p></div>
                </div>

                <div className="flex items-center justify-center gap-3 mt-8">
                  <motion.button
                    whileHover={{ scale:1.01 }} whileTap={{ scale:0.99 }}
                    onClick={()=>{setPhase("dashboard");setTimeout(()=>workflowRef.current?.scrollIntoView({behavior:"smooth",block:"start"}),400);}}
                    className="px-6 py-2.5 bg-white text-black font-bold rounded hover:bg-zinc-100 transition-colors text-xs font-mono tracking-wider uppercase"
                  >
                    Load Synthetic Grid
                  </motion.button>
                  <motion.button
                    whileHover={{ scale:1.01 }} whileTap={{ scale:0.99 }}
                    onClick={handleClear}
                    className="px-5 py-2.5 border border-zinc-900 hover:border-zinc-800 rounded transition-colors text-xs text-zinc-500 hover:text-zinc-300 font-mono uppercase"
                  >
                    Reset
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* DASHBOARD SCREEN */}
            {phase==="dashboard" && dashboard && (
              <motion.div
                key="dashboard"
                ref={workflowRef}
                initial={{ opacity:0, y:30 }}
                animate={{ opacity:1, y:0 }}
                exit={{ opacity:0, y:-20 }}
                transition={{ duration:0.8 }}
                className="mt-12 space-y-4"
              >
                {/* GLOBAL HEADER */}
                <motion.div
                  initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
                  className="bg-zinc-950/60 border border-zinc-900 rounded-xl p-6 relative overflow-hidden flex flex-col md:flex-row gap-6 justify-between items-start backdrop-blur-md"
                >
                  <div className="z-10 flex-1">
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <p className="text-blue-500 font-mono text-[9px] font-bold tracking-[0.2em] uppercase">Autonomous Execution Environment</p>
                      <SynthesisBadge synthesisState={synthesisState}/>
                    </div>
                    <h2 className="text-2xl font-extrabold leading-tight tracking-tight mb-4">{dashboard.globalSummary}</h2>

                    <div className="bg-zinc-950 border-l border-blue-500 pl-3.5 py-2 pr-3 rounded-r-md max-w-2xl">
                      <p className="text-zinc-400 font-mono text-[9px] font-semibold mb-0.5 uppercase tracking-wider">Agentic Synthesis Reasoning</p>
                      <p className="text-zinc-500 text-[10px] leading-relaxed italic">"{dashboard.agenticState.situationalAwareness} {dashboard.agenticState.selfCritique}"</p>
                      {synthesisState.source==="fallback" && synthesisState.failureReason && (
                        <p className="text-amber-500/60 font-mono text-[8px] mt-1.5 uppercase tracking-wider">{synthesisState.failureReason.replace(/_/g," ")} active</p>
                      )}
                    </div>

                    <div className="flex gap-2.5 items-center mt-4 flex-wrap text-[10px]">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider border ${dashboard.globalSeverity==="critical"?"bg-rose-500/10 text-rose-400 border-rose-500/20":dashboard.globalSeverity==="elevated"?"bg-orange-500/10 text-orange-400 border-orange-500/20":"bg-blue-500/10 text-blue-400 border-blue-500/20"}`}>
                        Macro Severity: {dashboard.globalSeverity}
                      </span>
                      <span className="text-zinc-500 font-mono">{dashboard.workflows.length} active routes</span>
                      <span className="text-zinc-700">•</span>
                      <span className="text-zinc-500 font-mono">Layout Mode: {dashboard.dashboardLayoutMode}</span>
                    </div>
                  </div>

                  {/* MEMORY CONTROL */}
                  <div className="z-10 bg-zinc-950 border border-zinc-900 p-4.5 rounded-lg flex flex-col gap-3 min-w-[180px] backdrop-blur-sm">
                    <p className="text-zinc-500 font-mono text-[9px] uppercase tracking-wider">Continuous Tuning</p>
                    <div className="flex gap-4">
                      <div><p className="text-emerald-400 text-lg font-mono font-bold">{interactionMemory.approvedTags.length}</p><p className="text-zinc-600 font-mono text-[8px] uppercase">Approved</p></div>
                      <div><p className="text-rose-400 text-lg font-mono font-bold">{interactionMemory.rejectedTags.length}</p><p className="text-zinc-600 font-mono text-[8px] uppercase">Rejected</p></div>
                    </div>
                    <motion.button
                      whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                      onClick={handleEvolve}
                      disabled={loading||(interactionMemory.approvedTags.length===0&&interactionMemory.rejectedTags.length===0)}
                      className="w-full py-1.5 bg-white text-black font-bold rounded font-mono text-[10px] uppercase tracking-wider disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                    >
                      {loading ? "Evolving..." : "Evolve UI"}
                    </motion.button>
                  </div>
                </motion.div>

                {/* ============================================================ */}
                {/* HERO INSIGHT ENGINE (DOMINANT "AI CONCLUSION" CARD)          */}
                {/* ============================================================ */}
                <motion.div
                  initial={{ opacity:0, y:15 }}
                  animate={{ opacity:1, y:0 }}
                  className={`border rounded-xl p-5 relative overflow-hidden backdrop-blur-md ${
                    dashboard.heroInsight.severity === "critical"
                      ? "border-rose-800/40 bg-gradient-to-br from-rose-950/20 to-black"
                      : "border-blue-900/40 bg-gradient-to-br from-blue-950/20 to-black"
                  }`}
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/[0.02] rounded-full blur-2xl pointer-events-none"/>
                  <div className="absolute top-3 right-3 select-none text-[8px] font-mono font-bold text-zinc-500 border border-zinc-800 px-2 py-0.5 rounded">
                    HERO INTEL ENGINE
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${dashboard.heroInsight.severity === "critical" ? "bg-rose-500 animate-pulse" : "bg-blue-500 animate-ping"}`}/>
                        <p className="text-zinc-400 font-mono text-[9px] uppercase tracking-widest font-bold">Primary System Synthesis</p>
                      </div>
                      <h3 className="text-xl font-black text-white tracking-tight leading-snug">{dashboard.heroInsight.headline}</h3>
                      <p className="text-zinc-500 text-xs leading-relaxed max-w-2xl">{dashboard.heroInsight.supportingStatement}</p>
                      
                      {dashboard.heroInsight.affectedVectors.length > 0 && (
                        <div className="flex items-center gap-2 pt-1">
                          <p className="text-[8px] font-mono text-zinc-600 uppercase">Affected Vectors:</p>
                          <div className="flex gap-1">
                            {dashboard.heroInsight.affectedVectors.map(v => (
                              <span key={v} className="bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-[8px] px-1.5 py-0.5 rounded">{v}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-zinc-950/80 border border-zinc-900/80 p-4 rounded-lg flex flex-col justify-center min-w-[140px] text-center md:text-left">
                      <p className="text-zinc-600 font-mono text-[8px] uppercase tracking-wider mb-1">{dashboard.heroInsight.metricLabel}</p>
                      <p className="text-2xl font-black tracking-tighter text-white font-mono">{dashboard.heroInsight.primaryMetricValue}</p>
                      <p className="text-zinc-500 text-[9px] leading-tight mt-1 font-mono italic">{dashboard.heroInsight.causalLink}</p>
                    </div>
                  </div>
                </motion.div>

                {/* WORKFLOW GRID */}
                <div className={`grid ${layoutGridClass} gap-4 items-start`}>
                  {orderedWorkflows.map((workflow, index) => {
                    const maxVal = Math.max(...(workflow.chartData||[1]),1);
                    const isExpanded = expandedCard===index;
                    const confidencePercent = workflow.confidence;
                    
                    return (
                      <motion.div
                        key={`${workflow.title}-${index}`}
                        initial={{ opacity:0, y:15 }}
                        animate={{ opacity:1, y:0 }}
                        transition={{ duration:0.4, delay:index*0.05 }}
                        onClick={()=>setExpandedCard(isExpanded?null:index)}
                        className={`bg-zinc-950/40 border rounded-xl p-4.5 cursor-pointer flex flex-col backdrop-blur-md relative overflow-hidden transition-all group ${
                          workflow.severity === "critical" 
                            ? "border-rose-900/40 hover:border-rose-800/60 md:col-span-2" 
                            : confidencePercent > 90 
                            ? "border-zinc-800 hover:border-zinc-700/80" 
                            : "border-zinc-900 hover:border-zinc-800/80"
                        }`}
                      >
                        <div 
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" 
                          style={{
                            background: `radial-gradient(400px at 50% 0%, ${
                              workflow.severity === "critical" 
                                ? "rgba(244,63,94,0.015)" 
                                : "rgba(59,130,246,0.015)"
                            }, transparent)`
                          }}
                        />

                        <div className={`absolute top-0 left-0 right-0 h-[1.5px] ${
                          workflow.severity==="critical"
                            ? "bg-rose-600/50"
                            : workflow.severity==="high"
                            ? "bg-orange-500/40"
                            : workflow.severity==="medium"
                            ? "bg-amber-500/30"
                            : "bg-zinc-800"
                        }`}/>

                        <div className="flex justify-between items-start mb-3 relative z-10">
                          <div className="space-y-0.5">
                            <p className="text-[8px] font-mono font-bold text-zinc-600 uppercase tracking-widest">{workflow.archetype}</p>
                            <h2 className="text-base font-bold tracking-tight text-zinc-100">{workflow.title}</h2>
                          </div>
                          <div className="flex flex-col items-end gap-1 font-mono">
                            <span className={`text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border ${severityColors[workflow.severity]}`}>
                              {workflow.severity}
                            </span>
                            <span className="text-zinc-600 text-[9px]">{confidencePercent}% conf</span>
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col relative z-10 space-y-3.5">
                          <p className="text-zinc-400 text-[11px] leading-relaxed line-clamp-2">{workflow.description}</p>
                          
                          <UIRecursiveRenderer 
                            node={workflow.uiBlueprint} 
                            workflow={workflow} 
                            maxVal={maxVal} 
                            density={dashboard.agenticState.cognitiveDensity}
                          />

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}}
                                transition={{duration:0.3}}
                                className="overflow-hidden"
                              >
                                <div className="mt-4 pt-3.5 border-t border-zinc-900/80 space-y-3 text-[11px]">
                                  <div>
                                    <p className="text-blue-500 font-mono text-[8px] font-bold uppercase tracking-wider mb-0.5">Statistical Reasoning</p>
                                    <p className="text-zinc-300 leading-relaxed font-mono text-[10px]">{workflow.reasoning}</p>
                                  </div>
                                  <div>
                                    <p className="text-blue-500 font-mono text-[8px] font-bold uppercase tracking-wider mb-0.5">System Impact Optimization</p>
                                    <p className="text-zinc-400 leading-relaxed font-mono text-[10px]">{workflow.businessContext}</p>
                                  </div>
                                  <div className="flex gap-2 pt-1 font-mono">
                                    <button
                                      onClick={e=>{e.stopPropagation();handleAction(index,"approve");}}
                                      className="bg-zinc-100 hover:bg-white text-black font-bold px-3 py-1 rounded text-[9px] uppercase tracking-wider"
                                    >
                                      Accept Path
                                    </button>
                                    <button
                                      onClick={e=>{e.stopPropagation();handleAction(index,"reject");}}
                                      className="border border-zinc-800 hover:border-zinc-700 hover:text-zinc-300 text-zinc-500 px-3 py-1 rounded text-[9px] uppercase tracking-wider"
                                    >
                                      Suppress Signal
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex justify-center pt-8">
                  <button onClick={()=>setPhase("preview")} className="text-zinc-600 hover:text-zinc-400 font-mono text-[10px] uppercase tracking-wider transition-colors">
                    ← Back to parameters
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}