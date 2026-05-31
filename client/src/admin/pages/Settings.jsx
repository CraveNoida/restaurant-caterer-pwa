import { useState } from "react";
import AdminToast from "../components/AdminToast.jsx";
import { PageHeader } from "../components/AdminUI.jsx";

const storageKey = "ahmad_admin_settings";
const defaultSettings = {
  restaurantName: "Ahmad Caterers",
  phone: "+91 8788611511",
  whatsapp: "+91 8788611511",
  address: "Margao, Goa",
  openingHours: "10:00 AM - 10:00 PM",
  deliveryCharge: "45",
  packingCharge: "20"
};

function readSettings() {
  try {
    return { ...defaultSettings, ...JSON.parse(localStorage.getItem(storageKey) || "{}") };
  } catch (error) {
    return defaultSettings;
  }
}

export default function Settings() {
  const [settings, setSettings] = useState(readSettings);
  const [toast, setToast] = useState(null);
  const updateField = (field, value) => setSettings((current) => ({ ...current, [field]: value }));
  const saveSettings = (event) => {
    event.preventDefault();
    localStorage.setItem(storageKey, JSON.stringify(settings));
    setToast({ message: "Settings saved locally." });
  };

  return (
    <section className="admin-page">
      <AdminToast toast={toast} onClose={() => setToast(null)} />
      <PageHeader title="Settings" subtitle="Product-style settings for restaurant profile, contact info, charges, delivery, and admin preferences." eyebrow="Workspace settings" />
      <form className="admin-card admin-form-grid" onSubmit={saveSettings}>
        <div className="admin-form-section">
          <h3>Restaurant Profile</h3>
          <input value={settings.restaurantName} onChange={(event) => updateField("restaurantName", event.target.value)} placeholder="Restaurant name" />
          <input value={settings.address} onChange={(event) => updateField("address", event.target.value)} placeholder="Address" />
        </div>
        <div className="admin-form-section">
          <h3>Contact Info</h3>
          <input value={settings.phone} onChange={(event) => updateField("phone", event.target.value)} placeholder="Phone" />
          <input value={settings.whatsapp} onChange={(event) => updateField("whatsapp", event.target.value)} placeholder="WhatsApp number" />
        </div>
        <div className="admin-form-section">
          <h3>Business Hours</h3>
          <input value={settings.openingHours} onChange={(event) => updateField("openingHours", event.target.value)} placeholder="Opening hours" />
        </div>
        <div className="admin-form-section">
          <h3>Delivery Settings & Charges</h3>
          <input value={settings.deliveryCharge} onChange={(event) => updateField("deliveryCharge", event.target.value)} placeholder="Delivery charge" />
          <input value={settings.packingCharge} onChange={(event) => updateField("packingCharge", event.target.value)} placeholder="Packing charge" />
        </div>
        <div className="admin-form-section">
          <h3>PWA/Admin Preferences</h3>
          <p>Preferences are ready for backend-backed settings when available.</p>
        </div>
        <button type="submit">Save settings</button>
      </form>
    </section>
  );
}
