type PlaceholderViewProps = {
  title: string;
  description: string;
};

export function PlaceholderView({ title, description }: PlaceholderViewProps) {
  return (
    <div className="dashboard-enter flex flex-1 flex-col gap-1 p-4">
      <h2 className="text-[13px] font-medium">{title}</h2>
      <p className="max-w-lg text-[13px] text-muted-foreground">{description}</p>
      <div className="mt-6 flex flex-1 items-center justify-center rounded-sm border border-dashed border-border bg-muted/10">
        <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
          Route scaffold — ships with issue
        </span>
      </div>
    </div>
  );
}
