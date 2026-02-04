import { GroupsList } from "@/components/groups/groups-list";
import { getPublicGroups } from "@/lib/db/queries";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-dynamic";

type PublicGroup = {
	id: string;
	name: string;
	slug: string;
};

/** Página principal con listado de grupos públicos. */
export default async function HomePage() {
	const groups = (await getPublicGroups()) as PublicGroup[];

	return (
		<main className="min-h-screen bg-background px-4 py-10 sm:px-6">
			<div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
				<header className="space-y-3">
					<h1 className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
						Reto LoL — Grupos Públicos
					</h1>
					<p className="text-base text-muted-foreground sm:text-lg">
						Explora los grupos abiertos y compite en el ranking de League of
						Legends
					</p>
					<Separator className="!mt-6" />
				</header>

				<GroupsList
					groups={groups.map((group) => ({
						id: group.id,
						name: group.name,
						slug: group.slug,
					}))}
				/>
			</div>
		</main>
	);
}

