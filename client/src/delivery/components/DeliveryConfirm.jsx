export default function DeliveryConfirm({ actionLabel = "Confirm", body, isOpen, onClose, onConfirm, title }) {
  if (!isOpen) return null;

  return (
    <div className="delivery-modal-backdrop">
      <section className="delivery-modal" role="dialog" aria-modal="true">
        <h2>{title}</h2>
        <p>{body}</p>
        <div>
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="button" className="danger" onClick={onConfirm}>{actionLabel}</button>
        </div>
      </section>
    </div>
  );
}
