import type {
  ColumnProfile,
  CausalRelation,
  WorkflowArchetype,
  Severity,
} from "../types/index";

// ============================================================
// STRATEGY TYPES
// ============================================================

export interface WorkflowStrategy {

  archetype:
    WorkflowArchetype;

  severity:
    Severity;

  priority:
    number;

  columns:
    string[];

  reasoning:
    string;
}

// ============================================================
// MAIN STRATEGY ENGINE
// ============================================================

export function generateWorkflowStrategies(
  profiles: ColumnProfile[],
  causalRelations: CausalRelation[]
): WorkflowStrategy[] {

  const strategies:
    WorkflowStrategy[] = [];

  // ============================================================
  // ANOMALY DETECTION
  // ============================================================

  for (const profile of profiles) {

    const outlierCount =
      profile.outlierCount || 0;

    const total =
      profile.rawValues.length || 1;

    const anomalyRatio =
      outlierCount / total;

    const entropy =
      profile.entropy || 0;

    const regimeShift =
      profile.regimeShiftDetected || false;

    // ------------------------------------------------------------
    // CRITICAL ANOMALY
    // ------------------------------------------------------------

    if (
      anomalyRatio > 0.15 ||
      (
        regimeShift &&
        entropy > 2.5
      )
    ) {

      strategies.push({

        archetype:
          "ANOMALY_WORKFLOW",

        severity:
          "critical",

        priority: 95,

        columns: [
          profile.cleanName,
        ],

        reasoning:
          "High anomaly density and unstable statistical behavior detected.",
      });

      continue;
    }

    // ------------------------------------------------------------
    // MODERATE ANOMALY
    // ------------------------------------------------------------

    if (
      anomalyRatio > 0.05
    ) {

      strategies.push({

        archetype:
          "ANOMALY_WORKFLOW",

        severity:
          "high",

        priority: 75,

        columns: [
          profile.cleanName,
        ],

        reasoning:
          "Moderate anomaly concentration detected.",
      });
    }
  }

  // ============================================================
  // TEMPORAL DETECTION
  // ============================================================

  for (const profile of profiles) {

    const volatility =
      profile.rollingVolatility?.[0] || 0;

    const drift =
      profile.temporalDrift;

    if (
      drift ||
      volatility > 15
    ) {

      strategies.push({

        archetype:
          "TEMPORAL_WORKFLOW",

        severity:
          volatility > 25
            ? "critical"
            : "high",

        priority:
          volatility > 25
            ? 90
            : 70,

        columns: [
          profile.cleanName,
        ],

        reasoning:
          "Directional trend and volatility changes detected over time.",
      });
    }
  }

  // ============================================================
  // CORRELATION DETECTION
  // ============================================================

  for (
    const relation
    of causalRelations
  ) {

    const strength =
      Math.abs(
        relation.pearsonR
      );

    if (strength > 0.85) {

      strategies.push({

        archetype:
          "CORRELATION_WORKFLOW",

        severity:
          "high",

        priority:
          88,

        columns: [
          relation.source,
          relation.target,
        ],

        reasoning:
          "Strong statistical relationship detected between variables.",
      });

      continue;
    }

    if (strength > 0.65) {

      strategies.push({

        archetype:
          "CORRELATION_WORKFLOW",

        severity:
          "medium",

        priority:
          60,

        columns: [
          relation.source,
          relation.target,
        ],

        reasoning:
          "Moderate correlation pattern detected.",
      });
    }
  }

  // ============================================================
  // FALLBACK STRATEGY
  // ============================================================

  if (
    strategies.length === 0 &&
    profiles.length > 0
  ) {

    strategies.push({

      archetype:
        "OPERATIONAL_WORKFLOW",

      severity:
        "low",

      priority:
        40,

      columns: [
        profiles[0].cleanName,
      ],

      reasoning:
        "Dataset appears statistically stable.",
    });
  }

  // ============================================================
  // SORT BY PRIORITY
  // ============================================================

  return strategies.sort(
    (a, b) =>
      b.priority - a.priority
  );
}