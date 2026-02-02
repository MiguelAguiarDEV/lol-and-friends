export const QUEUE_OPTIONS = [
  { value: "RANKED_SOLO_5x5", label: "Solo/Duo" },
  { value: "RANKED_FLEX_SR", label: "Flex 5v5" },
] as const;

export type RiotQueueType = (typeof QUEUE_OPTIONS)[number]["value"];

const queueLabelMap = new Map<RiotQueueType, string>(
  QUEUE_OPTIONS.map((option) => [option.value, option.label]),
);

/**
 * Devuelve el label legible de una cola.
 * @param queueType - Cola de ranked.
 * @returns Label para UI.
 */
export function getQueueLabel(queueType: string | null | undefined) {
  if (!queueType) {
    return "Solo/Duo";
  }
  return queueLabelMap.get(queueType as RiotQueueType) ?? "Solo/Duo";
}
