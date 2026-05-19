// Shared Mantine-style primitives.
const { useState, useRef, useEffect, useCallback, useMemo } = React;

// ====== Button ======
const Button = ({ variant = "default", size, leftIcon, rightIcon, children, className = "", ...rest }) => {
  const sz = size === "xs" ? "btn-xs" : size === "sm" ? "btn-sm" : size === "lg" ? "btn-lg" : "";
  return (
    <button className={`btn btn-${variant} ${sz} ${className}`} {...rest}>
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
};

const IconButton = ({ children, className = "", ...rest }) => (
  <button className={`iconbtn ${className}`} {...rest}>{children}</button>
);

// ====== Badge ======
const Badge = ({ color = "gray", dot = false, children, style }) => (
  <span className={`badge badge-${color} ${dot ? "badge-dot" : ""}`} style={style}>{children}</span>
);

// ====== Input ======
const TextInput = ({ icon, label, placeholder, value, onChange, style, ...rest }) => (
  <div style={style}>
    {label && <label className="input-label">{label}</label>}
    <div className="input-wrap">
      {icon && <span className="input-icon">{icon}</span>}
      <input className="input" placeholder={placeholder} value={value || ""} onChange={onChange} {...rest} />
    </div>
  </div>
);

const Textarea = ({ label, placeholder, value, onChange, minRows = 3, style, ...rest }) => (
  <div style={style}>
    {label && <label className="input-label">{label}</label>}
    <textarea className="input" placeholder={placeholder} value={value || ""} onChange={onChange} rows={minRows} {...rest} />
  </div>
);

// ====== Segmented control ======
const Segmented = ({ value, onChange, options }) => (
  <div className="segmented">
    {options.map(o => (
      <button key={o.value} className={value === o.value ? "active" : ""} onClick={() => onChange(o.value)}>{o.label}</button>
    ))}
  </div>
);

// ====== Tabs ======
const Tabs = ({ value, onChange, items }) => (
  <div className="tabs">
    {items.map(t => (
      <button key={t.value} className={`tab ${value === t.value ? "active" : ""}`} onClick={() => onChange(t.value)}>
        {t.icon}
        {t.label}
        {t.badge != null && <Badge color="gray" style={{ marginLeft: 2 }}>{t.badge}</Badge>}
      </button>
    ))}
  </div>
);

// ====== Menu (anchored) ======
const Menu = ({ anchor, onClose, children, align = "right" }) => {
  const ref = useRef();
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    setTimeout(() => document.addEventListener("mousedown", handler), 0);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);
  if (!anchor) return null;
  const rect = anchor.getBoundingClientRect();
  const style = { top: rect.bottom + 4 };
  if (align === "right") style.right = window.innerWidth - rect.right;
  else style.left = rect.left;
  return <div ref={ref} className="menu" style={style}>{children}</div>;
};

const MenuItem = ({ icon, children, onClick, danger, kbd }) => (
  <div className={`menu-item ${danger ? "danger" : ""}`} onClick={onClick}>
    {icon && <span style={{ display: "inline-flex" }}>{icon}</span>}
    <span style={{ flex: 1 }}>{children}</span>
    {kbd && <span className="kbd">{kbd}</span>}
  </div>
);

const MenuDivider = () => <div className="menu-divider"></div>;
const MenuLabel = ({ children }) => <div className="menu-label">{children}</div>;

// ====== Popover (for tooltips) ======
const Popover = ({ anchor, onClose, children, offset = 8 }) => {
  const ref = useRef();
  useEffect(() => {
    if (!onClose) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target) && !anchor?.contains(e.target)) onClose(); };
    setTimeout(() => document.addEventListener("mousedown", handler), 0);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose, anchor]);
  if (!anchor) return null;
  const rect = anchor.getBoundingClientRect();
  const style = {
    top: rect.bottom + offset,
    left: Math.max(8, Math.min(window.innerWidth - 340, rect.left)),
  };
  return <div ref={ref} className="popover" style={style}>{children}</div>;
};

// ====== Toast ======
const Toast = ({ message, icon, onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, [onDone]);
  return <div className="toast">{icon}{message}</div>;
};

// ====== Modal ======
const Modal = ({ title, onClose, children, footer, width = 520 }) => (
  <>
    <div className="scrim" onClick={onClose}></div>
    <div className="modal" style={{ width }}>
      <div className="modal-header">
        <strong style={{ fontSize: 15 }}>{title}</strong>
        <IconButton onClick={onClose}><Icon name="close" size={16}/></IconButton>
      </div>
      <div className="modal-body">{children}</div>
      {footer && <div className="modal-footer">{footer}</div>}
    </div>
  </>
);

// ====== Drawer ======
const Drawer = ({ title, onClose, children, width = 420 }) => (
  <>
    <div className="scrim" onClick={onClose}></div>
    <div className="drawer" style={{ width }}>
      <div className="drawer-header">
        <strong style={{ fontSize: 14 }}>{title}</strong>
        <IconButton onClick={onClose}><Icon name="close" size={16}/></IconButton>
      </div>
      <div className="drawer-body">{children}</div>
    </div>
  </>
);

Object.assign(window, {
  Button, IconButton, Badge, TextInput, Textarea, Segmented, Tabs,
  Menu, MenuItem, MenuDivider, MenuLabel, Popover, Toast, Modal, Drawer,
});
