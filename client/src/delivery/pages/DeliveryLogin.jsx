import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function DeliveryLogin() {
  const navigate = useNavigate();
  const { isAuthenticated, login, logout, user } = useAuth();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        <span>Delivery Partner</span>
        <h1>Delivery Login</h1>
        {error && <div className="delivery-alert error">{error}</div>}
        <label>Phone or email<input required value={form.identifier} onChange={(event) => setForm((current) => ({ ...current, identifier: event.target.value }))} /></label>
        <label>Password<input required type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} /></label>
        <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Signing in..." : "Login"}</button>
      </form>
    </main>
  );
}
