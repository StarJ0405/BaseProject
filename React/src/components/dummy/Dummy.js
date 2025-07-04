function Dummy({ width, height, event }) {
  return (
    <div
      style={{
        width: width,
        height: height,
        // backgroundColor: "var(--user-bg-color)"
        pointerEvents: event ? "none" : null,
      }}
    ></div>
  );
}

export default Dummy;
