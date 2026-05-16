import type {
  ColumnProfile,
  CausalRelation,
  InteractionMemory,
  PromptLevel,
  ModelTier,
} from "../types/index";

import { emit } from "../utils/logger";

// ============================================================
// PROMPT BUILDER
// ============================================================

export function buildPrompt(
  profiles: ColumnProfile[],
  causalChains: CausalRelation[],
  memory:
    InteractionMemory | undefined,

  level: PromptLevel,

  modelTier: ModelTier
): string {

  emit({
    stage: "PROMPT_BUILD",
    level: "info",

    message:
      `Building prompt level=${level} tier=${modelTier}`,
  });

  // ============================================================
  // DENSITY CONTROLS
  // ============================================================

  const MAX_PROFILES =
    level === "full"
      ? 15
      : level === "compressed"
      ? 8
      : 4;

  const MAX_CHAINS =
    level === "full"
      ? 12
      : level === "compressed"
      ? 5
      : 2;

  const MAX_WORKFLOWS =
    modelTier === "standard"
      ? 3
      : 5;

  // ============================================================
  // PROFILE REDUCTION
  // ============================================================

  const slimProfiles =
    profiles
      .slice(0, MAX_PROFILES)
      .map((p) => ({

        column:
          p.cleanName,

        role:
          p.role,

        avg:
          p.avg,

        min:
          p.min,

        max:
          p.max,

        drift:
          p.temporalDrift,

        outliers:
          p.outlierCount,

        entropy:
          p.entropy,

        regimeShift:
          p.regimeShiftDetected,

        clusters:
          p.topClusters?.slice(0, 2),

        rawValuesSlice:
          p.rawValues.slice(0, 12),
      }));

  const slimChains =
    causalChains.slice(
      0,
      MAX_CHAINS
    );

  // ============================================================
  // UI EXAMPLE
  // ============================================================

  const uiSchemaExample =
    `{ "type": "col", "children": [{"type": "row", "children": [{"type": "kpi_block"}, {"type": "trend_sparkline"}]}, {"type": "stat_grid"}] }`;

  // ============================================================
  // MEMORY REINFORCEMENT
  // ============================================================

  let reinforcementContext =
    "";

  if (
    memory &&
    level === "full" &&
    (
      memory.approvedTags.length > 0 ||
      memory.rejectedTags.length > 0
    )
  ) {

    reinforcementContext =
      `
USER REINFORCEMENT:
approved=[${memory.approvedTags.join(", ")}]
rejected=[${memory.rejectedTags.join(", ")}]
preferredDensity=${memory.preferredDensity}
`;
  }

  // ============================================================
  // MINIMAL MODE
  // ============================================================

  if (level === "minimal") {

    return `
You are a data analysis AI.

Output ONLY valid JSON.
No markdown wrappers.
No explanation text.

DATASET:
${JSON.stringify(slimProfiles)}

OUTPUT:
{
  "agenticState": {
    "situationalAwareness":"string",
    "layoutStrategy":"string",
    "cognitiveDensity":"high",
    "selfCritique":"string"
  },

  "dashboard": {
    "globalSummary":"string",

    "globalSeverity":"stable",

    "dashboardLayoutMode":"INTELLIGENCE_GRID",

    "heroInsight":{
      "headline":"string",
      "supportingStatement":"string",
      "primaryMetricValue":"string",
      "metricLabel":"string",
      "causalLink":"string",
      "affectedVectors":["col"],
      "severity":"low"
    },

    "workflows":[
      {
        "title":"string",

        "layoutMode":"dashboard",

        "archetype":"OPERATIONAL_WORKFLOW",

        "uiBlueprint":
          ${uiSchemaExample},

        "primaryMetric":"string",

        "secondaryMetric":"string",

        "severity":"medium",

        "quickStats":{
          "Key":"Val"
        },

        "tags":["Tag"],

        "confidence":80,

        "description":"string",

        "reasoning":"string",

        "businessContext":"string",

        "detectedColumns":["col"],

        "chartData":[10,20,30]
      }
    ]
  }
}`;
  }

  // ============================================================
  // FULL / COMPRESSED MODES
  // ============================================================

  return `
You are a production-grade analytics synthesis engine.

Output ONLY strict JSON.

No markdown wrappers.
No explanation text.

DATASET STATISTICAL METADATA:
${JSON.stringify(
  slimProfiles,
  null,
  1
)}

MUTUAL COVARIANCE RELATIONS:
${JSON.stringify(
  slimChains,
  null,
  1
)}

${reinforcementContext}

TASK:

1. Generate ONE dominant hero insight summarizing the dataset state.

2. Choose dashboardLayoutMode:
- COMPACT
- TIMELINE_FIRST
- GRAPH_FIRST
- INTELLIGENCE_GRID

3. Generate exactly ${MAX_WORKFLOWS} analytical workflows.

STRICT RULES:

- chartData must come from rawValuesSlice
- Do NOT fabricate values
- Use real statistical relationships
- Use grounded business language

JSON TEMPLATE:

{
  "agenticState": {
    "situationalAwareness":"string",
    "layoutStrategy":"string",
    "cognitiveDensity":"high",
    "selfCritique":"string"
  },

  "dashboard": {

    "globalSummary":"string",

    "globalSeverity":
      "critical" |
      "elevated" |
      "stable",

    "dashboardLayoutMode":
      "COMPACT" |
      "INTELLIGENCE_GRID" |
      "TIMELINE_FIRST" |
      "GRAPH_FIRST",

    "heroInsight": {
      "headline":"string",
      "supportingStatement":"string",
      "primaryMetricValue":"string",
      "metricLabel":"string",
      "causalLink":"string",
      "affectedVectors":["column"],
      "severity":
        "critical" |
        "high" |
        "medium" |
        "low"
    },

    "workflows": [
      {
        "title":"string",

        "layoutMode":
          "dashboard" |
          "comparison" |
          "alert",

        "archetype":
          "ANOMALY_WORKFLOW" |
          "TEMPORAL_WORKFLOW" |
          "CORRELATION_WORKFLOW" |
          "DISTRIBUTION_WORKFLOW" |
          "CLUSTER_WORKFLOW" |
          "BEHAVIORAL_WORKFLOW" |
          "OPERATIONAL_WORKFLOW",

        "uiBlueprint": {
          "type":"col",
          "children":[
            {
              "type":"kpi_block"
            }
          ]
        },

        "primaryMetric":"string",

        "secondaryMetric":"string",

        "severity":
          "critical" |
          "high" |
          "medium" |
          "low",

        "quickStats":{
          "Entropy":"2.1"
        },

        "tags":["Analytics"],

        "confidence":92,

        "description":"string",

        "reasoning":"string",

        "businessContext":"string",

        "detectedColumns":["column"],

        "chartData":[1,2,3]
      }
    ]
  }
}`;
}