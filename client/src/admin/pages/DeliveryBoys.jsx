import { useEffect, useState } from "react";
import { adminService } from "../../services/adminService.js";
import { AdminPageState } from "./adminUtils.jsx";
import ConfirmationModal from "../components/ConfirmationModal.jsx";
import AdminToast from "../components/AdminToast.jsx";

const emptyForm = { name: "", phone: "", email: "", password: "", isActive: true, vehicleNumber: "" };

export default function DeliveryBoys() {
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [toast, setToast] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    adminService.deliveryBoys()
      .then((data) => setDeliveryBoys(data.deliveryBoys || []))
      .catch((err) => setError(err.message || "Unable to load delivery boys."))
      .finally(() => setLoading(false));
  }, []);

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const edit = (boy) => {
    setEditingId(boy._id);
    setForm({
      name: boy.name || boy.user?.name || "",
      phone: boy.phone || boy.user?.phone || "",
      email: boy.user?.email || "",
      password: "",
      isActive: boy.isAvailable,
      vehicleNumber: boy.vehicleNumber || ""
    });
  };

  const save = async (event) => {
    event.preventDefault();
    setFormError("");
    setToast(null);

    const payload = {
      ...form,
      name: form.name.trim(),
      phone: form.phone.replace(/\D/g, "").slice(-10),
      email: form.email.trim(),
      vehicleNumber: form.vehicleNumber.trim()
    };

    if (!/^[6-9]\d{9}$/.test(payload.phone)) {
      setFormError("Enter a valid 10 digit mobile number.");
      return;
    }

    if (!editingId && payload.password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }

    if (editingId && !payload.password) delete payload.password;
    if (!payload.email) delete payload.email;

    try {
      setIsSaving(true);
      const data = editingId ? await adminService.updateDeliveryBoy(editingId, payload) : await adminService.createDeliveryBoy(payload);
      setDeliveryBoys((current) => editingId ? current.map((boy) => boy._id === editingId ? data.deliveryBoy : boy) : [data.deliveryBoy, ...current]);
      setForm(emptyForm);
      setEditingId("");
      setToast({ message: editingId ? "Delivery boy updated." : "Delivery boy added." });
    } catch (error) {
      const message = error.message || (editingId ? "Could not update delivery boy." : "Could not add delivery boy.");
      setFormError(message);
      setToast({ type: "error", message });
    } finally {
      setIsSaving(false);
    }
  };

  const deactivate = async () => {
    if (!pendingDelete) return;
    try {
      const data = await adminService.deleteDeliveryBoy(pendingDelete._id);
      setDeliveryBoys((current) => current.map((boy) => boy._id === pendingDelete._id ? data.deliveryBoy : boy));
      setToast({ message: "Delivery boy deactivated." });
    } catch (error) {
      setToast({ type: "error", message: error.message || "Could not deactivate delivery boy." });
    } finally {
      setPendingDelete(null);
    }
  };

  const state = <AdminPageState loading={loading} error={error} empty={!deliveryBoys.length} emptyText="No delivery boys yet." />;
  if (loading || error) return state;

  return (
    <section className="admin-page">
      <AdminToast toast={toast} onClose={() => setToast(null)} />
      <div className="admin-page-head"><div><h1>Delivery Boys</h1><p>Prepare staff accounts for the delivery phase.</p></div></div>
      <form className="admin-card admin-form-grid" onSubmit={save}>
        {formError && <div className="admin-inline-error">{formError}</div>}
        <input required placeholder="Name" value={form.name} onChange={(event) => updateField("name", event.target.value)} />
        <input required placeholder="Phone" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} />
        <input placeholder="Email" value={form.email} onChange={(event) => updateField("email", event.target.value)} />
        <input required={!editingId} placeholder={editingId ? "New password optional" : "Password"} type="password" value={form.password} onChange={(event) => updateField("password", event.target.value)} />
        <input placeholder="Vehicle number" value={form.vehicleNumber} onChange={(event) => updateField("vehicleNumber", event.target.value)} />
        <label className="admin-check"><input type="checkbox" checked={form.isActive} onChange={(event) => updateField("isActive", event.target.checked)} /> Active</label>
        <button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : editingId ? "Update Delivery Boy" : "Add Delivery Boy"}</button>
      </form>
      {!deliveryBoys.length ? state : <div className="admin-table-wrap"><table><thead><tr><th>Name</th><th>Phone</th><th>Email</th><th>Status</th><th>Assigned</th><th>Actions</th></tr></thead><tbody>{deliveryBoys.map((boy) => <tr key={boy._id}><td>{boy.name || boy.user?.name}</td><td>{boy.phone || boy.user?.phone}</td><td>{boy.user?.email || "N/A"}</td><td>{boy.isAvailable ? "Active" : "Inactive"}</td><td>{boy.currentOrder ? "Assigned" : "None"}</td><td className="admin-row-actions"><button type="button" onClick={() => edit(boy)}>Edit</button><button type="button" onClick={() => setPendingDelete(boy)}>Deactivate</button><button type="button" disabled>Assigned orders</button></td></tr>)}</tbody></table></div>}
      <ConfirmationModal
        actionLabel="Deactivate"
        body={`Deactivate ${pendingDelete?.name || pendingDelete?.user?.name || "this delivery boy"}? They will no longer be able to access delivery work.`}
        isOpen={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={deactivate}
        title="Deactivate delivery boy"
      />
    </section>
  );
}
