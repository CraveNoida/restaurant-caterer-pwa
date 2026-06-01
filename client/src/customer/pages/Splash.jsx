import { Link } from "react-router-dom";
import logoImage from "../../assets/images/logo-site.png";

export default function Splash() {
  return (
    <section className="splash-screen app-card">
      <img src={logoImage} alt="Ahmad Caterers" />
      <div>
        <span>Restaurant and catering</span>
        <h1>Ahmad Caterers</h1>
        <p>Fresh food orders, catering bookings, and event menus in one place.</p>
      </div>
      <Link className="app-button full-width" to="/">Continue</Link>
    </section>
  );
}
