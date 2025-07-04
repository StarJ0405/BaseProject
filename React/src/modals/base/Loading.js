import ReactLoading from "react-loading";

function Loading(props) {
  const { isLoading } = props;

  return (
    <>
      {
        isLoading && (
          <div
            style={{
              width: "100px",
              height: "100px",
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 20000,
            }}
          >
            <ReactLoading type={"spin"} color="var(--admin-main-color2)" />
          </div>
        )
      }
    </>
  );
}

export default Loading;
