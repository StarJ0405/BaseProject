import { adminRequester } from "App";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import useLanguageNavigate from "shared/hooks/useNavigate";
function RequireAdminAuth({ allowedRoles = [], to = "/" }) {
  const [user, setUser] = useState();
  const [isLoading, setLoading] = useState(true);
  const navigate = useLanguageNavigate();
  useEffect(() => {
    adminRequester.getCurrentUser(({ user }) => {
      setUser(user);
      setLoading(false);
    });
  }, []);
  allowedRoles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  if (!isLoading) {
    if (user) {
      if (allowedRoles.includes(user?.role)) {
        return <Outlet context={{ role: user.role, user }}/>;
      }
    }
    navigate(`/${to}`);
  } else {
    return <></>;
  }
}

export default RequireAdminAuth;
