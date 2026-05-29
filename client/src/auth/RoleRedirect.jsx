import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const roleHome = {
  admin: "/admin",
  delivery: "/delivery",
  customer: "/"
};

export default function RoleRedirect() {
  const { user } = useAuth();
  return <Navigate to={roleHome[user?.role] || "/"} replace />;
}
