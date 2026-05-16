import type {
  LogEntry,
  LogLevel,
} from "../types";

export function emit(
  entry: LogEntry
) {

  const icons: Record<
    LogLevel,
    string
  > = {
    info: "🔵",
    warn: "🟡",
    error: "🔴",
    success: "🟢",
  };

  const label =
    `${icons[entry.level]} [MorphUI:${entry.stage}]`;

  if (entry.data !== undefined) {

    console.groupCollapsed(
      `${label} ${entry.message}`
    );

    console.log(entry.data);

    console.groupEnd();

  } else {

    console.log(
      `${label} ${entry.message}`
    );
  }
}