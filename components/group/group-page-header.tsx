import { PublicSyncButton } from "@/app/g/[slug]/public-sync-button";

type GroupPageHeaderProps = {
  groupId: string;
  groupName: string;
  lastManualSyncAt: string | null;
  cooldownMinutes: number;
  onPublicSync: (formData: FormData) => void | Promise<void>;
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
      <form action={onPublicSync} className="flex items-center">
        <input type="hidden" name="groupId" value={groupId} />
        <PublicSyncButton
          lastManualSyncAt={lastManualSyncAt}
          cooldownMinutes={cooldownMinutes}
        />
      </form>
    </div>
  );
}
