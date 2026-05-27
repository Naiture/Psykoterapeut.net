export function Background() {
  return (
    <>
      <div
        aria-hidden
        className="fixed inset-0 -z-20 bg-cover bg-center"
        style={{
          backgroundImage: "url('/bg/waterfall.jpg')",
          filter: "brightness(0.95) saturate(1.05)",
        }}
      />
      <div
        aria-hidden
        className="fixed inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.22) 100%)",
        }}
      />
    </>
  );
}
