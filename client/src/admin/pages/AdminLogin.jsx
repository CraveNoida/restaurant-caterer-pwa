import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { isAuthenticated, login, logout, user } = useAuth();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated && user?.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      logout();
      const session = await login({ identifier: form.identifier.trim(), password: form.password });
      if (session.user?.role !== "admin") {
        logout();
        setError("This account does not have admin access.");
        return;
      }
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message || "Admin login failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="admin-login-page">
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <span>Restaurant Owner</span>
        <h1>Admin Login</h1>
        {error && <div className="admin-alert error">{error}</div>}
        <label>Phone or email<input required value={form.identifier} onChange={(event) => updateField("identifier", event.target.value)} /></label>
        <label>Password<input required type="password" value={form.password} onChange={(event) => updateField("password", event.target.value)} /></label>
        <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Signing in..." : "Login to Dashboard"}</button>
      </form>
    </main>
  );
}
