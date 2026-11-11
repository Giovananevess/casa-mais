export default function AppLoading() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Carregando">
      <div className="bg-muted h-40 rounded-3xl" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="bg-muted h-28 rounded-3xl" />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="bg-muted h-80 rounded-3xl lg:col-span-2" />
        <div className="bg-muted h-80 rounded-3xl" />
      </div>
    </div>
  );
}
