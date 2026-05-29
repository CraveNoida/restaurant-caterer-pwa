export default function DeliveryToast({ onClose, toast }) {
  if (!toast?.message) return null;

  return (
    <div className={`delivery-toast ${toast.type || "success"}`}>
      <span>{toast.message}</span>
      <button type="button" onClick={onClose}>Close</button>
    </div>
  );
}
