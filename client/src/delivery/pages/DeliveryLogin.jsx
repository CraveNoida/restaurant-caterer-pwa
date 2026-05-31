import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import PwaManualInstallNote from "../../components/PwaManualInstallNote.jsx";
import { ShieldCheck, Truck } from "../../customer/components/icons.jsx";

export default function DeliveryLogin() {
  const navigate = useNavigate();
  const { isAuthenticated, login, logout, user } = useAuth();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (isAuthenticated && user?.role === "delivery") {
    return <Navigate to="/delivery/dashboard" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      logout();
      const session = await login({ identifier: form.identifier.trim(), password: form.password });
      if (session.user?.role !== "delivery") {
        logout();
        setError("This account does not have delivery access.");
        return;
      }
      navigate("/delivery/dashboard");
    } catch (err) {
      setError(err.message || "Delivery login failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="delivery-login-page">
      <form className="delivery-login-card" onSubmit={handleSubmit}>
        <div className="delivery-login-brand">
          <span><Truck size={26} /></span>
          <div>
            <small>Delivery Partner</small>
            <h1>Delivery Login</h1>
          </div>
        </div>
        <p>Open assigned orders, navigation, and live tracking from your delivery app.</p>
        {error && <div className="delivery-alert error">{error}</div>}
        <label>Phone or email<input required value={form.identifier} onChange={(event) => setForm((current) => ({ ...current, identifier: event.target.value }))} /></label>
        <label>Password
          <span className="delivery-password-field">
            <input required type={showPassword ? "text" : "password"} value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} />
            <button type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? "Hide" : "Show"}</button>
          </span>
        </label>
        <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Signing in..." : "Login"}</button>
        <small className="delivery-login-note"><ShieldCheck size={14} /> Secure delivery partner access</small>
        <PwaManualInstallNote />
      </form>
    </main>
  );
}
