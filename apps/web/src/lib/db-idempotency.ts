export function isDuplicateInsertErrorMessage(message: string | null | undefined): boolean {
  if (!message) return false;
  const lower = message.toLowerCase();
  return (
    lower.includes("duplicate") ||
    lower.includes("unique constraint") ||
    lower.includes("violates unique constraint")
  );
}
