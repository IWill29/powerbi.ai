type PlaceholderViewProps = {
  title: string;
  description: string;
};

export function PlaceholderView({ title, description }: PlaceholderViewProps) {
  return (
    <div className="dashboard-enter flex flex-1 flex-col gap-2 p-3">
      <h2 className="text-[13px] font-medium tracking-tight">{title}</h2>
      <p className="max-w-md text-[12px] leading-relaxed text-muted-foreground">
        {description}
      </p>
      <div className="mt-3 flex flex-1 items-center justify-center rounded-sm border border-dashed border-border bg-card/50">
        <span className="font-mono text-[11px] text-muted-foreground">
          Route scaffold — ships with issue
        </span>
      </div>
    </div>
  );
}
