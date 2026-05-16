import type {
  ColumnProfile,
  CausalRelation,
  LLMFailureReason,
  GlobalDashboard,
  Workflow,
  HeroInsight,
} from "../types";
import {
  generateWorkflowStrategies,
} from "./strategyEngine";
export const FALLBACK_REASON_LABELS: Record<
  LLMFailureReason,
  string
> = {
  api_unreachable:
    "LLM unavailable — using deterministic analytics engine",

  timeout:
    "Generation timed out — using deterministic analytics engine",

  malformed_json:
    "Response parsing failed — using deterministic analytics engine",

  schema_validation_failed:
    "Schema validation failed — using deterministic analytics engine",

  empty_workflows:
    "No valid workflows generated — using deterministic analytics engine",

  unknown:
    "Using deterministic analytics engine",
};

export function generateFallbackDashboard(
  profiles: ColumnProfile[],
  causalChains: CausalRelation[],
  reason: LLMFailureReason = "unknown"
): GlobalDashboard {
  const workflows: Workflow[] = [];

const strategies =
  generateWorkflowStrategies(
    profiles,
    causalChains
  );

  // ============================================================
// BUILD WORKFLOWS FROM STRATEGIES
// ============================================================

for (
  const strategy
  of strategies
) {

  const primaryColumn =
    strategy.columns[0];

  const profile =
    profiles.find(
      (p) =>
        p.cleanName ===
        primaryColumn
    );

  const relation =
    causalChains.find(
      (r) =>
        strategy.columns.includes(
          r.source
        ) &&
        strategy.columns.includes(
          r.target
        )
    );

  // ============================================================
  // ANOMALY WORKFLOW
  // ============================================================

  if (
    strategy.archetype ===
    "ANOMALY_WORKFLOW"
  ) {

    workflows.push({

      title:
        `${primaryColumn} Anomalies`,

      layoutMode:
        "alert",

      archetype:
        "ANOMALY_WORKFLOW",

      uiBlueprint: {
        type: "col",

        children: [
          {
            type:
              "alert_chip",
          },

          {
            type:
              "kpi_block",
          },

          {
            type:
              "stat_grid",
          },
        ],
      },

      primaryMetric:
        `${profile?.outlierCount || 0} anomalies`,

      secondaryMetric:
        "Statistical outliers detected",

      severity:
        strategy.severity,

      quickStats: {
        Entropy:
          String(
            profile?.entropy || 0
          ),

        Max:
          profile?.max || "—",

        StdDev:
          profile?.stdDev || "—",
      },

      tags: [
        "Anomaly",
        "Risk",
      ],

      confidence:
        strategy.priority,

      description:
        "Abnormal statistical behavior detected.",

      reasoning:
        strategy.reasoning,

      businessContext:
        "Unexpected operating conditions may require investigation.",

      chartData:
        profile?.rawValues || [],

      detectedColumns:
        strategy.columns,
    });
  }

  // ============================================================
  // TEMPORAL WORKFLOW
  // ============================================================

  else if (
    strategy.archetype ===
    "TEMPORAL_WORKFLOW"
  ) {

    workflows.push({

      title:
        `${primaryColumn} Trend Shift`,

      layoutMode:
        "dashboard",

      archetype:
        "TEMPORAL_WORKFLOW",

      uiBlueprint: {
        type: "col",

        children: [
          {
            type:
              "trend_sparkline",
          },

          {
            type:
              "stat_grid",
          },
        ],
      },

      primaryMetric:
        profile?.temporalDrift ||
        "Volatility detected",

      secondaryMetric:
        "Directional trend movement",

      severity:
        strategy.severity,

      quickStats: {
        Volatility:
          String(
            profile
              ?.rollingVolatility?.[0] || 0
          ),

        Entropy:
          String(
            profile?.entropy || 0
          ),
      },

      tags: [
        "Trend",
        "Temporal",
      ],

      confidence:
        strategy.priority,

      description:
        "Time-series instability detected.",

      reasoning:
        strategy.reasoning,

      businessContext:
        "Directional operational changes were identified over time.",

      chartData:
        profile?.rawValues || [],

      detectedColumns:
        strategy.columns,
    });
  }

  // ============================================================
  // CORRELATION WORKFLOW
  // ============================================================

  else if (
    strategy.archetype ===
    "CORRELATION_WORKFLOW"
  ) {

    workflows.push({

      title:
        `${strategy.columns[0]} vs ${strategy.columns[1]}`,

      layoutMode:
        "comparison",

      archetype:
        "CORRELATION_WORKFLOW",

      uiBlueprint: {
        type: "grid_2",

        children: [
          {
            type:
              "scatter_plot",
          },

          {
            type:
              "stat_grid",
          },
        ],
      },

      primaryMetric:
        `R = ${relation?.pearsonR || 0}`,

      secondaryMetric:
        "Statistical relationship detected",

      severity:
        strategy.severity,

      quickStats: {
        Covariance:
          String(
            relation?.covariance || 0
          ),

        Direction:
          relation?.direction ||
          "unknown",
      },

      tags: [
        "Correlation",
        "Relationship",
      ],

      confidence:
        strategy.priority,

      description:
        "Variables exhibit coordinated statistical movement.",

      reasoning:
        strategy.reasoning,

      businessContext:
        "Changes in one variable strongly influence the other.",

      chartData:
        profile?.rawValues || [],

      detectedColumns:
        strategy.columns,
    });
  }

  // ============================================================
  // OPERATIONAL WORKFLOW
  // ============================================================

  else {

    workflows.push({

      title:
        `${primaryColumn} Overview`,

      layoutMode:
        "dashboard",

      archetype:
        "OPERATIONAL_WORKFLOW",

      uiBlueprint: {
        type: "col",

        children: [
          {
            type:
              "kpi_block",
          },

          {
            type:
              "bar_chart",
          },
        ],
      },

      primaryMetric:
        profile?.avg ||
        "Stable",

      secondaryMetric:
        "Operational baseline",

      severity:
        strategy.severity,

      quickStats: {
        Average:
          profile?.avg || "—",

        Min:
          profile?.min || "—",

        Max:
          profile?.max || "—",
      },

      tags: [
        "Baseline",
      ],

      confidence:
        strategy.priority,

      description:
        "Stable operational behavior detected.",

      reasoning:
        strategy.reasoning,

      businessContext:
        "No major instability was identified.",

      chartData:
        profile?.rawValues || [],

      detectedColumns:
        strategy.columns,
    });
  }
}

 // ============================================================
// STRATEGY CONTEXT HELPERS
// ============================================================

const topRel =
  causalChains[0];

const drifting =
  profiles.find(
    (p) =>
      p.temporalDrift ||
      (
        p.rollingVolatility?.[0] || 0
      ) > 15
  ); 


  // ============================================================
  // GLOBAL SEVERITY
  // ============================================================

  const hasCritical = workflows.some(
    (w) => w.severity === "critical"
  );

  const hasHigh = workflows.some(
    (w) => w.severity === "high"
  );

  // ============================================================
  // DASHBOARD LAYOUT
  // ============================================================

  let fallbackLayoutMode:
    GlobalDashboard["dashboardLayoutMode"] =
    "INTELLIGENCE_GRID";

  if (profiles.length < 4)
    fallbackLayoutMode = "COMPACT";

  else if (drifting)
    fallbackLayoutMode =
      "TIMELINE_FIRST";

  else if (topRel)
    fallbackLayoutMode = "GRAPH_FIRST";

  // ============================================================
  // HERO INSIGHT
  // ============================================================

  const heroInsight: HeroInsight = {
    headline: topRel
      ? `${topRel.source} and ${topRel.target} show a strong relationship`
      : "Dataset appears operationally stable",

    supportingStatement: topRel
      ? `A strong statistical relationship was detected with Pearson R = ${topRel.pearsonR}.`
      : "No major anomalies or unstable trends were detected.",

    primaryMetricValue: topRel
      ? `${topRel.pearsonR}`
      : "Stable",

    metricLabel: topRel
      ? "Correlation Strength"
      : "System Status",

    causalLink: topRel
      ? `Changes in ${topRel.source} are strongly associated with ${topRel.target}.`
      : "No strong cross-variable dependencies detected.",

    affectedVectors: topRel
      ? [topRel.source, topRel.target]
      : [],

    severity: hasCritical
      ? "critical"
      : hasHigh
      ? "high"
      : "low",
  };

  return {
    agenticState: {
      situationalAwareness:
        `Deterministic analytics mode active. ${FALLBACK_REASON_LABELS[reason]}.`,

      layoutStrategy:
        "Dashboard generated using dataset structure and statistical findings.",

      cognitiveDensity: "high",

      selfCritique:
        "Dashboard generated from deterministic statistical analysis without LLM synthesis.",
    },

    globalSummary: hasCritical
      ? "Critical statistical anomalies were detected in the dataset."
      : "Dataset analysis completed successfully with stable operational patterns.",

    globalSeverity: hasCritical
      ? "critical"
      : hasHigh
      ? "elevated"
      : "stable",

    dashboardLayoutMode:
      fallbackLayoutMode,

    heroInsight,

    workflows: workflows.sort(
      (a, b) =>
        ({
          critical: 4,
          high: 3,
          medium: 2,
          low: 1,
        }[b.severity] -
          {
            critical: 4,
            high: 3,
            medium: 2,
            low: 1,
          }[a.severity]
      )
    ),
  };
}