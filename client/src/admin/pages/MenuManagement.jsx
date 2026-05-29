import { useEffect, useState } from "react";
import { adminMenuService } from "../../services/adminService.js";
import { AdminPageState, money } from "./adminUtils.jsx";
import ConfirmationModal from "../components/ConfirmationModal.jsx";
import AdminToast from "../components/AdminToast.jsx";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category: "Biryani",
  image: "",
  foodType: "nonveg",
  rating: "4.5",
  prepTime: "25 min",
  isAvailable: true,
  tags: "Best Seller",
  portions: "Half, Full",
  spiceLevels: "Mild, Medium, Spicy",
  addOns: "Extra Raita"
};

function payloadFromForm(form) {
  return {
    name: form.name,
    description: form.description,
    price: Number(form.price),
    category: form.category,
    image: form.image,
    foodType: form.foodType,
    rating: Number(form.rating || 0),
    prepTime: form.prepTime,
    isAvailable: Boolean(form.isAvailable),
    tags: form.tags.split(",").map((item) => item.trim()).filter(Boolean),
    customizationOptions: {
      portions: form.portions.split(",").map((name) => ({ name: name.trim(), price: 0 })).filter((item) => item.name),
      spiceLevels: form.spiceLevels.split(",").map((item) => item.trim()).filter(Boolean),
      addOns: form.addOns.split(",").map((name) => ({ name: name.trim(), price: 0 })).filter((item) => item.name)
    }
  };
}

export default function MenuManagement() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [toast, setToast] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadItems = () => {
    setLoading(true);
    adminMenuService.list()
      .then((data) => setItems(data.items || []))
      .catch((err) => setError(err.message || "Unable to load menu."))
      .finally(() => setLoading(false));
  };

  useEffect(loadItems, []);

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const editItem = (item) => {
    setEditingId(item._id);
    setForm({
      ...emptyForm,
      ...item,
      price: String(item.price || ""),
      rating: String(item.rating || ""),
      tags: (item.tags || []).join(", "),
      portions: (item.customizationOptions?.portions || []).map((entry) => entry.name || entry).join(", "),
      spiceLevels: (item.customizationOptions?.spiceLevels || []).join(", "),
      addOns: (item.customizationOptions?.addOns || []).map((entry) => entry.name || entry).join(", ")
    });
  };

  const saveItem = async (event) => {
    event.preventDefault();
    const payload = payloadFromForm(form);
    const data = editingId ? await adminMenuService.update(editingId, payload) : await adminMenuService.create(payload);
    setItems((current) => editingId ? current.map((item) => item._id === editingId ? data.item : item) : [data.item, ...current]);
    setEditingId("");
    setForm(emptyForm);
    setToast({ message: editingId ? "Menu item updated." : "Menu item added." });
  };

  const deleteItem = async () => {
    if (!pendingDelete) return;
    try {
      await adminMenuService.delete(pendingDelete._id);
      setItems((current) => current.filter((entry) => entry._id !== pendingDelete._id));
      setToast({ message: "Menu item deleted." });
    } catch (error) {
      setToast({ type: "error", message: error.message || "Could not delete menu item." });
    } finally {
      setPendingDelete(null);
    }
  };

  const toggleAvailable = async (item) => {
    const data = await adminMenuService.update(item._id, { isAvailable: !item.isAvailable });
    setItems((current) => current.map((entry) => entry._id === item._id ? data.item : entry));
  };

  const state = <AdminPageState loading={loading} error={error} empty={!items.length} emptyText="No menu items yet." />;
  if (loading || error) return state;

  return (
    <section className="admin-page">
      <AdminToast toast={toast} onClose={() => setToast(null)} />
      <div className="admin-page-head"><div><h1>Menu Items</h1><p>Add, edit, delete, and control availability.</p></div></div>
      <form className="admin-card admin-form-grid" onSubmit={saveItem}>
        <input required placeholder="Name" value={form.name} onChange={(event) => updateField("name", event.target.value)} />
        <input required placeholder="Price" inputMode="decimal" value={form.price} onChange={(event) => updateField("price", event.target.value)} />
        <input placeholder="Category" value={form.category} onChange={(event) => updateField("category", event.target.value)} />
        <select value={form.foodType} onChange={(event) => updateField("foodType", event.target.value)}><option value="veg">Veg</option><option value="nonveg">Non-Veg</option></select>
        <input placeholder="Image URL" value={form.image} onChange={(event) => updateField("image", event.target.value)} />
        <input placeholder="Prep time" value={form.prepTime} onChange={(event) => updateField("prepTime", event.target.value)} />
        <input placeholder="Rating" value={form.rating} onChange={(event) => updateField("rating", event.target.value)} />
        <input placeholder="Tags" value={form.tags} onChange={(event) => updateField("tags", event.target.value)} />
        <textarea placeholder="Description" value={form.description} onChange={(event) => updateField("description", event.target.value)} />
        <input placeholder="Portions" value={form.portions} onChange={(event) => updateField("portions", event.target.value)} />
        <input placeholder="Spice levels" value={form.spiceLevels} onChange={(event) => updateField("spiceLevels", event.target.value)} />
        <input placeholder="Add-ons" value={form.addOns} onChange={(event) => updateField("addOns", event.target.value)} />
        <label className="admin-check"><input type="checkbox" checked={form.isAvailable} onChange={(event) => updateField("isAvailable", event.target.checked)} /> Available</label>
        <button type="submit">{editingId ? "Update Item" : "Add Item"}</button>
      </form>
      {!items.length ? state : (
        <div className="admin-table-wrap">
          <table><thead><tr><th>Item</th><th>Category</th><th>Price</th><th>Tags</th><th>Available</th><th>Actions</th></tr></thead>
            <tbody>{items.map((item) => (
              <tr key={item._id}><td>{item.name}<br /><small>{item.description}</small></td><td>{item.category}</td><td>{money(item.price)}</td><td>{item.tags?.join(", ")}</td><td>{item.isAvailable ? "Yes" : "No"}</td><td className="admin-row-actions"><button type="button" onClick={() => editItem(item)}>Edit</button><button type="button" onClick={() => toggleAvailable(item)}>{item.isAvailable ? "Disable" : "Enable"}</button><button type="button" onClick={() => setPendingDelete(item)}>Delete</button></td></tr>
            ))}</tbody>
          </table>
        </div>
      )}
      <ConfirmationModal
        actionLabel="Delete item"
        body={`Delete ${pendingDelete?.name || "this menu item"}? This removes it from the customer menu.`}
        isOpen={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={deleteItem}
        title="Delete menu item"
      />
    </section>
  );
}
