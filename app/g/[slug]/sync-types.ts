/** Estado retornado por publicSyncGroupAction para useActionState. */
export type SyncActionState = {
  status: "idle" | "success" | "cooldown" | "error";
  syncedAt: string | null;
};

/** Estado inicial para useActionState. */
export const initialSyncActionState: SyncActionState = {
  status: "idle",
  syncedAt: null,
};
