function Dummy({
  width,
  height,
  event,
}: {
  width?: number | string;
  height?: number | string;
  event?: boolean;
}) {
  return (
    <div
      style={{
        width: width,
        height: height,
        pointerEvents: event ? "none" : undefined,
      }}
    ></div>
  );
}

export default Dummy;
