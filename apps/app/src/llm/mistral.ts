import type {
  ColumnProfile,
  CausalRelation,
  InteractionMemory,
  PromptLevel,
  ModelTier,
  LLMAttemptResult,
  LLMFailureReason,
  GlobalDashboard,
} from "../types";

import { emit } from "../utils/logger";

import {
  extractAndRepairJSON,
} from "./jsonRepair";

import {
  validateAndNormalize,
} from "../dashboard/validator";

import {
  buildPrompt,
} from "./prompts";

import {
  getModelTier,
} from "./modelTier";

import {
  LLM_CONFIG,
} from "./config";

// ============================================================
// SINGLE STREAMING ATTEMPT
// ============================================================

export default async function singleLLMAttempt(
  prompt: string,
  model: string,
  timeoutMs: number,
  onProgress?: (tokens: number) => void
): Promise<LLMAttemptResult> {

  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();

    emit({
      stage: "LLM_CALL",
      level: "warn",
      message:
        `Timeout after ${timeoutMs / 1000}s`,
    });

  }, timeoutMs);

  try {

    const response = await fetch(
      LLM_CONFIG.endpoint,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          model,
          prompt,
          stream: true,
        }),

        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    // ============================================================
    // API FAILURE
    // ============================================================

    if (!response.ok) {

      emit({
        stage: "LLM_CALL",
        level: "error",
        message:
          `HTTP ${response.status} — Ollama unavailable`,
      });

      return {
        success: false,
        failureReason:
          "api_unreachable",
      };
    }

    const reader =
      response.body?.getReader();

    if (!reader) {
      return {
        success: false,
        failureReason: "unknown",
      };
    }

    // ============================================================
    // STREAM READING
    // ============================================================

    const decoder =
      new TextDecoder();

    let rawResponse = "";
    let tokenCount = 0;

    while (true) {

      const {
        done,
        value,
      } = await reader.read();

      if (done) break;

      const chunk =
        decoder.decode(value, {
          stream: true,
        });

      for (const line of chunk.split("\n")) {

        if (!line.trim()) continue;

        try {

          const parsed =
            JSON.parse(line);

          if (parsed.response) {

            rawResponse +=
              parsed.response;

            tokenCount++;

            onProgress?.(
              tokenCount
            );
          }

          if (parsed.done) {
            break;
          }

        } catch {}
      }
    }

    emit({
      stage: "LLM_CALL",
      level: "success",
      message:
        `Streaming complete — ${tokenCount} tokens`,
      data:
        rawResponse.slice(0, 400),
    });

    // ============================================================
    // JSON EXTRACTION
    // ============================================================

    const extracted =
      extractAndRepairJSON(
        rawResponse
      );

    if (!extracted) {

      return {
        success: false,
        failureReason:
          "malformed_json",

        rawResponse,
      };
    }

    // ============================================================
    // VALIDATION
    // ============================================================

    const dashboard =
      validateAndNormalize(
        extracted
      );

    if (!dashboard) {

      return {
        success: false,
        failureReason:
          "schema_validation_failed",

        rawResponse,
      };
    }

    if (
      dashboard.workflows.length === 0
    ) {

      return {
        success: false,
        failureReason:
          "empty_workflows",

        rawResponse,
      };
    }

    // ============================================================
    // SUCCESS
    // ============================================================

    return {
      success: true,
      dashboard,
    };

  } catch (error: unknown) {

    clearTimeout(timeoutId);

    const isAbort =
      error instanceof Error &&
      error.name === "AbortError";

    const isNetwork =
      error instanceof TypeError &&
      error.message.includes(
        "fetch"
      );

    emit({
      stage: "LLM_CALL",
      level: "error",

      message: isAbort
        ? `Request aborted after ${timeoutMs / 1000}s`
        : isNetwork
        ? "Ollama unreachable"
        : "Unknown LLM failure",

      data: error,
    });

    return {
      success: false,

      failureReason: isAbort
        ? "timeout"
        : "api_unreachable",
    };
  }
}

// ============================================================
// RETRY ORCHESTRATOR
// ============================================================

export async function generateAgenticDashboard(
  profiles: ColumnProfile[],
  causalChains: CausalRelation[],
  memory?: InteractionMemory,
  model: string =
    LLM_CONFIG.defaultModel,

  onProgress?: (
    attempt: number,
    tokens: number
  ) => void

): Promise<{
  dashboard: GlobalDashboard | null;
  source: "llm" | "fallback";
  reason?: LLMFailureReason;
}> {

  const modelTier =
    getModelTier(model);

  const levels: PromptLevel[] = [
    "full",
    "compressed",
    "minimal",
  ];

  const timeouts = [
    LLM_CONFIG.timeouts.full,
    LLM_CONFIG.timeouts.compressed,
    LLM_CONFIG.timeouts.minimal,
  ];

  let lastFailureReason:
    LLMFailureReason = "unknown";

  // ============================================================
  // RETRY LOOP
  // ============================================================

  for (
    let attempt = 0;
    attempt < 3;
    attempt++
  ) {

    const level = levels[attempt];

    emit({
      stage: "RETRY",
      level: "info",

      message:
        `Attempt ${attempt + 1}/3 — ${level}`,
    });

    const prompt = buildPrompt(
      profiles,
      causalChains,
      memory,
      level,
      modelTier
    );

    const result =
      await singleLLMAttempt(
        prompt,
        model,
        timeouts[attempt],

        (tokens) =>
          onProgress?.(
            attempt + 1,
            tokens
          )
      );

    // ============================================================
    // SUCCESS
    // ============================================================

    if (
      result.success &&
      result.dashboard
    ) {

      emit({
        stage: "RETRY",
        level: "success",

        message:
          `Succeeded on attempt ${attempt + 1}`,
      });

      return {
        dashboard:
          result.dashboard,

        source: "llm",
      };
    }

    lastFailureReason =
      result.failureReason ??
      "unknown";

    // ============================================================
    // HARD FAILURE
    // ============================================================

    if (
      lastFailureReason ===
      "api_unreachable"
    ) {

      emit({
        stage: "RETRY",
        level: "warn",

        message:
          "Ollama unreachable — skipping retries",
      });

      break;
    }

    emit({
      stage: "RETRY",
      level: "warn",

      message:
        `Attempt ${attempt + 1} failed: ${lastFailureReason}`,
    });
  }

  // ============================================================
  // FALLBACK
  // ============================================================

  emit({
    stage: "FALLBACK",
    level: "warn",

    message:
      `Fallback activated — ${lastFailureReason}`,
  });

  return {
    dashboard: null,
    source: "fallback",
    reason: lastFailureReason,
  };
}