import { z } from "zod";

import type {
  Workflow,
  WorkflowArchetype,
  UINode,
  GlobalDashboard,
  AgenticState,
} from "../types";

import { emit } from "../utils/logger";

import {
  ZLLMPayload,
  ZWorkflow,
  ZAgenticState,
  ZHeroInsight,
} from "./schemas";

// ============================================================
// VALIDATION + NORMALIZATION
// ============================================================

export function validateAndNormalize(
  rawJSON: string
): GlobalDashboard | null {

  let parsed: unknown;

  try {

    parsed = JSON.parse(rawJSON);

  } catch (error) {

    emit({
      stage: "ZOD_VALIDATE",
      level: "error",
      message: "JSON.parse failed",
      data: error,
    });

    return null;
  }

  const payloadResult =
    ZLLMPayload.safeParse(parsed);

  // ============================================================
  // TOP-LEVEL FAILURE
  // ============================================================

  if (!payloadResult.success) {

    emit({
      stage: "ZOD_VALIDATE",
      level: "warn",

      message:
        "Top-level schema validation failed",

      data:
        payloadResult.error.flatten(),
    });

    return salvagePartialDashboard(
      parsed
    );
  }

  const {
    agenticState,
    dashboard,
  } = payloadResult.data;

  const validWorkflows: Workflow[] =
    [];

  const raw =
    dashboard.workflows as unknown[];

  // ============================================================
  // WORKFLOW VALIDATION
  // ============================================================

  for (
    let i = 0;
    i < raw.length;
    i++
  ) {

    const wfResult =
      ZWorkflow.safeParse(raw[i]);

    if (wfResult.success) {

      validWorkflows.push(
        normalizeWorkflow(
          wfResult.data
        )
      );

    } else {

      emit({
        stage: "ZOD_VALIDATE",
        level: "warn",

        message:
          `Workflow[${i}] invalid — discarded`,

        data:
          wfResult.error.flatten(),
      });
    }
  }

  // ============================================================
  // NO VALID WORKFLOWS
  // ============================================================

  if (validWorkflows.length === 0) {

    emit({
      stage: "ZOD_VALIDATE",
      level: "error",

      message:
        "No valid workflows survived validation",
    });

    return null;
  }

  emit({
    stage: "ZOD_VALIDATE",
    level: "success",

    message:
      `Validation passed: ${validWorkflows.length}/${raw.length} workflows preserved`,
  });

  return {
    agenticState:
      agenticState as AgenticState,

    globalSummary:
      dashboard.globalSummary,

    globalSeverity:
      dashboard.globalSeverity,

    dashboardLayoutMode:
      dashboard.dashboardLayoutMode,

    heroInsight:
      dashboard.heroInsight,

    workflows:
      validWorkflows,
  };
}

// ============================================================
// WORKFLOW NORMALIZATION
// ============================================================

export function normalizeWorkflow(
  wf: z.infer<typeof ZWorkflow>
): Workflow {

  return {

    title:
      wf.title ||
      "Operational Workflow",

    layoutMode:
      wf.layoutMode ||
      "dashboard",

    archetype:
      (
        wf.archetype ||
        "OPERATIONAL_WORKFLOW"
      ) as WorkflowArchetype,

    uiBlueprint:
      sanitizeUINode(
        wf.uiBlueprint
      ),

    primaryMetric:
      wf.primaryMetric || "—",

    secondaryMetric:
      wf.secondaryMetric || "—",

    severity:
      wf.severity || "medium",

    quickStats:
      wf.quickStats &&
      Object.keys(
        wf.quickStats
      ).length > 0
        ? wf.quickStats
        : {},

    tags:
      wf.tags?.length > 0
        ? wf.tags
        : ["Insights"],

    confidence:
      wf.confidence ?? 85,

    description:
      wf.description ||
      "Operational analysis.",

    reasoning:
      wf.reasoning ||
      "Statistical profiling applied.",

    businessContext:
      wf.businessContext ||
      "Monitoring within operational bounds.",

    chartData:
      wf.chartData?.length > 0
        ? wf.chartData
        : [],

    detectedColumns:
      wf.detectedColumns || [],
  };
}

// ============================================================
// UI TREE SANITIZATION
// ============================================================

export function sanitizeUINode(
  node: unknown,
  depth = 0
): UINode {

  const VALID_TYPES = new Set([
    "col",
    "row",
    "grid_2",

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

  if (
    !node ||
    typeof node !== "object"
  ) {
    return {
      type: "kpi_block",
    };
  }

  const n =
    node as Record<
      string,
      unknown
    >;

  const type = String(
    n.type || "kpi_block"
  );

  const safeType =
    VALID_TYPES.has(type)
      ? (type as UINode["type"])
      : "kpi_block";

  const sanitized: UINode = {
    type: safeType,

    ...(n.meta &&
    typeof n.meta === "object"
      ? {
          meta:
            n.meta as Record<
              string,
              unknown
            >,
        }
      : {}),
  };

  const isLayout = [
    "col",
    "row",
    "grid_2",
  ].includes(safeType);

  if (
    isLayout &&
    depth < 4 &&
    Array.isArray(n.children) &&
    n.children.length > 0
  ) {

    sanitized.children =
      (
        n.children as unknown[]
      )
        .slice(0, 8)
        .map((child) =>
          sanitizeUINode(
            child,
            depth + 1
          )
        );
  }

  return sanitized;
}

// ============================================================
// PARTIAL RECOVERY
// ============================================================

export function salvagePartialDashboard(
  parsed: unknown
): GlobalDashboard | null {

  emit({
    stage: "ZOD_VALIDATE",
    level: "warn",

    message:
      "Attempting partial dashboard recovery",
  });

  try {

    const obj =
      parsed as Record<
        string,
        unknown
      >;

    const rawDashboard =
      obj?.dashboard as
        | Record<
            string,
            unknown
          >
        | undefined;

    const rawWorkflows =
      (rawDashboard?.workflows as
        unknown[]) ||
      (obj?.workflows as
        unknown[]) ||
      [];

    const validWorkflows:
      Workflow[] = [];

    // ============================================================
    // RECOVER WORKFLOWS
    // ============================================================

    for (const wf of rawWorkflows) {

      const result =
        ZWorkflow.safeParse(
          wf
        );

      if (result.success) {

        validWorkflows.push(
          normalizeWorkflow(
            result.data
          )
        );
      }
    }

    if (
      validWorkflows.length === 0
    ) {
      return null;
    }

    // ============================================================
    // AGENTIC STATE
    // ============================================================

    const agenticResult =
      ZAgenticState.safeParse(
        obj?.agenticState ?? {}
      );

    const agenticState =
      agenticResult.success
        ? agenticResult.data
        : {
            situationalAwareness:
              "Partial synthesis recovered.",

            layoutStrategy:
              "Deterministic layout applied.",

            cognitiveDensity:
              "high" as const,

            selfCritique:
              "Some workflows recovered from partial response.",
          };

    // ============================================================
    // HERO INSIGHT
    // ============================================================

    const rawHero =
      rawDashboard?.heroInsight;

    const heroResult =
      ZHeroInsight.safeParse(
        rawHero
      );

    const heroInsight =
      heroResult.success
        ? heroResult.data
        : {
            headline:
              "Partial dashboard recovery",

            supportingStatement:
              "Recovered from partial LLM response.",

            primaryMetricValue:
              "Recovered",

            metricLabel:
              "Recovery Status",

            causalLink:
              "Fallback normalization applied.",

            affectedVectors:
              [],

            severity:
              "low" as const,
          };

    emit({
      stage: "ZOD_VALIDATE",
      level: "success",

      message:
        `Recovered ${validWorkflows.length} workflows from partial response`,
    });

    return {

      agenticState,

      globalSummary: String(
        rawDashboard?.globalSummary ??
          "Partial dashboard recovery active."
      ),

      globalSeverity:
        (
          [
            "critical",
            "elevated",
            "stable",
          ].includes(
            String(
              rawDashboard?.globalSeverity
            )
          )
            ? rawDashboard?.globalSeverity
            : "stable"
        ) as
          | "critical"
          | "elevated"
          | "stable",

      dashboardLayoutMode:
        "INTELLIGENCE_GRID",

      heroInsight,

      workflows:
        validWorkflows,
    };

  } catch {

    return null;
  }
}