export function normalizeSessionDepthLimit(sessionLimit: number): number {
  return Number.isFinite(sessionLimit) && sessionLimit > 0 ? Math.floor(sessionLimit) : 1;
}

export function shouldBlockDeepening(params: {
  isDeepening: boolean;
  historyLength: number;
  sessionLimit: number;
}): boolean {
  const maxDepth = normalizeSessionDepthLimit(params.sessionLimit);
  return params.isDeepening && params.historyLength >= maxDepth;
}

export function canDeepenAfterNextConsult(params: {
  historyLength: number;
  sessionLimit: number;
}): boolean {
  const maxDepth = normalizeSessionDepthLimit(params.sessionLimit);
  const nextPosition = params.historyLength + 1;
  return nextPosition < maxDepth;
}
