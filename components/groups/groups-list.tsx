import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type GroupListItem = {
  id: string;
  name: string;
  slug: string;
};

export function GroupsList(props: { groups: GroupListItem[] }) {
  if (props.groups.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Aún no hay grupos públicos. Crea uno desde /admin.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {props.groups.map((group) => (
        <Link key={group.id} href={`/g/${group.slug}`}>
          <Card className="transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="mb-2">
                  Público
                </Badge>
              </div>
              <CardTitle className="text-xl">{group.name}</CardTitle>
              <CardDescription className="font-mono text-xs">
                /{group.slug}
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  );
}
