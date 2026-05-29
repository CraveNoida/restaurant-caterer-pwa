import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const validateForm = () => {
    const nextErrors = {};
    const phoneDigits = form.phone.replace(/\D/g, "").slice(-10);

    if (!form.name.trim()) nextErrors.name = "Full name is required.";
    if (!/^[6-9]\d{9}$/.test(phoneDigits)) nextErrors.phone = "Enter a valid 10 digit Indian mobile number.";
    if (form.password.length < 6) nextErrors.password = "Password must be at least 6 characters.";
    if (form.confirmPassword !== form.password) nextErrors.confirmPassword = "Passwords do not match.";

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setError("");
    setIsSubmitting(true);

    try {
      await register({
        name: form.name.trim(),
        phone: form.phone.replace(/\D/g, "").slice(-10),
        email: form.email.trim(),
        password: form.password
      });
      navigate("/profile");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="app-screen auth-screen app-card form-card" onSubmit={handleSubmit}>
      <h1>Register</h1>
      {error && <div className="success-banner error-banner"><strong>{error}</strong></div>}
      <label>Full name<input required value={form.name} onChange={(event) => updateField("name", event.target.value)} />{fieldErrors.name && <small className="field-error">{fieldErrors.name}</small>}</label>
      <label>Phone number<input required inputMode="tel" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} />{fieldErrors.phone && <small className="field-error">{fieldErrors.phone}</small>}</label>
      <label>Email optional<input type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} /></label>
      <label>
        Password
        <span className="input-with-action">
          <input required type={showPassword ? "text" : "password"} minLength={6} value={form.password} onChange={(event) => updateField("password", event.target.value)} />
          <button type="button" onClick={() => setShowPassword((current) => !current)}>{showPassword ? "Hide" : "Show"}</button>
        </span>
        {fieldErrors.password && <small className="field-error">{fieldErrors.password}</small>}
      </label>
      <label>Confirm password<input required type={showPassword ? "text" : "password"} value={form.confirmPassword} onChange={(event) => updateField("confirmPassword", event.target.value)} />{fieldErrors.confirmPassword && <small className="field-error">{fieldErrors.confirmPassword}</small>}</label>
      <button className="app-button full-width" type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create account"}</button>
      <Link className="text-button" to="/">Continue as guest</Link>
      <p className="muted-text">Already registered? <Link to="/login">Login</Link></p>
    </form>
  );
}
