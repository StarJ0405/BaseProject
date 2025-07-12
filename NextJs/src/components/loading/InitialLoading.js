import LoadingSpinner2 from "./LoadingSpinner2";

export default function InitialLoading() {
  return (
    <div
      style={{
        height: "100dvh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <LoadingSpinner2 width={100} height={100} />
      <p
        style={{
          fontSize: "24px",
          color: "#bababa",
          paddingTop: "10px",
        }}
      >
        Loading..
      </p>
    </div>
  );
}
