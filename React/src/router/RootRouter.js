import { Route, Routes } from "react-router-dom";
import RootLayout from "routes/RootLayout";
import MobileRouter from "./MobileRouter";
import PCRouter from "./PCRouter";

function RootRouter(props) {
  return (
    <Routes>
      <Route path="" element={<RootLayout />}>
        {
          location.host.startsWith('m.')
            ?
            <Route path="" element={<MobileRouter />} />
            : <Route path="" element={<PCRouter />} />
        }
      </Route>
    </Routes>
  );
}

export default RootRouter;
