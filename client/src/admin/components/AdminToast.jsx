export default function AdminToast({ toast, onClose }) {
  if (!toast?.message) return null;

  return (
    <div className={`admin-toast ${toast.type || "success"}`}>
      <span>{toast.message}</span>
      <button type="button" onClick={onClose}>Close</button>
    </div>
  );
}
