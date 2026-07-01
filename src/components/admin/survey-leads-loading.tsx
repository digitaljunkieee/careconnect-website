export function SurveyLeadsLoading() {
  return (
    <div className="space-y-6" aria-label="Loading survey leads">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => <div key={item} className="h-28 animate-pulse rounded-3xl bg-muted" />)}
      </div>
      <div className="space-y-5 rounded-3xl border border-border/70 p-6">
        <div className="h-8 w-64 animate-pulse rounded-xl bg-muted" />
        <div className="h-12 animate-pulse rounded-2xl bg-muted" />
        {[1, 2, 3, 4, 5].map((item) => <div key={item} className="h-16 animate-pulse rounded-2xl bg-muted/80" />)}
      </div>
    </div>
  );
}
