export default async function ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      style={{
        width: "100dvw",
        height: "100dvh",
      }}
    >
      {children}
    </div>
  );
}
