import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login({ identifier: form.identifier.trim(), password: form.password });
      navigate(location.state?.from?.pathname || "/profile");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="app-screen auth-screen app-card form-card" onSubmit={handleSubmit}>
      <h1>Login</h1>
      {error && <div className="success-banner error-banner"><strong>{error}</strong></div>}
      <label>Email or phone<input required value={form.identifier} onChange={(event) => updateField("identifier", event.target.value)} /></label>
      <label>
        Password
        <span className="input-with-action">
          <input required type={showPassword ? "text" : "password"} value={form.password} onChange={(event) => updateField("password", event.target.value)} />
          <button type="button" onClick={() => setShowPassword((current) => !current)}>{showPassword ? "Hide" : "Show"}</button>
        </span>
      </label>
      <button className="app-button full-width" type="submit" disabled={isSubmitting}>{isSubmitting ? "Logging in..." : "Login"}</button>
      <button className="text-button" type="button" disabled>Forgot password</button>
      <Link className="text-button" to="/">Continue as guest</Link>
      <p className="muted-text">New customer? <Link to="/register">Create an account</Link></p>
    </form>
  );
}
