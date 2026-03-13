export function PageBackground() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle, oklch(0.75 0.01 242) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="absolute -top-48 right-0 h-[700px] w-[700px] rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute bottom-0 -left-48 h-[500px] w-[500px] rounded-full bg-primary/6 blur-[100px]" />
    </div>
  );
}
