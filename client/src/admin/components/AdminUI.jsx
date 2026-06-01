import { Search } from "../../customer/components/icons.jsx";

export function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <header className="admin-page-head">
      <div>
        {eyebrow && <span className="admin-eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="admin-actions">{actions}</div>}
    </header>
  );
}

export function AdminCard({ title, eyebrow, children, className = "" }) {
  return (
    <section className={`admin-card ${className}`}>
      {(title || eyebrow) && (
        <div className="admin-card-head">
          {eyebrow && <span className="admin-eyebrow">{eyebrow}</span>}
          {title && <h2>{title}</h2>}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatCard({ icon: Icon, label, value, helper }) {
  return (
    <article className="admin-stat-card">
      {Icon && <span className="admin-stat-icon"><Icon size={20} /></span>}
      <div>
        <span>{label}</span>
        <strong>{value ?? 0}</strong>
        {helper && <small>{helper}</small>}
      </div>
    </article>
  );
}

export function SearchInput({ value, onChange, placeholder = "Search" }) {
  return (
    <label className="admin-search-input">
      <Search size={16} />
      <input value={value} onChange={onChange} placeholder={placeholder} />
    </label>
  );
}

export function FilterChips({ options, value, onChange, allLabel = "All" }) {
  return (
    <div className="admin-filter-chips">
      <button type="button" className={!value ? "active" : ""} onClick={() => onChange("")}>{allLabel}</button>
      {options.map((option) => {
        const itemValue = typeof option === "string" ? option : option.value;
        const label = typeof option === "string" ? option.replaceAll("_", " ") : option.label;
        return (
          <button type="button" key={itemValue} className={value === itemValue ? "active" : ""} onClick={() => onChange(itemValue)}>
            {label}
          </button>
        );
      })}
    </div>
  );
}

export function DetailDrawer({ title, subtitle, onClose, children }) {
  return (
    <aside className="admin-detail-panel" aria-label={title}>
      <div className="admin-drawer-head">
        <div>
          <span className="admin-eyebrow">Details</span>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <button type="button" onClick={onClose}>Close</button>
      </div>
      {children}
    </aside>
  );
}

export function InfoGrid({ items }) {
  return (
    <div className="admin-detail-grid">
      {items.map(([label, value]) => (
        <span key={label}>
          <strong>{label}</strong>
          {value ?? "Not provided"}
        </span>
      ))}
    </div>
  );
}

export function ProgressBars({ items }) {
  const max = Math.max(1, ...items.map((item) => Number(item.value || 0)));
  return (
    <div className="admin-bars">
      {items.map((item) => (
        <div className="admin-bar-row" key={item.label}>
          <div>
            <span>{item.label}</span>
            <strong>{item.display ?? item.value}</strong>
          </div>
          <i style={{ "--bar-width": `${(Number(item.value || 0) / max) * 100}%` }} />
        </div>
      ))}
    </div>
  );
}
