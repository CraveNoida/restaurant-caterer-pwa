export default function ConfirmationModal({ actionLabel = "Confirm", body, isOpen, onClose, onConfirm, title }) {
  if (!isOpen) return null;

  return (
    <div className="admin-modal-backdrop" role="presentation">
      <section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="admin-confirm-title">
        <h2 id="admin-confirm-title">{title}</h2>
        <p>{body}</p>
        <div className="admin-modal-actions">
          <button type="button" onClick={onClose}>Keep</button>
          <button type="button" className="danger" onClick={onConfirm}>{actionLabel}</button>
        </div>
      </section>
    </div>
  );
}
