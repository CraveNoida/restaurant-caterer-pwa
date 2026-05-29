import { useState } from "react";
import AdminToast from "../components/AdminToast.jsx";

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
      <div className="admin-page-head">
        <div>
          <h1>Settings</h1>
          <p>Restaurant settings placeholder saved locally until backend settings are ready.</p>
        </div>
      </div>
      <form className="admin-card admin-form-grid" onSubmit={saveSettings}>
        <input value={settings.restaurantName} onChange={(event) => updateField("restaurantName", event.target.value)} placeholder="Restaurant name" />
        <input value={settings.phone} onChange={(event) => updateField("phone", event.target.value)} placeholder="Phone" />
        <input value={settings.whatsapp} onChange={(event) => updateField("whatsapp", event.target.value)} placeholder="WhatsApp number" />
        <input value={settings.address} onChange={(event) => updateField("address", event.target.value)} placeholder="Address" />
        <input value={settings.openingHours} onChange={(event) => updateField("openingHours", event.target.value)} placeholder="Opening hours" />
        <input value={settings.deliveryCharge} onChange={(event) => updateField("deliveryCharge", event.target.value)} placeholder="Delivery charge" />
        <input value={settings.packingCharge} onChange={(event) => updateField("packingCharge", event.target.value)} placeholder="Packing charge" />
        <button type="submit">Save settings</button>
      </form>
    </section>
  );
}
