import NiceModal from "@ebay/nice-modal-react";
import { useCookies } from "react-cookie";
import { Outlet } from "react-router-dom";
import { Cookies, getTokenPayload } from "shared/utils/Utils";

function RequireAuth(props) {
  const [cookies] = useCookies([Cookies.JWT]);
  const { [Cookies.JWT]: medusaJwt } = cookies;

  if (medusaJwt) {
    let tokenPayload = getTokenPayload(medusaJwt);

    if (tokenPayload) {
      // let roles = getRoleFromTokenPayload(tokenPayload);
      let roles = "customer";

      // 로그인한 정보(ex.role)로 valid 해서 루트 페이지로 돌려보내는 방법
      // let isValid = allowedRoles.filter((allowedRole) => roles.indexOf(allowedRole) >= 0).length > 0;
      let isValid = true;
      if (isValid) {
        return <Outlet />;
      } else {
        NiceModal.show("memberSignIn");
        return null;
      }
    } else {
      NiceModal.show("memberSignIn");
      return null;
    }
  } else {
    NiceModal.show("memberSignIn");
    return null;
  }
}

export default RequireAuth;
