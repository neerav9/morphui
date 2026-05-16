import { z } from "zod";

// ============================================================
// BASE ENUMS
// ============================================================

export const ZUILayout = z.enum([
  "col",
  "row",
  "grid_2",
]);

export const ZSeverity = z.enum([
  "critical",
  "high",
  "medium",
  "low",
]);

export const ZGlobalSeverity = z.enum([
  "critical",
  "elevated",
  "stable",
]);

export const ZCognitiveDensity = z.enum([
  "high",
  "medium",
  "low",
]);

// ============================================================
// WORKFLOW ENUMS
// ============================================================

export const ZWorkflowArchetype = z.enum([
  "ANOMALY_WORKFLOW",
  "TEMPORAL_WORKFLOW",
  "CORRELATION_WORKFLOW",
  "DISTRIBUTION_WORKFLOW",
  "CLUSTER_WORKFLOW",
  "BEHAVIORAL_WORKFLOW",
  "OPERATIONAL_WORKFLOW",
]);

export const ZUIPrimitive = z.enum([
  "kpi_block",
  "scatter_plot",
  "trend_sparkline",
  "alert_chip",
  "bar_chart",
  "stat_grid",
  "semantic_tags",
  "data_table",
  "insight_cluster",
]);

// ============================================================
// UI NODE
// ============================================================

const ZUINodeBase = z.object({
  type: z.union([ZUIPrimitive, ZUILayout]),
  meta: z.record(z.unknown()).optional(),
});

export type ZUINodeType = z.infer<typeof ZUINodeBase> & {
  children?: ZUINodeType[];
};

export const ZUINode: z.ZodType<ZUINodeType> =
  ZUINodeBase.extend({
    children: z
      .lazy(() => ZUINode.array().max(10).optional()),
  });

// ============================================================
// AGENTIC STATE
// ============================================================

export const ZAgenticState = z.object({
  situationalAwareness: z
    .string()
    .min(1)
    .default(
      "Macro pipeline validation initialized."
    ),

  layoutStrategy: z
    .string()
    .min(1)
    .default(
      "Deterministic density grid mapping."
    ),

  cognitiveDensity: ZCognitiveDensity.default(
    "high"
  ),

  selfCritique: z
    .string()
    .min(1)
    .default(
      "All calculated boundaries verified with Pearson R validations."
    ),
});

// ============================================================
// HERO INSIGHT
// ============================================================

export const ZHeroInsight = z.object({
  headline: z
    .string()
    .default(
      "Integrated System Equilibrium Profiled"
    ),

  supportingStatement: z
    .string()
    .default(
      "No extreme anomalies breached standard statistical deviation thresholds."
    ),

  primaryMetricValue: z
    .string()
    .default("100%"),

  metricLabel: z
    .string()
    .default("Telemetry Density"),

  causalLink: z
    .string()
    .default(
      "Primary covariance nodes remain aligned."
    ),

  affectedVectors: z
    .array(z.string())
    .default([]),

  severity: ZSeverity.default("low"),
});

// ============================================================
// WORKFLOW
// ============================================================

export const ZWorkflow = z.object({
  title: z
    .string()
    .min(1)
    .default("Operational Vector"),

  layoutMode: z
    .string()
    .default("dashboard"),

  archetype: ZWorkflowArchetype.default(
    "OPERATIONAL_WORKFLOW"
  ),

  uiBlueprint: ZUINode.default({
    type: "col",
    children: [{ type: "kpi_block" }],
  }),

  primaryMetric: z
    .string()
    .default("—"),

  secondaryMetric: z
    .string()
    .default("—"),

  severity: ZSeverity.default("medium"),

  quickStats: z
    .record(z.string())
    .default({}),

  tags: z
    .array(z.string())
    .min(1)
    .default(["Telemetry"]),

  confidence: z
    .number()
    .min(0)
    .max(100)
    .default(85),

  description: z
    .string()
    .default("Telemetry parsing."),

  reasoning: z
    .string()
    .default(
      "Derived deterministic bounds profiling."
    ),

  businessContext: z
    .string()
    .default(
      "Continuous monitoring threshold mapping."
    ),

  chartData: z
    .array(z.number())
    .default([]),

  detectedColumns: z
    .array(z.string())
    .default([]),
});

// ============================================================
// ROOT PAYLOAD
// ============================================================

export const ZLLMPayload = z.object({
  agenticState: ZAgenticState,

  dashboard: z.object({
    globalSummary: z
      .string()
      .default("State vectors integrated."),

    globalSeverity:
      ZGlobalSeverity.default("stable"),

    dashboardLayoutMode: z
      .enum([
        "COMPACT",
        "INTELLIGENCE_GRID",
        "TIMELINE_FIRST",
        "GRAPH_FIRST",
      ])
      .default("INTELLIGENCE_GRID"),

    heroInsight: ZHeroInsight,

    workflows: z
      .array(ZWorkflow)
      .min(1)
      .max(8),
  }),
});