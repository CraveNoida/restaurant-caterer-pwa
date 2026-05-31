import { useEffect, useState } from "react";
import { adminMenuService } from "../../services/adminService.js";
import { AdminPageState, money } from "./adminUtils.jsx";
import ConfirmationModal from "../components/ConfirmationModal.jsx";
import AdminToast from "../components/AdminToast.jsx";
import { DetailDrawer, FilterChips, PageHeader, SearchInput } from "../components/AdminUI.jsx";

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
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
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
    setIsFormOpen(true);
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
    setIsFormOpen(false);
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
  const categories = [...new Set(items.map((item) => item.category).filter(Boolean))];
  const filteredItems = items.filter((item) => {
    const haystack = `${item.name} ${item.category} ${item.tags?.join(" ")}`.toLowerCase();
    return (!query || haystack.includes(query.toLowerCase())) && (!category || item.category === category);
  });

  return (
    <section className="admin-page">
      <AdminToast toast={toast} onClose={() => setToast(null)} />
      <PageHeader title="Menu Items" subtitle="Manage your restaurant catalog, pricing, availability, and customization options." eyebrow="Catalog manager" actions={<button type="button" className="admin-primary" onClick={() => { setEditingId(""); setForm(emptyForm); setIsFormOpen(true); }}>Add Item</button>} />
      <div className="admin-toolbar">
        <SearchInput placeholder="Search menu items" value={query} onChange={(event) => setQuery(event.target.value)} />
        <FilterChips options={categories} value={category} onChange={setCategory} allLabel="All categories" />
      </div>
      {!filteredItems.length ? <AdminPageState empty emptyText="No menu items match your filters." /> : (
        <div className="admin-card-grid">
          {filteredItems.map((item) => (
            <article className="admin-menu-card" key={item._id}>
              {item.image ? <img src={item.image} alt={item.name} /> : <div className="admin-menu-image" />}
              <div className="admin-menu-card-body">
                <div>
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                </div>
                <div className="admin-tag-row">
                  <span className="admin-tag">{item.category}</span>
                  <span className="admin-tag">{item.foodType}</span>
                  <span className={`admin-status ${item.isAvailable ? "active" : "inactive"}`}>{item.isAvailable ? "Available" : "Unavailable"}</span>
                </div>
                <strong>{money(item.price)}</strong>
                <p>{item.tags?.join(", ")}</p>
                <div className="admin-row-actions">
                  <button type="button" onClick={() => editItem(item)}>Edit</button>
                  <button type="button" onClick={() => toggleAvailable(item)}>{item.isAvailable ? "Disable" : "Enable"}</button>
                  <button type="button" onClick={() => setPendingDelete(item)}>Delete</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      {isFormOpen && (
        <DetailDrawer title={editingId ? "Edit menu item" : "Add menu item"} subtitle="Keep food details compact and ready for customer ordering." onClose={() => setIsFormOpen(false)}>
          <form className="admin-form-grid" onSubmit={saveItem}>
            <div className="admin-form-section">
              <h3>Basic Info</h3>
              <input required placeholder="Name" value={form.name} onChange={(event) => updateField("name", event.target.value)} />
              <textarea placeholder="Description" value={form.description} onChange={(event) => updateField("description", event.target.value)} />
            </div>
            <div className="admin-form-section">
              <h3>Price & Category</h3>
              <input required placeholder="Price" inputMode="decimal" value={form.price} onChange={(event) => updateField("price", event.target.value)} />
              <input placeholder="Category" value={form.category} onChange={(event) => updateField("category", event.target.value)} />
              <select value={form.foodType} onChange={(event) => updateField("foodType", event.target.value)}><option value="veg">Veg</option><option value="nonveg">Non-Veg</option></select>
            </div>
            <div className="admin-form-section">
              <h3>Image & Availability</h3>
              <input placeholder="Image URL" value={form.image} onChange={(event) => updateField("image", event.target.value)} />
              <input placeholder="Prep time" value={form.prepTime} onChange={(event) => updateField("prepTime", event.target.value)} />
              <input placeholder="Rating" value={form.rating} onChange={(event) => updateField("rating", event.target.value)} />
              <label className="admin-check"><input type="checkbox" checked={form.isAvailable} onChange={(event) => updateField("isAvailable", event.target.checked)} /> Available</label>
            </div>
            <div className="admin-form-section">
              <h3>Customization Options</h3>
              <input placeholder="Tags" value={form.tags} onChange={(event) => updateField("tags", event.target.value)} />
              <input placeholder="Portions" value={form.portions} onChange={(event) => updateField("portions", event.target.value)} />
              <input placeholder="Spice levels" value={form.spiceLevels} onChange={(event) => updateField("spiceLevels", event.target.value)} />
              <input placeholder="Add-ons" value={form.addOns} onChange={(event) => updateField("addOns", event.target.value)} />
            </div>
            <button type="submit">{editingId ? "Update Item" : "Add Item"}</button>
          </form>
        </DetailDrawer>
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
