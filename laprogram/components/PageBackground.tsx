export function PageBackground() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute -top-48 right-0 h-175 w-175 rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute bottom-0 -left-48 h-125 w-125 rounded-full bg-primary/6 blur-[100px]" />
    </div>
  );
}
