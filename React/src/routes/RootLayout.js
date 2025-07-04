import Container from "components/container/Container";
import { Outlet } from "react-router-dom";

function RootLayout() {
  return (
    <Container height="fit-content">
      <Outlet />
    </Container>
  );
}

export default RootLayout;
