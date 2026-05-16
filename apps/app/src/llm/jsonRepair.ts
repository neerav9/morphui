import type {
  LogEntry,
} from "../types/index";

import { emit } from "../utils/logger";// ============================================================
// JSON EXTRACTION + REPAIR
// ============================================================

export function extractAndRepairJSON(
  rawText: string
): string | null {
  emit({
    stage: "JSON_EXTRACT",
    level: "info",
    message: "Starting JSON extraction",
    data: rawText.slice(0, 200),
  });

  // ============================================================
  // REMOVE MARKDOWN CODE BLOCKS
  // ============================================================

  const cleanedText = rawText
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  // ============================================================
  // DIRECT PARSE
  // ============================================================

  try {
    JSON.parse(cleanedText);

    emit({
      stage: "JSON_EXTRACT",
      level: "success",
      message: "Direct JSON parse succeeded",
    });

    return cleanedText;
  } catch {}

  // ============================================================
  // EXTRACT JSON OBJECT REGION
  // ============================================================

  const startIndex =
    cleanedText.indexOf("{");

  const endIndex =
    cleanedText.lastIndexOf("}");

  if (
    startIndex === -1 ||
    endIndex === -1
  ) {
    emit({
      stage: "JSON_EXTRACT",
      level: "error",
      message: "No JSON object detected",
    });

    return null;
  }

  const candidate = cleanedText.substring(
    startIndex,
    endIndex + 1
  );

  // ============================================================
  // TRY SUBSTRING PARSE
  // ============================================================

  try {
    JSON.parse(candidate);

    emit({
      stage: "JSON_EXTRACT",
      level: "success",
      message:
        "Substring extraction succeeded",
    });

    return candidate;
  } catch {}

  // ============================================================
  // BRACKET REPAIR
  // ============================================================

  const repaired =
    repairTruncatedJSON(candidate);

  if (repaired) {
    try {
      JSON.parse(repaired);

      emit({
        stage: "JSON_EXTRACT",
        level: "success",
        message:
          "Bracket repair succeeded",
      });

      return repaired;
    } catch {}
  }

  // ============================================================
  // SANITIZATION REPAIR
  // ============================================================

  const sanitized = candidate
    .replace(
      /[\x00-\x1F\x7F]/g,
      " "
    )
    .replace(
      /\\(?!["\\/bfnrtu])/g,
      "\\\\"
    )
    .replace(
      /,\s*([}\]])/g,
      "$1"
    )
    .replace(
      /([{,]\s*)(\w+)\s*:/g,
      '$1"$2":'
    );

  try {
    JSON.parse(sanitized);

    emit({
      stage: "JSON_EXTRACT",
      level: "success",
      message:
        "Sanitization repair succeeded",
    });

    return sanitized;
  } catch (error) {
    emit({
      stage: "JSON_EXTRACT",
      level: "error",
      message:
        "All JSON repair strategies failed",
      data: error,
    });

    return null;
  }
}

// ============================================================
// TRUNCATED JSON REPAIR
// ============================================================

export function repairTruncatedJSON(
  text: string
): string | null {
  const stack: string[] = [];

  let inString = false;
  let escape = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (escape) {
      escape = false;
      continue;
    }

    if (ch === "\\" && inString) {
      escape = true;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (ch === "{" || ch === "[") {
      stack.push(ch);
    }

    else if (ch === "}" || ch === "]") {
      if (stack.length === 0) {
        return null;
      }

      stack.pop();
    }
  }

  // Already balanced
  if (stack.length === 0) {
    return null;
  }

  let closing = inString ? '"' : "";

  for (
    let i = stack.length - 1;
    i >= 0;
    i--
  ) {
    closing +=
      stack[i] === "{"
        ? "}"
        : "]";
  }

  return text + closing;
}