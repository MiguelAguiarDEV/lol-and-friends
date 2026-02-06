import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { PageShell } from "@/components/layout/page-shell";
import { SectionCard } from "@/components/layout/section-card";

export default async function ProfilePage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? "Sin email";

  return (
    <PageShell maxWidth="5xl">
      <PageHeader title="Perfil" description="Resumen de tu cuenta." />
      <SectionCard>
        <p className="text-base text-card-foreground">{email}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Gestiona tus grupos desde el panel admin.
        </p>
      </SectionCard>
    </PageShell>
  );
}
