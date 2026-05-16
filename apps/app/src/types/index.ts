// ============================================================
// OBSERVABILITY LOGGER
// ============================================================

export type LogStage =
  | "PROMPT_BUILD"
  | "LLM_CALL"
  | "JSON_EXTRACT"
  | "ZOD_VALIDATE"
  | "NORMALIZE"
  | "RETRY"
  | "FALLBACK"
  | "RENDER"
  | "ANALYTICS_ENGINE";

export type LogLevel =
  | "info"
  | "warn"
  | "error"
  | "success";

export interface LogEntry {
  stage: LogStage;
  level: LogLevel;
  message: string;
  data?: unknown;
}

// ============================================================
// AGENTIC STATE
// ============================================================

export interface AgenticState {
  situationalAwareness: string;
  layoutStrategy: string;

  cognitiveDensity:
    | "high"
    | "medium"
    | "low";

  selfCritique: string;
}

// ============================================================
// UI SYSTEM
// ============================================================

export type UIPrimitive =
  | "kpi_block"
  | "scatter_plot"
  | "trend_sparkline"
  | "alert_chip"
  | "bar_chart"
  | "stat_grid"
  | "semantic_tags"
  | "data_table"
  | "insight_cluster";

export type UILayout =
  | "col"
  | "row"
  | "grid_2";

export interface UINode {
  type: UIPrimitive | UILayout;

  children?: UINode[];

  meta?: Record<
    string,
    unknown
  >;
}

// ============================================================
// CORE SEMANTICS
// ============================================================

export type Severity =
  | "critical"
  | "high"
  | "medium"
  | "low";

export type SemanticRole =
  | "IDENTITY"
  | "METRIC"
  | "CATEGORICAL"
  | "TEMPORAL"
  | "BEHAVIORAL";

export type OperationalDomain =
  | "financial"
  | "health"
  | "logistics"
  | "hr"
  | "agnostic";

// ============================================================
// DATA PREPROCESSING
// ============================================================

export interface CleanedColumn {
  rawName: string;
  rawKey: string;

  cleanName: string;

  role: SemanticRole;
  domain: OperationalDomain;
}

// ============================================================
// WORKFLOW ARCHETYPES
// ============================================================

export type WorkflowArchetype =
  | "ANOMALY_WORKFLOW"
  | "TEMPORAL_WORKFLOW"
  | "CORRELATION_WORKFLOW"
  | "DISTRIBUTION_WORKFLOW"
  | "CLUSTER_WORKFLOW"
  | "BEHAVIORAL_WORKFLOW"
  | "OPERATIONAL_WORKFLOW";

// ============================================================
// WORKFLOW
// ============================================================

export interface Workflow {

  title: string;

  uiBlueprint: UINode;

  layoutMode: string;

  primaryMetric: string;
  secondaryMetric: string;

  severity: Severity;

  quickStats:
    Record<string, string>;

  tags: string[];

  confidence: number;

  description: string;
  reasoning: string;
  businessContext: string;

  chartData: number[];

  detectedColumns: string[];

  archetype: WorkflowArchetype;
}

// ============================================================
// HERO INSIGHT
// ============================================================

export interface HeroInsight {
  headline: string;

  supportingStatement: string;

  primaryMetricValue: string;

  metricLabel: string;

  causalLink: string;

  affectedVectors: string[];

  severity: Severity;
}

// ============================================================
// GLOBAL DASHBOARD
// ============================================================

export interface GlobalDashboard {

  agenticState:
    AgenticState;

  globalSummary: string;

  globalSeverity:
    | "critical"
    | "elevated"
    | "stable";

  dashboardLayoutMode:
    | "COMPACT"
    | "INTELLIGENCE_GRID"
    | "TIMELINE_FIRST"
    | "GRAPH_FIRST";

  heroInsight:
    HeroInsight;

  workflows:
    Workflow[];
}

// ============================================================
// INTERACTION MEMORY
// ============================================================

export interface InteractionMemory {

  approvedTags:
    string[];

  rejectedTags:
    string[];

  preferredLayouts:
    string[];

  preferredDensity:
    | "high"
    | "medium"
    | "low";
}

// ============================================================
// LLM PIPELINE
// ============================================================

export type LLMFailureReason =
  | "api_unreachable"
  | "timeout"
  | "malformed_json"
  | "schema_validation_failed"
  | "empty_workflows"
  | "unknown";

export interface SynthesisState {
  source:
    | "llm"
    | "fallback"
    | "idle";

  failureReason?:
    LLMFailureReason;
}

export interface LLMAttemptResult {

  success: boolean;

  dashboard?:
    GlobalDashboard;

  failureReason?:
    LLMFailureReason;

  rawResponse?: string;
}

export type PromptLevel =
  | "full"
  | "compressed"
  | "minimal";

export type ModelTier =
  | "standard"
  | "advanced";

// ============================================================
// ADVANCED ANALYTICS
// ============================================================

export interface AdvancedMetrics {

  mean: number;

  variance: number;

  stdDev: number;

  min: number;

  max: number;

  percentiles: {
    p25: number;
    p50: number;
    p75: number;
    p90: number;
  };

  zScoreOutliers:
    number[];

  entropy: number;

  rollingVolatility:
    number[];

  regimeShiftDetected:
    boolean;

  skewness: number;

  nullRatio: number;
}

// ============================================================
// CAUSAL ANALYTICS
// ============================================================

export interface CausalRelation {

  source: string;

  target: string;

  covariance: number;

  pearsonR: number;

  direction:
    | "positive_feedback"
    | "inverse_coupling"
    | "stable_uncoupled";

  entropyGap: number;
}

// ============================================================
// COLUMN PROFILE
// ============================================================

export interface ColumnProfile {

  cleanName: string;

  rawKey: string;

  inferredType:
    | "numeric"
    | "categorical";

  role: SemanticRole;

  domain:
    OperationalDomain;

  nullPercent: number;

  uniquePercent: number;

  avg?: string;

  min?: string;

  max?: string;

  stdDev?: string;

  outlierCount?: number;

  topClusters?:
    string[];

  temporalDrift?:
    string;

  sequentialVolatility?:
    string;

  rawValues:
    number[];

  skewness?: number;

  nullCount: number;

  entropy?: number;

  rollingVolatility?:
    number[];

  regimeShiftDetected?:
    boolean;
}