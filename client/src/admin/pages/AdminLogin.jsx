import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import PwaManualInstallNote from "../../components/PwaManualInstallNote.jsx";
import { ShieldCheck, Utensils } from "../../customer/components/icons.jsx";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { isAuthenticated, login, logout, user } = useAuth();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
        <div className="admin-login-brand">
          <span><Utensils size={24} /></span>
          <div>
            <small>Restaurant Owner</small>
            <h1>Admin Login</h1>
          </div>
        </div>
        <p>Manage orders, menus, delivery, bookings, and payments from one secure workspace.</p>
        {error && <div className="admin-alert error">{error}</div>}
        <label>Phone or email<input required value={form.identifier} onChange={(event) => updateField("identifier", event.target.value)} /></label>
        <label>Password
          <span className="admin-password-field">
            <input required type={showPassword ? "text" : "password"} value={form.password} onChange={(event) => updateField("password", event.target.value)} />
            <button type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? "Hide" : "Show"}</button>
          </span>
        </label>
        <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Signing in..." : "Login to Dashboard"}</button>
        <small className="admin-login-note"><ShieldCheck size={14} /> Secure role-based admin access</small>
        <PwaManualInstallNote />
      </form>
    </main>
  );
}
