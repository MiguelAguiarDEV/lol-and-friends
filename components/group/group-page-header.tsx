import { PublicSyncButton } from "@/app/g/[slug]/public-sync-button";
import type { SyncActionState } from "@/app/g/[slug]/sync-types";

type GroupPageHeaderProps = {
  groupId: string;
  groupName: string;
  lastManualSyncAt: string | null;
  cooldownMinutes: number;
  onPublicSync: (
    previousState: SyncActionState,
    formData: FormData,
  ) => Promise<SyncActionState>;
};

export function GroupPageHeader({
  groupId,
  groupName,
  lastManualSyncAt,
  cooldownMinutes,
  onPublicSync,
}: GroupPageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
          {groupName}
        </h1>
      </div>
      <PublicSyncButton
        groupId={groupId}
        lastManualSyncAt={lastManualSyncAt}
        cooldownMinutes={cooldownMinutes}
        onSync={onPublicSync}
      />
    </div>
  );
}
