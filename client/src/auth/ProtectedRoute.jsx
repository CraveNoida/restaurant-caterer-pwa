import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ allowedRoles = [] }) {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const loginPath = allowedRoles.includes("admin")
    ? "/admin/login"
    : allowedRoles.includes("delivery")
      ? "/delivery/login"
      : "/login";

  if (loading) {
    return <section><h2>Loading session...</h2></section>;
  }

  if (!isAuthenticated) {
    return <Navigate to={loginPath} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    if (allowedRoles.includes("admin")) {
      return (
        <main className="admin-login-page">
          <section className="admin-login-card">
            <h1>Access denied</h1>
            <p>This account does not have admin access.</p>
            <button type="button" onClick={logout}>Logout and use admin login</button>
          </section>
        </main>
      );
    }
    if (allowedRoles.includes("delivery")) {
      return (
        <main className="delivery-login-page">
          <section className="delivery-login-card">
            <h1>Access denied</h1>
            <p>This account does not have delivery access.</p>
            <button type="button" onClick={logout}>Logout and use delivery login</button>
          </section>
        </main>
      );
    }
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
