type PageHeaderProps = {
  title: string;
  description: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="space-y-2">
      <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
        {title}
      </h1>
      <p className="text-sm text-muted-foreground sm:text-base">
        {description}
      </p>
    </header>
  );
}
