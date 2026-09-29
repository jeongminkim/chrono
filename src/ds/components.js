// Generated from the Claude Design bundle (_ds_bundle.js): components only, as an ES module.
import * as React from "react";
const __ds_ns = { __errors: [] };
const __ds_scope = {};
(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Badge({
  tone = 'wash',
  children,
  style,
  ...rest
}) {
  const tones = {
    wash: {
      background: 'var(--comp-badge-color-background-wash-light)',
      color: 'var(--sema-color-text-default)',
      backdropFilter: 'blur(8px)'
    },
    accent: {
      background: 'var(--sema-color-background-accent)',
      color: 'var(--base-color-black)'
    },
    dark: {
      background: 'var(--sema-color-background-inverse)',
      color: 'var(--sema-color-text-inverse)'
    },
    nature: {
      background: 'var(--sema-color-background-nature)',
      color: 'var(--sema-color-text-inverse)'
    },
    recommendation: {
      background: 'var(--base-color-purple-recommendation)',
      color: 'var(--sema-color-text-inverse)'
    }
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '4px 10px',
      borderRadius: 'var(--radius-standard)',
      font: 'var(--text-caption)',
      fontWeight: 'var(--font-weight-bold)',
      ...tones[tone],
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SIZES = {
  sm: {
    padding: '6px 14px',
    fontSize: 'var(--font-size-button)'
  },
  md: {
    padding: '10px 18px',
    fontSize: 'var(--font-size-caption-bold)'
  },
  lg: {
    padding: '14px 24px',
    fontSize: 'var(--font-size-body)'
  }
};
const VARIANTS = {
  primary: {
    background: 'var(--comp-button-color-background-primary)',
    color: 'var(--comp-button-color-text-primary)'
  },
  accent: {
    background: 'var(--comp-button-color-background-accent)',
    color: 'var(--comp-button-color-text-accent)'
  },
  secondary: {
    background: 'var(--comp-button-color-background-secondary)',
    color: 'var(--comp-button-color-text-secondary)'
  },
  nature: {
    background: 'var(--sema-color-background-nature)',
    color: 'var(--sema-color-text-inverse)'
  },
  ghost: {
    background: 'transparent',
    color: 'var(--base-color-black)'
  }
};
function Button({
  variant = 'primary',
  size = 'sm',
  disabled = false,
  fullWidth = false,
  iconStart,
  iconEnd,
  onClick,
  type = 'button',
  children,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.sm;
  const hoverBg = {
    primary: 'var(--sema-color-hover-background-action)',
    accent: 'var(--sema-color-hover-background-accent)',
    secondary: 'var(--sema-color-hover-background-secondary)',
    nature: 'var(--base-color-hover-green-700)',
    ghost: 'var(--sema-color-background-secondary)'
  }[variant];
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--space-2)',
      width: fullWidth ? '100%' : undefined,
      font: 'var(--text-body)',
      fontSize: s.fontSize,
      fontWeight: 'var(--font-weight-semibold)',
      padding: s.padding,
      borderRadius: 'var(--radius-button)',
      border: '2px solid rgba(255,255,255,0)',
      background: disabled ? 'var(--sema-color-background-secondary)' : hover && hoverBg ? hoverBg : v.background,
      color: disabled ? 'var(--comp-button-color-text-transparent-disabled)' : v.color,
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'background var(--motion-duration-fast) var(--motion-ease-standard), color var(--motion-duration-fast) var(--motion-ease-standard)',
      ...style
    }
  }, rest), iconStart, children, iconEnd);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Card({
  padding = 'var(--space-8)',
  radius = 'var(--radius-comfortable)',
  tone = 'card',
  bordered = false,
  children,
  style,
  ...rest
}) {
  const bg = {
    card: 'var(--sema-color-background-card)',
    subtle: 'var(--sema-color-background-subtle)',
    sand: 'var(--sema-color-background-secondary)',
    inverse: 'var(--sema-color-background-inverse)'
  }[tone];
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      background: bg,
      borderRadius: radius,
      padding,
      border: bordered ? '1px solid var(--sema-color-border-subtle)' : 'none',
      color: tone === 'inverse' ? 'var(--sema-color-text-inverse)' : 'var(--sema-color-text-default)',
      boxShadow: 'var(--elevation-flat)',
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SIZES = {
  sm: 32,
  md: 40,
  lg: 48
};
function IconButton({
  icon,
  label,
  size = 'md',
  variant = 'circle',
  disabled = false,
  onClick,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const d = SIZES[size] || SIZES.md;
  const bg = {
    circle: 'var(--comp-button-color-background-circle)',
    overlay: 'rgba(255,255,255,.92)',
    ghost: 'transparent',
    accent: 'var(--sema-color-background-accent)'
  }[variant];
  const hoverBg = {
    circle: 'var(--base-color-hover-grayscale-150)',
    overlay: '#fff',
    ghost: 'var(--sema-color-background-secondary)',
    accent: 'var(--sema-color-hover-background-accent)'
  }[variant];
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-label": label,
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      width: d,
      height: d,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 'var(--radius-circle)',
      border: 'none',
      background: disabled ? 'var(--sema-color-background-subtle)' : hover ? hoverBg : bg,
      color: 'var(--sema-color-text-default)',
      opacity: disabled ? 0.5 : 1,
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'background var(--motion-duration-fast) var(--motion-ease-standard)',
      ...style
    }
  }, rest), icon);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/PhotoCard.jsx
try { (() => {
const BOOKMARK = 'https://unpkg.com/lucide-static@0.469.0/icons/bookmark.svg';
function PhotoCard({
  image,
  background,
  alt = '',
  title,
  place,
  meta,
  height = 260,
  saved = false,
  onSave,
  onClick,
  framed = false,
  saveIcon,
  style
}) {
  const fill = background || (image ? `center/cover no-repeat url(${image})` : null);
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      cursor: onClick ? 'pointer' : 'default',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      height,
      borderRadius: 'var(--radius-comfortable)',
      overflow: 'hidden',
      background: fill || 'var(--sema-color-background-secondary)',
      border: framed ? 'var(--border-photo-frame)' : 'none'
    },
    role: "img",
    "aria-label": alt
  }, !fill && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'grid',
      placeItems: 'center',
      font: 'var(--text-caption)',
      color: 'var(--sema-color-text-disabled)'
    }
  }, "Photo"), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'rgba(33,25,34,.28)',
      opacity: hover ? 1 : 0,
      transition: 'opacity var(--motion-duration-base) var(--motion-ease-standard)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 'var(--space-5)',
      right: 'var(--space-5)',
      opacity: hover || saved ? 1 : 0,
      transition: 'opacity var(--motion-duration-base) var(--motion-ease-standard)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    label: saved ? 'Saved' : 'Save',
    variant: saved ? 'accent' : 'overlay',
    size: "sm",
    onClick: e => {
      e.stopPropagation();
      onSave && onSave();
    },
    icon: saveIcon || /*#__PURE__*/React.createElement("span", {
      style: {
        width: 16,
        height: 16,
        display: 'block',
        background: saved ? '#fff' : 'var(--sema-color-text-default)',
        WebkitMask: `center/16px no-repeat url(${BOOKMARK})`,
        mask: `center/16px no-repeat url(${BOOKMARK})`
      }
    })
  })), place && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 'var(--space-5)',
      bottom: 'var(--space-5)',
      background: 'var(--comp-badge-color-background-wash-light)',
      backdropFilter: 'blur(8px)',
      padding: '4px 10px',
      borderRadius: 'var(--radius-standard)',
      font: 'var(--text-caption)',
      fontWeight: 'var(--font-weight-bold)',
      color: 'var(--sema-color-text-default)'
    }
  }, place)), (title || meta) && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 'var(--space-5) var(--space-1) 0'
    }
  }, title && /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--text-body)',
      fontWeight: 'var(--font-weight-bold)',
      color: 'var(--sema-color-text-default)'
    }
  }, title), meta && /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--text-caption)',
      color: 'var(--sema-color-text-subtle)',
      marginTop: 2
    }
  }, meta)));
}
Object.assign(__ds_scope, { PhotoCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/PhotoCard.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Tag({
  children,
  selected = false,
  onClick,
  onRemove,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const interactive = !!onClick;
  return /*#__PURE__*/React.createElement("span", _extends({
    onClick: onClick,
    role: interactive ? 'button' : undefined,
    tabIndex: interactive ? 0 : undefined,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '7px 14px',
      borderRadius: 'var(--radius-button)',
      font: 'var(--text-caption)',
      fontWeight: 'var(--font-weight-medium)',
      background: selected ? 'var(--base-color-plum-900)' : hover && interactive ? 'var(--sema-color-hover-background-secondary)' : 'var(--sema-color-background-secondary)',
      color: selected ? 'var(--sema-color-text-inverse)' : 'var(--sema-color-text-default)',
      cursor: interactive ? 'pointer' : 'default',
      userSelect: 'none',
      transition: 'background var(--motion-duration-fast) var(--motion-ease-standard)',
      ...style
    }
  }, rest), children, onRemove && /*#__PURE__*/React.createElement("span", {
    onClick: e => {
      e.stopPropagation();
      onRemove();
    },
    style: {
      cursor: 'pointer',
      opacity: .6,
      fontWeight: 700
    }
  }, "\xD7"));
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Dialog.jsx
try { (() => {
const X = 'https://unpkg.com/lucide-static@0.469.0/icons/x.svg';
function Dialog({
  open = true,
  title,
  description,
  onClose,
  footer,
  width = 440,
  children,
  style
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(33,25,34,.45)',
      display: 'grid',
      placeItems: 'center',
      padding: 'var(--space-12)',
      zIndex: 60
    },
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    role: "dialog",
    "aria-modal": "true",
    onClick: e => e.stopPropagation(),
    style: {
      width: '100%',
      maxWidth: width,
      background: 'var(--base-color-white)',
      borderRadius: 'var(--radius-section)',
      padding: 'var(--space-12)',
      boxShadow: 'var(--elevation-modal)',
      position: 'relative',
      ...style
    }
  }, onClose && /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Close",
    onClick: onClose,
    style: {
      position: 'absolute',
      top: 'var(--space-8)',
      right: 'var(--space-8)',
      width: 32,
      height: 32,
      borderRadius: '50%',
      border: 'none',
      cursor: 'pointer',
      background: 'var(--sema-color-background-secondary)',
      display: 'grid',
      placeItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 16,
      height: 16,
      background: 'var(--sema-color-text-default)',
      WebkitMask: `center/16px no-repeat url(${X})`,
      mask: `center/16px no-repeat url(${X})`
    }
  })), title && /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      font: 'var(--text-heading)',
      letterSpacing: 'var(--letter-spacing-heading)',
      paddingRight: 40
    }
  }, title), description && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 'var(--space-4) 0 0',
      font: 'var(--text-body)',
      color: 'var(--sema-color-text-subtle)'
    }
  }, description), children && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--space-10)'
    }
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--space-12)',
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 'var(--space-4)'
    }
  }, footer)));
}
Object.assign(__ds_scope, { Dialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Dialog.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
function Toast({
  message,
  action,
  onAction,
  tone = 'dark',
  style
}) {
  const tones = {
    dark: {
      background: 'var(--sema-color-background-inverse)',
      color: 'var(--sema-color-text-inverse)'
    },
    error: {
      background: 'var(--base-color-danger-600)',
      color: 'var(--sema-color-text-inverse)'
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    role: "status",
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-8)',
      padding: '14px var(--space-10)',
      borderRadius: 'var(--radius-button)',
      font: 'var(--text-body)',
      fontSize: 'var(--font-size-caption-bold)',
      boxShadow: 'var(--elevation-overlay)',
      ...tones[tone],
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", null, message), action && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onAction,
    style: {
      border: 'none',
      background: 'transparent',
      color: 'inherit',
      font: 'inherit',
      fontWeight: 'var(--font-weight-bold)',
      textDecoration: 'underline',
      cursor: 'pointer'
    }
  }, action));
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Tooltip.jsx
try { (() => {
function Tooltip({
  label,
  placement = 'top',
  children,
  style
}) {
  const [show, setShow] = React.useState(false);
  const pos = {
    top: {
      bottom: '100%',
      left: '50%',
      transform: 'translate(-50%,-8px)'
    },
    bottom: {
      top: '100%',
      left: '50%',
      transform: 'translate(-50%,8px)'
    },
    left: {
      right: '100%',
      top: '50%',
      transform: 'translate(-8px,-50%)'
    },
    right: {
      left: '100%',
      top: '50%',
      transform: 'translate(8px,-50%)'
    }
  }[placement];
  return /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      display: 'inline-flex',
      ...style
    },
    onMouseEnter: () => setShow(true),
    onMouseLeave: () => setShow(false),
    onFocus: () => setShow(true),
    onBlur: () => setShow(false)
  }, children, /*#__PURE__*/React.createElement("span", {
    role: "tooltip",
    style: {
      position: 'absolute',
      ...pos,
      padding: '6px 10px',
      borderRadius: 'var(--radius-standard)',
      background: 'var(--base-color-plum-900)',
      color: 'var(--sema-color-text-inverse)',
      font: 'var(--text-caption)',
      whiteSpace: 'nowrap',
      pointerEvents: 'none',
      opacity: show ? 1 : 0,
      transition: 'opacity var(--motion-duration-fast) var(--motion-ease-standard)',
      zIndex: 40
    }
  }, label));
}
Object.assign(__ds_scope, { Tooltip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Tooltip.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
const CHECK = 'https://unpkg.com/lucide-static@0.469.0/icons/check.svg';
function Checkbox({
  label,
  checked,
  defaultChecked,
  onChange,
  disabled = false,
  error = false,
  style
}) {
  const [internal, setInternal] = React.useState(!!defaultChecked);
  const on = checked !== undefined ? checked : internal;
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-5)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? .5 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: on,
    disabled: disabled,
    onChange: e => {
      setInternal(e.target.checked);
      onChange && onChange(e);
    },
    style: {
      position: 'absolute',
      opacity: 0,
      width: 0,
      height: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 22,
      height: 22,
      flex: '0 0 auto',
      display: 'grid',
      placeItems: 'center',
      borderRadius: 6,
      background: on ? 'var(--base-color-plum-900)' : 'var(--base-color-white)',
      border: `2px solid ${error ? 'var(--sema-color-border-error)' : on ? 'var(--base-color-plum-900)' : 'var(--sema-color-border-default)'}`,
      transition: 'background var(--motion-duration-fast) var(--motion-ease-standard)'
    }
  }, on && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 14,
      height: 14,
      background: '#fff',
      WebkitMask: `center/14px no-repeat url(${CHECK})`,
      mask: `center/14px no-repeat url(${CHECK})`
    }
  })), label && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--text-body)',
      fontSize: 'var(--font-size-caption-bold)'
    }
  }, label));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Input({
  label,
  hint,
  error,
  iconStart,
  type = 'text',
  value,
  defaultValue,
  onChange,
  placeholder,
  disabled = false,
  fullWidth = true,
  style,
  inputStyle,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const border = error ? 'var(--sema-color-border-error)' : focus ? 'var(--sema-color-border-focus-outer-default)' : 'var(--comp-input-color-border)';
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: fullWidth ? 'block' : 'inline-block',
      width: fullWidth ? '100%' : undefined,
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      font: 'var(--text-caption)',
      fontWeight: 'var(--font-weight-bold)',
      color: 'var(--sema-color-text-default)',
      marginBottom: 'var(--space-2)'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-4)',
      background: disabled ? 'var(--sema-color-background-subtle)' : 'var(--base-color-white)',
      border: `1px solid ${border}`,
      borderRadius: 'var(--radius-button)',
      padding: '11px 15px',
      boxShadow: focus ? '0 0 0 2px rgba(67,94,229,.25)' : 'none',
      transition: 'border-color var(--motion-duration-fast) var(--motion-ease-standard), box-shadow var(--motion-duration-fast) var(--motion-ease-standard)'
    }
  }, iconStart, /*#__PURE__*/React.createElement("input", _extends({
    type: type,
    value: value,
    defaultValue: defaultValue,
    onChange: onChange,
    placeholder: placeholder,
    disabled: disabled,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      flex: 1,
      minWidth: 0,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      font: 'var(--text-body)',
      color: 'var(--sema-color-text-default)',
      ...inputStyle
    }
  }, rest))), (hint || error) && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      font: 'var(--text-caption)',
      color: error ? 'var(--sema-color-text-error)' : 'var(--sema-color-text-subtle)',
      marginTop: 'var(--space-2)'
    }
  }, error || hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Radio.jsx
try { (() => {
function Radio({
  label,
  name,
  value,
  checked,
  onChange,
  disabled = false,
  style
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-5)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? .5 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "radio",
    name: name,
    value: value,
    checked: checked,
    disabled: disabled,
    onChange: onChange,
    style: {
      position: 'absolute',
      opacity: 0,
      width: 0,
      height: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 22,
      height: 22,
      flex: '0 0 auto',
      borderRadius: 'var(--radius-circle)',
      display: 'grid',
      placeItems: 'center',
      border: `2px solid ${checked ? 'var(--base-color-plum-900)' : 'var(--sema-color-border-default)'}`,
      background: 'var(--base-color-white)'
    }
  }, checked && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 11,
      height: 11,
      borderRadius: '50%',
      background: 'var(--base-color-plum-900)'
    }
  })), label && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--text-body)',
      fontSize: 'var(--font-size-caption-bold)'
    }
  }, label));
}
Object.assign(__ds_scope, { Radio });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Radio.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
const CHEVRON = 'https://unpkg.com/lucide-static@0.469.0/icons/chevron-down.svg';
function Select({
  label,
  options = [],
  value,
  onChange,
  disabled = false,
  fullWidth = true,
  style
}) {
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: fullWidth ? 'block' : 'inline-block',
      width: fullWidth ? '100%' : undefined,
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      font: 'var(--text-caption)',
      fontWeight: 'var(--font-weight-bold)',
      marginBottom: 'var(--space-2)'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      display: 'block'
    }
  }, /*#__PURE__*/React.createElement("select", {
    value: value,
    onChange: onChange,
    disabled: disabled,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      appearance: 'none',
      width: '100%',
      font: 'var(--text-body)',
      color: 'var(--sema-color-text-default)',
      background: disabled ? 'var(--sema-color-background-subtle)' : 'var(--base-color-white)',
      border: `1px solid ${focus ? 'var(--sema-color-border-focus-outer-default)' : 'var(--comp-input-color-border)'}`,
      borderRadius: 'var(--radius-button)',
      padding: '11px 40px 11px 15px',
      outline: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer'
    }
  }, options.map(o => {
    const v = typeof o === 'string' ? o : o.value;
    const l = typeof o === 'string' ? o : o.label;
    return /*#__PURE__*/React.createElement("option", {
      key: v,
      value: v
    }, l);
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      right: 14,
      top: '50%',
      transform: 'translateY(-50%)',
      width: 16,
      height: 16,
      background: 'var(--sema-color-text-subtle)',
      WebkitMask: `center/16px no-repeat url(${CHEVRON})`,
      mask: `center/16px no-repeat url(${CHEVRON})`,
      pointerEvents: 'none'
    }
  })));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function Switch({
  checked,
  defaultChecked,
  onChange,
  disabled = false,
  label,
  style
}) {
  const [internal, setInternal] = React.useState(!!defaultChecked);
  const on = checked !== undefined ? checked : internal;
  const toggle = () => {
    if (disabled) return;
    const next = !on;
    setInternal(next);
    onChange && onChange(next);
  };
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-5)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? .5 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    role: "switch",
    "aria-checked": on,
    onClick: toggle,
    disabled: disabled,
    style: {
      width: 46,
      height: 28,
      padding: 3,
      borderRadius: 999,
      border: 'none',
      cursor: 'inherit',
      background: on ? 'var(--base-color-amber-500)' : 'var(--base-color-grayscale-300)',
      transition: 'background var(--motion-duration-base) var(--motion-ease-standard)',
      display: 'flex',
      justifyContent: on ? 'flex-end' : 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 22,
      height: 22,
      borderRadius: '50%',
      background: '#fff',
      boxShadow: 'var(--elevation-subtle)',
      transition: 'all var(--motion-duration-base) var(--motion-ease-out)'
    }
  })), label && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--text-body)',
      fontSize: 'var(--font-size-caption-bold)'
    }
  }, label));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/navigation/NavBar.jsx
try { (() => {
function NavBar({
  brand = 'Wayfare',
  items = [],
  value,
  onChange,
  right,
  search,
  style
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-8)',
      padding: 'var(--space-7) var(--space-8)',
      background: 'var(--sema-color-background-page)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--text-heading)',
      fontSize: 'var(--font-size-subheading)',
      letterSpacing: '-0.6px',
      color: 'var(--base-color-amber-500)',
      whiteSpace: 'nowrap'
    }
  }, brand), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      gap: 'var(--space-1)'
    }
  }, items.map(i => {
    const v = typeof i === 'string' ? i : i.value;
    const l = typeof i === 'string' ? i : i.label;
    const on = v === value;
    return /*#__PURE__*/React.createElement("button", {
      key: v,
      type: "button",
      onClick: () => onChange && onChange(v),
      style: {
        border: 'none',
        cursor: 'pointer',
        padding: '8px 14px',
        borderRadius: 'var(--radius-button)',
        whiteSpace: 'nowrap',
        background: on ? 'var(--base-color-plum-900)' : 'transparent',
        color: on ? 'var(--sema-color-text-inverse)' : 'var(--sema-color-text-default)',
        font: 'var(--text-body)',
        fontWeight: 'var(--font-weight-semibold)'
      }
    }, l);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, search), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-2)'
    }
  }, right));
}
Object.assign(__ds_scope, { NavBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/NavBar.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Sidebar.jsx
try { (() => {
function Sidebar({
  title,
  sections = [],
  value,
  onChange,
  footer,
  width = 248,
  style
}) {
  return /*#__PURE__*/React.createElement("aside", {
    style: {
      width,
      flex: `0 0 ${width}px`,
      background: 'var(--sema-color-background-subtle)',
      padding: 'var(--space-8) var(--space-7)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-12)',
      ...style
    }
  }, title && /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--text-heading)',
      fontSize: 'var(--font-size-subheading)',
      letterSpacing: '-0.6px',
      color: 'var(--base-color-amber-500)',
      padding: '0 var(--space-5)'
    }
  }, title), sections.map((s, si) => /*#__PURE__*/React.createElement("div", {
    key: si,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, s.label && /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--text-caption)',
      fontWeight: 'var(--font-weight-bold)',
      color: 'var(--sema-color-text-subtle)',
      textTransform: 'uppercase',
      letterSpacing: '.06em',
      padding: '0 var(--space-5) var(--space-2)'
    }
  }, s.label), s.items.map(i => {
    const on = i.value === value;
    return /*#__PURE__*/React.createElement("button", {
      key: i.value,
      type: "button",
      onClick: () => onChange && onChange(i.value),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-5)',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        padding: '9px var(--space-5)',
        borderRadius: 'var(--radius-standard)',
        background: on ? 'var(--sema-color-background-secondary)' : 'transparent',
        font: 'var(--text-body)',
        fontSize: 'var(--font-size-caption-bold)',
        fontWeight: on ? 'var(--font-weight-bold)' : 'var(--font-weight-medium)',
        color: 'var(--sema-color-text-default)'
      }
    }, i.icon && /*#__PURE__*/React.createElement("span", {
      style: {
        width: 18,
        height: 18,
        flex: '0 0 auto',
        background: on ? 'var(--base-color-amber-500)' : 'var(--sema-color-text-subtle)',
        WebkitMask: `center/18px no-repeat url(${i.icon})`,
        mask: `center/18px no-repeat url(${i.icon})`
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }
    }, i.label), i.count !== undefined && /*#__PURE__*/React.createElement("span", {
      style: {
        font: 'var(--text-caption)',
        color: 'var(--sema-color-text-subtle)'
      }
    }, i.count));
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'auto'
    }
  }, footer));
}
Object.assign(__ds_scope, { Sidebar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Sidebar.jsx", error: String((e && e.message) || e) }); }

// components/navigation/TabBar.jsx
try { (() => {
function TabBar({
  items = [],
  value,
  onChange,
  style
}) {
  return /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '8px 4px 22px',
      background: 'rgba(255,255,255,.92)',
      backdropFilter: 'blur(18px)',
      borderTop: '1px solid var(--sema-color-border-subtle)',
      ...style
    }
  }, items.map(i => {
    const on = i.value === value;
    return /*#__PURE__*/React.createElement("button", {
      key: i.value,
      type: "button",
      onClick: () => onChange && onChange(i.value),
      style: {
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        minWidth: 56,
        padding: '4px 0'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 24,
        height: 24,
        background: on ? 'var(--base-color-amber-500)' : 'var(--sema-color-text-subtle)',
        WebkitMask: `center/24px no-repeat url(${i.icon})`,
        mask: `center/24px no-repeat url(${i.icon})`
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        font: 'var(--text-caption)',
        fontWeight: on ? 'var(--font-weight-bold)' : 'var(--font-weight-medium)',
        color: on ? 'var(--sema-color-text-default)' : 'var(--sema-color-text-subtle)'
      }
    }, i.label));
  }));
}
Object.assign(__ds_scope, { TabBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/TabBar.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
function Tabs({
  items = [],
  value,
  onChange,
  variant = 'underline',
  style
}) {
  const active = value !== undefined ? value : items[0] && (items[0].value || items[0]);
  const norm = items.map(i => typeof i === 'string' ? {
    value: i,
    label: i
  } : i);
  if (variant === 'segmented') {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'inline-flex',
        gap: 2,
        padding: 4,
        background: 'var(--sema-color-background-secondary)',
        borderRadius: 'var(--radius-section)',
        ...style
      }
    }, norm.map(t => /*#__PURE__*/React.createElement("button", {
      key: t.value,
      type: "button",
      onClick: () => onChange && onChange(t.value),
      style: {
        border: 'none',
        cursor: 'pointer',
        padding: '8px 18px',
        borderRadius: 'var(--radius-section)',
        background: active === t.value ? 'var(--base-color-white)' : 'transparent',
        color: 'var(--sema-color-text-default)',
        font: 'var(--text-body)',
        fontSize: 'var(--font-size-caption-bold)',
        fontWeight: active === t.value ? 'var(--font-weight-bold)' : 'var(--font-weight-medium)',
        transition: 'background var(--motion-duration-fast) var(--motion-ease-standard)'
      }
    }, t.label)));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-12)',
      borderBottom: '1px solid var(--sema-color-border-subtle)',
      ...style
    }
  }, norm.map(t => /*#__PURE__*/React.createElement("button", {
    key: t.value,
    type: "button",
    onClick: () => onChange && onChange(t.value),
    style: {
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      padding: '0 0 12px',
      font: 'var(--text-body)',
      fontWeight: active === t.value ? 'var(--font-weight-bold)' : 'var(--font-weight-medium)',
      color: active === t.value ? 'var(--sema-color-text-default)' : 'var(--sema-color-text-subtle)',
      boxShadow: active === t.value ? 'inset 0 -3px 0 0 var(--base-color-amber-500)' : 'none'
    }
  }, t.label)));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }
export const { Badge, Button, IconButton, Input, Tag } = __ds_scope;
