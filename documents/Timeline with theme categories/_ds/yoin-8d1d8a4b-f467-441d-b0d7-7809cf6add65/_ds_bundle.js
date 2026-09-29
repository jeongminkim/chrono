/* @ds-bundle: {"format":4,"namespace":"WayfareDesignSystem_8d1d8a","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"PhotoCard","sourcePath":"components/core/PhotoCard.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"Dialog","sourcePath":"components/feedback/Dialog.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"Tooltip","sourcePath":"components/feedback/Tooltip.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Radio","sourcePath":"components/forms/Radio.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"NavBar","sourcePath":"components/navigation/NavBar.jsx"},{"name":"Sidebar","sourcePath":"components/navigation/Sidebar.jsx"},{"name":"TabBar","sourcePath":"components/navigation/TabBar.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"aeb0618180d3","components/core/Button.jsx":"814d08d888b9","components/core/Card.jsx":"580785573c9f","components/core/IconButton.jsx":"1af8e00c83c5","components/core/PhotoCard.jsx":"432df4435645","components/core/Tag.jsx":"2e67a959bfbe","components/feedback/Dialog.jsx":"a6373a81ad60","components/feedback/Toast.jsx":"3048c4751870","components/feedback/Tooltip.jsx":"966ec81e48ba","components/forms/Checkbox.jsx":"e9e29b22c6e2","components/forms/Input.jsx":"712a4914a0af","components/forms/Radio.jsx":"f7347d21bdd7","components/forms/Select.jsx":"27c1753a8358","components/forms/Switch.jsx":"ac22513e1fd5","components/navigation/NavBar.jsx":"33b6980ba433","components/navigation/Sidebar.jsx":"ba6eac6a87ce","components/navigation/TabBar.jsx":"16181ccd5452","components/navigation/Tabs.jsx":"e14a7cb77d34","doc-page.js":"f52ae9c02fca","ui_kits/ios_app/ComposeSheet.jsx":"ce6746e80a85","ui_kits/ios_app/DetailScreen.jsx":"879612d0b5f8","ui_kits/ios_app/HomeScreen.jsx":"9fb4f6f4be71","ui_kits/ios_app/MapScreen.jsx":"d69e0ac4df5b","ui_kits/ios_app/PhoneApp.jsx":"4d7ffc348d73","ui_kits/ios_app/PhoneChrome.jsx":"8b88f0584b0b","ui_kits/ios_app/ProfileScreen.jsx":"947641e369b9","ui_kits/ios_app/photos.js":"a845a11cca07","ui_kits/ipad_app/DetailPane.jsx":"4a0c1b298f45","ui_kits/ipad_app/LibraryPane.jsx":"9d0f5c3d32c8","ui_kits/ipad_app/TabletApp.jsx":"c831cabba135","ui_kits/ipad_app/TabletChrome.jsx":"3d52470580b6","ui_kits/ipad_app/photos.js":"a845a11cca07","ui_kits/macos_app/Inspector.jsx":"d7829f9abf4e","ui_kits/macos_app/Library.jsx":"0dfb7ace2d3d","ui_kits/macos_app/MacApp.jsx":"1043779099a6","ui_kits/macos_app/MacChrome.jsx":"4bfe436d7f45","ui_kits/macos_app/Toolbar.jsx":"0affb60cd867","ui_kits/macos_app/photos.js":"a845a11cca07"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.WayfareDesignSystem_8d1d8a = window.WayfareDesignSystem_8d1d8a || {});

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

// doc-page.js
try { (() => {
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)
// Copied omelette starter. Re-running copy_starter_component with this kind overwrites this file with the latest version (page content is unaffected).
/* BEGIN USAGE */
/**
 * <doc-page> — paged-document shell for printable HTML.
 *
 * FIRST, decide how the document paginates — up front, before building:
 *
 * - FLOWING document (the default): write the whole document as one
 *   normal HTML flow inside <doc-page>; the browser's print engine
 *   splits it onto pages at export. Use for long-form documents with a
 *   single text flow: reports, memos, letters, essays.
 * - EXPLICIT pagination: a fixed set of pre-paginated pages, one
 *   <section class="page"> child per page. Use when the user asks for a
 *   specific page count, or the design implies one: a one-page resume, a
 *   two-sided flier, a poster, a certificate, a brochure — any richly
 *   laid-out document without a single text flow.
 * - If in doubt, ask the user as part of the build.
 *
 * PAGE SIZING — paper differs by country (letter vs A4), so the printed
 * sheet is not one fixed truth:
 * - FLOWING documents pin NO paper size: the print engine paginates
 *   onto the user's real paper, and the content reflows to it.
 * - EXPLICITLY PAGINATED documents print each page at a FIXED page box
 *   with overflow hidden — letter by default, size="a4" for a clearly
 *   metric user, the user's chosen paper when they export. Design each
 *   page to FILL that box, fitting letter and A4 alike without overlap.
 * - width/height pin an explicit fixed size, ONLY when the user gives
 *   one.
 * Never write your own @page rule or hard-code paper dimensions in the
 * content.
 *
 * Sizing modes (attributes):
 *   (none)                      — portrait: flowing docs use the user's
 *           paper; explicitly paginated pages use the named size box
 *           (letter unless size="a4")
 *   orientation="landscape"     — the same, landscape
 *   width / height              — explicit fixed size, ONLY when the user
 *           gives one (e.g. width="22in" height="30in" for a 22×30
 *           poster): the page IS the design's size, printed at true
 *           dimensions (or scaled onto the user's paper at print time).
 *           Any absolute CSS length: px/in/mm/cm/pt/pc.
 * The component announces the chosen mode to the host app at runtime (a
 * meta tag it injects), so the print path can inject the user's true
 * paper size.
 *
 * On screen the document renders on a desk background: a flowing
 * document as one tall scrolling sheet (Google Docs' pageless view);
 * explicitly paginated documents as one card per page.
 *
 * EXPLICIT pagination usage:
 *   <style>doc-page:not(:defined){visibility:hidden}</style>
 *   <doc-page>
 *     <section class="page" id="p1">…one page's design…</section>
 *     <section class="page" id="p2">…</section>
 *   </doc-page>
 *   <script src="doc-page.js"></script>
 * How the page box works, concretely: each .page prints as ONE full-bleed
 * sheet at a FIXED physical size — letter by default (set size="a4" for
 * a clearly metric user), the user's chosen paper when they export —
 * with overflow hidden. Nothing scrolls and nothing reflows onto a next
 * sheet: content that misses the box is CLIPPED. Design each page to
 * FILL that page box, and to fit it — letter and A4 alike — without
 * overlap. Each page is a size container; don't size anything in
 * viewport units (they track the window, not the page), and never set
 * width or height on the .page section itself (the component sizes the
 * page box; an authored height like 100% is meaningless at print and is
 * overridden). The component owns the page box, the screen card chrome,
 * and the page breaks (never add your own break-before/after). Don't mix
 * .page sections with flowing content or header/footer slots in the same
 * document.
 *
 * FLOWING usage:
 *   <style>doc-page:not(:defined){visibility:hidden}</style>
 *   <doc-page margin="0.75in">
 *     <h1>Title</h1>
 *     <p>…body…</p>
 *   </doc-page>
 *   <script src="doc-page.js"></script>
 * There is no manual page-splitting — the browser's print engine
 * paginates at export. Standard break-hygiene rules (`break-inside:
 * avoid` on figures, code blocks, images and table rows; `orphans/
 * widows: 3`) are applied so paragraphs and groups split cleanly. On
 * screen and at print, headings default to `text-wrap: balance` and
 * body text to `text-wrap: pretty`; the defaults have zero specificity,
 * so any text-wrap you declare wins.
 *
 * Other attributes:
 *   size    — letter | a4 | legal (default letter). Flowing documents:
 *           preview proportion only — it does NOT pin their printed
 *           paper (the print dialog's paper governs); leave it alone
 *           there. Explicitly paginated documents: it sets the page box
 *           the cards and the pinned @page share (the export dialog's
 *           choice overrides both at print) — set size="a4" for a
 *           clearly metric user. Scaled-fit: names the sheet the fit is
 *           computed against, same a4-for-metric-users advice.
 *   content-width / content-height — the design's own fixed dimensions
 *           (CSS lengths), for scaling a fixed-size design ONTO the
 *           named sheet: content lays out at exactly this size, and the
 *           component scales it to fit that sheet's printable area
 *           (centered horizontally, top-aligned; the export dialog
 *           re-fits to the user's actual paper choice where available).
 *           Both must be set; they do not change the page box. For pages
 *           WITHOUT running header/footer slots.
 *   margin  — printable inset on every page of a FLOWING document
 *           (default 0.75in); margin="0" makes pages full-bleed.
 *           Explicitly paginated pages are always full-bleed.
 *
 * Running header/footer (flowing documents only): give an element
 * `slot="header"` or `slot="footer"` and it repeats on every printed
 * page via `position: fixed`. To keep body text from sliding under it,
 * the component prints inside a single-cell table whose <thead>/<tfoot>
 * are spacers sized to the header/footer height — browsers repeat
 * thead/tfoot on every page, so each sheet's content starts below the
 * header and ends above the footer. On screen the header/footer render
 * once at the top/bottom of the sheet.
 *
 * At print the component injects `@page { margin: 0 }` (which leaves
 * Chrome no margin box to draw its date/URL/page-count header in) and
 * moves the visual margin onto the sheet's own padding. It also marks
 * the document as owning its print CSS (a
 * `meta[name="omelette-owns-print"]` it injects at runtime), so the
 * PDF export never injects page-geometry CSS of its own on top.
 *
 * Print best practices for the content you author:
 * - Multi-column text: use CSS columns (`column-count` +
 *   `column-gap`), never side-by-side flex/grid columns — only real
 *   CSS columns flow and break across pages. `column-span: all` lets
 *   a heading span the columns; `hyphens: auto` (needs `lang` on
 *   the html element) keeps narrow columns readable.
 * - Page breaks in flowing documents: `break-before: page` on an
 *   element that must start a new page (a chapter, an appendix). Add
 *   your own kept-together blocks (callouts, stat tiles, cards) to a
 *   `break-inside: avoid` rule, and keep each one shorter than a page.
 * - Extend `orphans: 3; widows: 3` to any custom text blocks you add
 *   (p and li are covered by default).
 * - Give long tables a <thead> — browsers repeat it on every printed
 *   page.
 * - No `position: fixed`/`sticky` and no viewport units in content:
 *   fixed elements stamp every printed page (running headers/footers go
 *   in the component's slots) and `100vh` mis-sizes at print.
 *
 * Author content as static HTML so the user can click-to-edit any text
 * directly. Do not set width/padding/background on the document body —
 * the component owns the sheet box.
 */
/* END USAGE */

(() => {
  const PAPER = {
    letter: ['8.5in', '11in'],
    a4: ['210mm', '297mm'],
    legal: ['8.5in', '14in']
  };
  const CSS_LENGTH = /^\d+(\.\d+)?(px|in|mm|cm|pt|pc)$/;
  // Unitless "0" is a valid CSS length and the natural way to write
  // margin="0"; normalise it to 0px so max()/calc() (which reject a bare
  // number) keep working.
  const safeLen = (v, fb) => {
    v = (v || '').trim();
    return v === '0' ? '0px' : CSS_LENGTH.test(v) ? v : fb;
  };
  // WebKit (Safari and every iOS browser shell) never repeats a table's
  // thead/tfoot on printed pages (WebKit bug 17205), so the spacer-borne
  // vertical margins of a FLOWING document reach only the first page
  // there. Engine check, not browser check: vendor is 'Apple Computer,
  // Inc.' exactly for WebKit and 'Google Inc.' for Blink.
  const WK_PRINT = /apple/i.test(navigator.vendor || '');
  // CSS length → px number (CSS absolute units are exact: 1in = 96px).
  // Returns NaN for anything safeLen would reject — callers gate on it.
  const PX_PER = {
    px: 1,
    in: 96,
    mm: 96 / 25.4,
    cm: 96 / 2.54,
    pt: 96 / 72,
    pc: 16
  };
  const toPx = v => {
    const m = /^(\d+(?:\.\d+)?)(px|in|mm|cm|pt|pc)$/.exec((v || '').trim());
    return m ? parseFloat(m[1]) * PX_PER[m[2]] : NaN;
  };
  const stylesheet = `
    :host {
      position: relative;
      display: block;
      /* When the viewport is narrower than the page, grow to wrap the
       * sheet (plus this padding) instead of staying viewport-width, so
       * the desk background and right margin reach the sheet's far edge
       * in the horizontal scroll. */
      min-width: max-content;
      min-height: 100vh;
      background: #f5f5f4;
      padding: 48px 24px;
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
      --doc-page-w: 8.5in;
      --doc-page-h: 11in;
      --doc-page-margin: 0.75in;
      --doc-hdr-h: 0px;
      --doc-ftr-h: 0px;
      --doc-hdr-pad: 0px;
      --doc-ftr-pad: 0px;
    }
    .sheet {
      width: var(--doc-page-w);
      margin: 0 auto;
      background: #fff;
      box-shadow: 0 2px 10px rgba(20, 20, 19, 0.12);
      border-radius: 7px;
      box-sizing: border-box;
      padding: var(--doc-page-margin);
    }
    .frame { width: 100%; border-collapse: collapse; }
    /* Scaled-fit mode (content-width/content-height): the inner .fit box
     * lays the content out at its authored fixed size and scales it onto
     * the printable area; .fit-box reserves the scaled footprint in flow
     * (transforms don't affect layout) and centers it. Without the mode,
     * both divs are unstyled block pass-throughs. */
    /* Explicit pagination: direct .page children are the pages. The sheet
     * becomes a transparent stack and each page carries the card look on
     * screen; at print each page is exactly one full-bleed sheet. The
     * ::slotted defaults are deliberately weak (document CSS wins), so
     * authored page styling can override any of this. */
    .sheet.paginated {
      background: transparent;
      box-shadow: none;
      border-radius: 0;
      padding: 0;
    }
    .paginated ::slotted(.page) {
      position: relative;
      display: block;
      width: 100%;
      aspect-ratio: var(--doc-page-ar);
      container-type: size;
      overflow: hidden;
      box-sizing: border-box;
      background: #fff;
      border-radius: 7px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25);
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      break-inside: avoid;
    }
    .paginated ::slotted(.page:not(:first-child)) { margin-top: 1rem; }
    @media print {
      .sheet.paginated { padding: 0; }
      /* The flowing-document vertical inset lives on the repeating
       * thead/tfoot spacers, not the sheet padding — they must go too,
       * or each full-sheet .page is pushed ~margin down and spills onto
       * a second sheet. Paginated pages are full-bleed by definition
       * (content owns its insets). */
      .sheet.paginated .hdr-space,
      .sheet.paginated .ftr-space { height: 0; }
      .paginated ::slotted(.page) {
        border-radius: 0 !important;
        box-shadow: none !important;
        margin: 0 !important;
        /* Physical page-box sizing, no viewport units: Safari resolves
         * 100vh against the window, not the page box, so a vh-sized card
         * paginates wrong there. --doc-page-w/h are the named size by
         * default and are overridden to the user's chosen paper by the
         * export path, so every card is exactly one sheet either way.
         * Width + height (same source values as @page size) rather than
         * width + aspect-ratio: the ratio is a 6-decimal rounding of the
         * same division, and a few millionths of overflow would spill a
         * blank sheet after every page. The screen-only aspect-ratio
         * (preview proportions) must not leak into print. cqh typography
         * tracks the same box.
         *
         * Every declaration is !important: per CSS Scoping, unimportant
         * shadow ::slotted rules LOSE to the document context, so a page
         * section's authored inline style would silently beat this print
         * geometry. A model-authored height:100% did exactly that — the
         * percentage resolves as auto in the all-auto print ancestry, the
         * base rule's size containment turns auto into ZERO, and
         * overflow:hidden then paints nothing: a blank PDF with perfect
         * page boxes. At print the component's geometry is the design's
         * whole contract, so it must win over any authored sizing. */
        aspect-ratio: auto !important;
        width: var(--doc-page-w) !important;
        height: var(--doc-page-h) !important;
        overflow: hidden !important;
      }
      .paginated ::slotted(.page:not(:first-child)) {
        break-before: page !important;
        margin-top: 0 !important;
      }
    }
    .fit-mode .fit-box {
      width: calc(var(--doc-fit-w) * var(--doc-fit-scale));
      height: calc(var(--doc-fit-h) * var(--doc-fit-scale));
      margin: 0 auto;
      break-inside: avoid;
    }
    /* Monolithic at print: Blink slices a transform-scaled child at
     * fragmentainer boundaries mapped in UNSCALED layout coordinates
     * (transforms are paint-time), so the .fit box (authored size, e.g.
     * 1400x990) gets cut at the page's free block space and spills onto
     * a second sheet even though its SCALED footprint fits the page by
     * construction. overflow:hidden makes .fit-box a scroll container —
     * monolithic under fragmentation (css-break-3) — so the scaled
     * content prints atomically on one sheet. No clipping for content
     * within the authored box: .fit-box is calc-sized to exactly the
     * scaled footprint. (Content that bleeds past content-width/height
     * is clipped at the footprint — fit mode's contract; it previously
     * painted beyond it at print.) Print-only, so the screen rendering
     * keeps visible overflow for editor affordances.
     * The export path injects the same rule into frozen copies
     * (print-eval.ts om-print-fit-contain). The .fit-mode scope is
     * load-bearing: .fit-box wraps slotted content in EVERY mode, and an
     * unscoped overflow:hidden would make whole flowing documents
     * monolithic (one truncated sheet). overflow:hidden, never clip —
     * clip is not a scroll container, so not monolithic. */
    @media print {
      .fit-mode .fit-box { overflow: hidden; }
    }
    .fit-mode .fit {
      width: var(--doc-fit-w);
      height: var(--doc-fit-h);
      transform: scale(var(--doc-fit-scale));
      transform-origin: top left;
    }
    .frame td, .frame th { padding: 0; text-align: left; font-weight: inherit; }
    .hdr-space { height: var(--doc-hdr-h); }
    .ftr-space { height: var(--doc-ftr-h); }
    ::slotted([slot="header"]),
    ::slotted([slot="footer"]) { display: block; box-sizing: border-box; }
    @media print {
      :host { background: none; padding: 0; min-width: 0; min-height: 0; }
      .sheet {
        width: auto; margin: 0; box-shadow: none; border-radius: 0;
        padding: 0 var(--doc-page-margin);
      }
      /* The thead/tfoot spacers repeat on every page, so they carry the
       * vertical page margin (which the sheet's own padding cannot, since
       * that padding is consumed once on the first/last page). The running
       * header/footer are fixed inside that band. */
      /* The 0.35in is breathing room between a running header/footer and
       * the body; without one the spacer is exactly the page margin, so a
       * margin="0" full-bleed document gets truly full-bleed pages. */
      .hdr-space { height: max(var(--doc-page-margin), calc(var(--doc-hdr-h) + var(--doc-hdr-pad))); }
      .ftr-space { height: max(var(--doc-page-margin), calc(var(--doc-ftr-h) + var(--doc-ftr-pad))); }
      /* WebKit flowing documents: @page carries the vertical margin (see
       * _syncPrintPageRule), so the spacers keep only whatever a running
       * header/footer needs BEYOND it — page 1 would otherwise double its
       * top inset. Paginated sheets already zero their spacers above. */
      .sheet.wk-print:not(.paginated) .hdr-space { height: max(0px, calc(max(var(--doc-page-margin), calc(var(--doc-hdr-h) + var(--doc-hdr-pad))) - var(--doc-page-margin))); }
      .sheet.wk-print:not(.paginated) .ftr-space { height: max(0px, calc(max(var(--doc-page-margin), calc(var(--doc-ftr-h) + var(--doc-ftr-pad))) - var(--doc-page-margin))); }
      ::slotted([slot="header"]) {
        position: fixed; top: 0; left: 0; right: 0; margin: 0;
        padding: calc(var(--doc-page-margin) * 0.45) var(--doc-page-margin) 0;
      }
      ::slotted([slot="footer"]) {
        position: fixed; bottom: 0; left: 0; right: 0; margin: 0;
        padding: 0 var(--doc-page-margin) calc(var(--doc-page-margin) * 0.45);
      }
    }
  `;
  class DocPage extends HTMLElement {
    static get observedAttributes() {
      return ['size', 'width', 'height', 'margin', 'orientation', 'content-width', 'content-height'];
    }
    constructor() {
      super();
      this._root = this.attachShadow({
        mode: 'open'
      });
      this._mo = typeof MutationObserver === 'function' ? new MutationObserver(() => this._scheduleMeasure()) : null;
    }

    /** The named paper's [w, h], swapped when orientation="landscape".
     *  Only the named size swaps — explicit width/height are exact values
     *  the author already oriented. */
    _paperSize() {
      const named = PAPER[(this.getAttribute('size') || '').toLowerCase()] || PAPER.letter;
      const landscape = (this.getAttribute('orientation') || '').trim().toLowerCase() === 'landscape';
      return landscape ? [named[1], named[0]] : named;
    }
    get pageWidth() {
      return safeLen(this.getAttribute('width'), this._paperSize()[0]);
    }
    get pageHeight() {
      return safeLen(this.getAttribute('height'), this._paperSize()[1]);
    }
    get pageMargin() {
      return safeLen(this.getAttribute('margin'), '0.75in');
    }

    /** Scaled-fit mode's content box [w, h] as CSS lengths, or null when
     *  the mode is off (either attribute missing/invalid/zero — a partial
     *  declaration falls back to normal flow rather than guessing). */
    _contentFit() {
      const w = safeLen(this.getAttribute('content-width'), null);
      const h = safeLen(this.getAttribute('content-height'), null);
      if (!w || !h) return null;
      const wPx = toPx(w),
        hPx = toPx(h);
      return wPx > 0 && hPx > 0 ? [w, h, wPx, hPx] : null;
    }
    connectedCallback() {
      if (!this._sheet) this._render();
      this._syncSize();
      this._syncPrintPageRule();
      this._ensureTextWrapDefaults();
      this._ensureOwnsPrintMeta();
      this._syncFixedSizeMeta();
      this._syncPrintSizingMeta();
      if (this._mo) this._mo.observe(this, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true
      });
      this._onResize = () => this._scheduleMeasure();
      window.addEventListener('resize', this._onResize);
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => this._scheduleMeasure());
      }
      this._scheduleMeasure();
    }
    disconnectedCallback() {
      window.removeEventListener('resize', this._onResize);
      if (this._mo) this._mo.disconnect();
      if (this._raf) {
        cancelAnimationFrame(this._raf);
        this._raf = null;
      }
      // Drop the head rules when the last doc-page leaves, so a deleted
      // document's @page geometry and text-wrap defaults can't apply to
      // whatever replaces it.
      const survivor = document.querySelector('doc-page');
      if (!survivor) {
        ['doc-page-print', 'doc-page-text-wrap', 'doc-page-owns-print', 'doc-page-fixed-size', 'doc-page-print-sizing'].forEach(id => {
          const tag = document.getElementById(id);
          if (tag) tag.remove();
        });
        // A live deck-stage deferred its own print-sizing meta to ours —
        // hand the page-global meta over so the deck isn't left unmarked.
        const deck = document.querySelector('deck-stage');
        if (deck && typeof deck._ensurePrintSizingMeta === 'function') {
          deck._ensurePrintSizingMeta();
        }
      } else {
        // A departed owner hands each page-global meta to whatever
        // doc-page remains (or it's removed).
        if (typeof survivor._syncFixedSizeMeta === 'function') {
          survivor._syncFixedSizeMeta();
        }
        if (typeof survivor._syncPrintSizingMeta === 'function') {
          survivor._syncPrintSizingMeta();
        }
      }
    }
    attributeChangedCallback() {
      if (!this._sheet) return;
      this._syncSize();
      this._syncPrintPageRule();
      this._syncFixedSizeMeta();
      this._syncPrintSizingMeta();
      this._scheduleMeasure();
    }
    _render() {
      this._root.innerHTML = `
        <style>${stylesheet}</style>
        <style id="vars"></style>
        <div class="sheet" data-screen-label="Document">
          <table class="frame" role="presentation">
            <thead><tr><th><div class="hdr-space"><slot name="header"></slot></div></th></tr></thead>
            <tbody><tr><td class="body"><div class="fit-box"><div class="fit"><slot></slot></div></div></td></tr></tbody>
            <tfoot><tr><td><div class="ftr-space"><slot name="footer"></slot></div></td></tr></tfoot>
          </table>
        </div>`;
      this._sheet = this._root.querySelector('.sheet');
      this._vars = this._root.getElementById('vars');
    }

    /** Runtime sizing lives in a shadow <style> :host rule, never on the
     *  light-DOM host element, so serialize-persist can't write it back. */
    _syncSize(hdrH, ftrH) {
      // Scaled-fit mode: content at its authored size, scaled onto the
      // printable area (page minus margins on both axes). The factor is a
      // plain number var so calc(length * number) stays valid; 4 decimals
      // keeps the shadow style stable across re-measures. Upscaling is
      // allowed — print transforms are vector, so text and CSS stay crisp
      // (raster images soften, which the catalog bullet warns about).
      const fit = this._contentFit();
      let fitVars = '';
      if (fit) {
        const marginPx = toPx(this.pageMargin) || 0;
        const availW = toPx(this.pageWidth) - 2 * marginPx;
        const availH = toPx(this.pageHeight) - 2 * marginPx;
        const scale = Math.min(availW / fit[2], availH / fit[3]);
        if (scale > 0 && Number.isFinite(scale)) {
          fitVars = '--doc-fit-w:' + fit[0] + ';' + '--doc-fit-h:' + fit[1] + ';' + '--doc-fit-scale:' + scale.toFixed(4) + ';';
        }
      }
      this._sheet.classList.toggle('fit-mode', !!fitVars);
      // Numeric w/h ratio for the paginated page cards' aspect-ratio —
      // aspect-ratio takes a number, not a length ratio, so compute it
      // here (CSS length division isn't portable). 6 decimals keeps the
      // shadow style stable across re-syncs.
      const arW = toPx(this.pageWidth);
      const arH = toPx(this.pageHeight);
      const ar = arW > 0 && arH > 0 ? (arW / arH).toFixed(6) : '0.772727';
      this._vars.textContent = ':host{' + fitVars + '--doc-page-ar:' + ar + ';' + '--doc-page-w:' + this.pageWidth + ';' + '--doc-page-h:' + this.pageHeight + ';' + '--doc-page-margin:' + this.pageMargin + ';' + '--doc-hdr-h:' + (hdrH || 0) + 'px;' + '--doc-ftr-h:' + (ftrH || 0) + 'px;' + '--doc-hdr-pad:' + (hdrH ? '0.35in' : '0px') + ';' + '--doc-ftr-pad:' + (ftrH ? '0.35in' : '0px') + '}';
    }

    /** @page is a no-op inside shadow DOM, so the rule lives in <head>.
     *  Re-appended on every sync so it stays last in source order — the
     *  @page cascade is source-order per descriptor, so this rule wins
     *  over any other @page rule in the document.
     *
     *  The @page SIZE is pinned where the page box IS part of the design:
     *  explicit-fixed-size mode (width + height authored), scaled-fit
     *  mode (the named sheet the fit targets), and explicit pagination
     *  (the named size the cards share — so card and sheet agree on
     *  every print path, and the export path's chosen paper overrides
     *  BOTH with one later rule). For FLOWING documents no paper size is
     *  emitted at all — the true size comes from the user's preference,
     *  injected by the export path or chosen in the print dialog — so a
     *  flowing document never fights the paper it lands on.
     *  margin: 0 is emitted in every mode: it leaves Chrome no margin box
     *  to draw its date/URL/page-count header in, and the visual margin
     *  lives on the sheet's own padding. */
    _syncPrintPageRule() {
      const id = 'doc-page-print';
      let tag = document.getElementById(id);
      if (!tag) {
        tag = document.createElement('style');
        tag.id = id;
      }
      document.head.appendChild(tag);
      // Three print-geometry regimes:
      // - true-size: the page IS the design — pin its exact size.
      // - scaled-fit (content-width/height): the fit factor is computed
      //   against the NAMED paper's printable area, so that paper must
      //   stay pinned or the scaled content overflows a smaller sheet
      //   (the export path re-fits and re-pins at print time on top).
      // - default modes: no paper size — but landscape still needs the
      //   paper-agnostic 'size: landscape' keyword, because the size
      //   descriptor is what carries orientation; without it a landscape
      //   document prints portrait whenever nothing injects a size.
      const landscape = (this.getAttribute('orientation') || '').trim().toLowerCase() === 'landscape';
      // Explicit pagination pins the page box to the SAME values that
      // size the cards (the named size by default, the export path's
      // chosen paper when its later rule overrides both) — card and
      // sheet agree on every print path, and a mismatched real paper
      // shrinks-to-fit in the dialog instead of clipping a Letter card
      // on A4. Declared before the paginated read below so both derive
      // from one check.
      const paginatedNow = this.querySelector(':scope > .page') !== null;
      const sizeDescriptor = this._trueSizePx() ? 'size: ' + this.pageWidth + ' ' + this.pageHeight + '; ' : this._contentFit() ? 'size: ' + this.pageWidth + ' ' + this.pageHeight + '; ' : paginatedNow ? 'size: ' + this.pageWidth + ' ' + this.pageHeight + '; ' : landscape ? 'size: landscape; ' : '';
      // WebKit never repeats the thead/tfoot spacers that carry a flowing
      // document's vertical page margins (see WK_PRINT above), so pages
      // after the first print edge-to-edge there. Carry the VERTICAL
      // margins on @page for WebKit instead, and the shadow print CSS
      // trims the first-page spacers by the same amount (.sheet.wk-print
      // rules). Horizontal inset stays on the sheet's own padding in
      // every engine. Blink keeps margin: 0 (a nonzero margin there
      // re-opens the box Chrome draws its header furniture in). One cost,
      // learned in testing: Safari's own date/URL headers are a USER
      // dialog setting ("Print headers and footers") that renders in the
      // margin area when room exists — margin: 0 only suppressed it by
      // leaving no room, and no CSS controls it. The export dialog's
      // Safari guide teaches turning the setting off for flowing
      // documents. Explicitly paginated and fixed-size documents keep
      // margin: 0 everywhere: their pages ARE the sheet.
      const wkFlowing = WK_PRINT && !paginatedNow && !this._trueSizePx() && !this._contentFit();
      const marginDescriptor = wkFlowing ? 'margin: ' + this.pageMargin + ' 0; ' : 'margin: 0; ';
      // Shadow-internal marker (never serialized), kept in lockstep with
      // the @page decision above: the print CSS trims the first-page
      // spacers ONLY while @page actually carries the margins — a
      // true-size or scaled-fit sheet keeps margin: 0 and must keep its
      // spacers too. Re-synced here so attribute changes and pagination
      // flips move both together.
      if (this._sheet) this._sheet.classList.toggle('wk-print', wkFlowing);
      tag.textContent = '@page { ' + sizeDescriptor + marginDescriptor + '} ' + '@media print { html, body { margin: 0 !important; padding: 0 !important; background: none !important; height: auto !important; overflow: visible !important; } ' + 'h1,h2,h3,h4,h5,h6 { break-after: avoid; } ' + 'figure,pre,blockquote,img,svg,tr { break-inside: avoid; } ' + 'p,li { orphans: 3; widows: 3; } ' + '* { -webkit-print-color-adjust: exact; print-color-adjust: exact; ' + 'backdrop-filter: none !important; -webkit-backdrop-filter: none !important; } ' + '*, *::before, *::after { animation-delay: -99s !important; animation-duration: .001s !important; ' + 'animation-iteration-count: 1 !important; animation-fill-mode: both !important; ' + 'animation-play-state: running !important; transition-duration: 0s !important; } }';
    }

    /** Typographic defaults for document text: balance headings, avoid
     *  widowed/orphaned words in body copy (browsers without text-wrap
     *  support drop the declarations). Zero-specificity via :where() so
     *  any text-wrap authored on those elements wins; document-level so the
     *  rules reach the slotted (light DOM) content — shadow styles can't.
     *  data-omelette-injected marks the tag for the host editor to strip
     *  at serialize, so it is never written back as authored source. */
    _ensureTextWrapDefaults() {
      if (document.getElementById('doc-page-text-wrap')) return;
      const tag = document.createElement('style');
      tag.id = 'doc-page-text-wrap';
      tag.setAttribute('data-omelette-injected', '');
      tag.textContent = ':where(h1,h2,h3,h4,h5,h6){text-wrap:balance}' + ':where(p,li,blockquote,figcaption){text-wrap:pretty}';
      document.head.appendChild(tag);
    }

    /** Declares that this document owns its print CSS. The instant-PDF
     *  export checks for the meta by NAME PRESENCE alone (content is
     *  ignored) and skips its automatic print-CSS injections, so the
     *  component's @page geometry is never overridden by a heuristic.
     *  data-omelette-injected keeps it out of serialized source. */
    _ensureOwnsPrintMeta() {
      if (document.getElementById('doc-page-owns-print')) return;
      const tag = document.createElement('meta');
      tag.id = 'doc-page-owns-print';
      tag.name = 'omelette-owns-print';
      tag.content = 'true';
      tag.setAttribute('data-omelette-injected', '');
      document.head.appendChild(tag);
    }

    /** This page's valid true-size page box (explicit width AND height)
     *  as [w, h] px ints, or null when the mode is off. */
    _trueSizePx() {
      if (!safeLen(this.getAttribute('width'), null) || !safeLen(this.getAttribute('height'), null)) return null;
      const w = Math.round(toPx(this.pageWidth));
      const h = Math.round(toPx(this.pageHeight));
      return w > 0 && h > 0 ? [w, h] : null;
    }

    /** True-size pages (explicit width AND height) also declare the page
     *  box as the preview size: the in-app preview reads
     *  meta[name="omelette-fixed-size"] (content "W,H" in px ints) and
     *  scales the sheet into view — without it an 18in poster previews at
     *  true size with scrollbars. Never overrides an author-set meta
     *  (only the component's own id is managed). The meta is page-global
     *  while doc-page instances are not, so every sync recomputes the
     *  page-wide owner — the first connected true-size doc-page — and a
     *  non-true-size sibling's sync can never delete the owner's meta.
     *  Removed when no true-size page remains (the owner's disconnect
     *  re-syncs via any survivor) or when an author-set meta exists. */
    _syncFixedSizeMeta() {
      const id = 'doc-page-fixed-size';
      const own = document.getElementById(id);
      const authored = document.querySelector('meta[name="omelette-fixed-size"]:not([data-omelette-injected])');
      // The page-wide owner, not this instance: an upgraded true-size page
      // anywhere in the document keeps the meta alive and sized.
      let box = null;
      for (const el of document.querySelectorAll('doc-page')) {
        box = typeof el._trueSizePx === 'function' ? el._trueSizePx() : null;
        if (box) break;
      }
      if (!box || authored) {
        if (own) own.remove();
        return;
      }
      const tag = own || document.createElement('meta');
      tag.id = id;
      tag.name = 'omelette-fixed-size';
      tag.content = box[0] + ',' + box[1];
      tag.setAttribute('data-omelette-injected', '');
      if (!own) document.head.appendChild(tag);
    }

    /** This page's print-sizing mode: 'fixed' when an explicit width AND
     *  height are authored (the page is the design's own size), else the
     *  default paper in the authored orientation. */
    _printSizingMode() {
      if (this._trueSizePx()) return 'fixed';
      const landscape = (this.getAttribute('orientation') || '').trim().toLowerCase() === 'landscape';
      return landscape ? 'default-landscape' : 'default-portrait';
    }

    /** Announces the print-sizing mode to the host app:
     *  meta[name="omelette-print-sizing"] with content 'default-portrait',
     *  'default-landscape', or 'fixed' (fixed pages also carry the
     *  omelette-fixed-size meta with the page box in px). The export path
     *  probes it to decide what true paper size to inject at print time —
     *  in the default modes the component emits no paper size of its own.
     *  Same page-global ownership rules as the fixed-size meta above:
     *  first connected doc-page owns it, an authored meta is never
     *  overridden, removed when no doc-page remains. */
    _syncPrintSizingMeta() {
      const id = 'doc-page-print-sizing';
      const own = document.getElementById(id);
      const authored = document.querySelector('meta[name="omelette-print-sizing"]:not([data-omelette-injected])');
      // A fixed page wins outright (mirroring the fixed-size loop above,
      // so the two metas can never contradict each other in a mixed
      // multi-page document); otherwise the first page's mode holds.
      let mode = null;
      for (const el of document.querySelectorAll('doc-page')) {
        if (typeof el._printSizingMode !== 'function') continue;
        const m = el._printSizingMode();
        if (m === 'fixed') {
          mode = m;
          break;
        }
        if (mode === null) mode = m;
      }
      if (!mode || authored) {
        if (own) own.remove();
        return;
      }
      // A deck-stage that connected first injected its own meta and
      // defers to any existing one — take it over, or the document ends
      // up with two conflicting injected metas (a doc-page page is the
      // document; the deck re-ensures its meta if every doc-page leaves).
      const deckMeta = document.getElementById('deck-stage-print-sizing');
      if (deckMeta) deckMeta.remove();
      const tag = own || document.createElement('meta');
      tag.id = id;
      tag.name = 'omelette-print-sizing';
      tag.content = mode;
      tag.setAttribute('data-omelette-injected', '');
      if (!own) document.head.appendChild(tag);
    }
    _scheduleMeasure() {
      if (this._raf) return;
      this._raf = requestAnimationFrame(() => {
        this._raf = null;
        this._measure();
      });
    }

    /** Slot heights feed the print spacers (--doc-hdr-h / --doc-ftr-h), so
     *  they re-measure on content mutation, resize, and font load. The
     *  same pass detects explicit pagination (direct .page children) and
     *  toggles the sheet between the flowing-document card and the
     *  page-per-card stack — content edits can add or remove pages at any
     *  time, so this tracks the same mutations the measurement does. */
    _measure() {
      const hdr = this.querySelector(':scope > [slot="header"]');
      const ftr = this.querySelector(':scope > [slot="footer"]');
      const wasPaginated = this._sheet.classList.contains('paginated');
      this._sheet.classList.toggle('paginated', this.querySelector(':scope > .page') !== null);
      // The WebKit @page margin is flowing-only, so a pagination flip
      // must re-emit the rule (content edits can add or remove .page
      // sections at any time).
      if (this._sheet.classList.contains('paginated') !== wasPaginated) {
        this._syncPrintPageRule();
      }
      this._syncSize(hdr ? hdr.offsetHeight : 0, ftr ? ftr.offsetHeight : 0);
    }
  }
  if (!customElements.get('doc-page')) {
    customElements.define('doc-page', DocPage);
  }
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "doc-page.js", error: String((e && e.message) || e) }); }

// ui_kits/ios_app/ComposeSheet.jsx
try { (() => {
const {
  Input,
  Select,
  Button,
  Tag,
  Switch,
  IconButton
} = window.WayfareDesignSystem_8d1d8a;
function ComposeSheet({
  onClose,
  onSave
}) {
  const [tags, setTags] = React.useState(['Coastal']);
  const all = ['Coastal', 'Hiking', 'Food', 'City', 'Slow travel'];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'rgba(33,25,34,.45)',
      display: 'flex',
      alignItems: 'flex-end',
      zIndex: 20
    },
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width: '100%',
      maxHeight: '88%',
      overflow: 'auto',
      background: '#fff',
      borderTopLeftRadius: 'var(--radius-hero)',
      borderTopRightRadius: 'var(--radius-hero)',
      padding: '14px 20px 28px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      height: 5,
      borderRadius: 3,
      background: 'var(--base-color-grayscale-300)',
      margin: '0 auto 16px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      font: 'var(--text-heading)',
      letterSpacing: 'var(--letter-spacing-heading)'
    }
  }, "New log"), /*#__PURE__*/React.createElement(IconButton, {
    label: "Close",
    size: "sm",
    onClick: onClose,
    icon: /*#__PURE__*/React.createElement(Glyph, {
      name: "x",
      size: 16
    })
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      gap: 8,
      margin: '16px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      aspectRatio: '1',
      borderRadius: 'var(--radius-standard)',
      background: 'var(--sema-color-background-secondary)',
      display: 'grid',
      placeItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Glyph, {
    name: "plus",
    size: 20,
    color: "var(--sema-color-text-subtle)"
  })), [0, 1, 2].map(n => /*#__PURE__*/React.createElement("div", {
    key: n,
    style: {
      aspectRatio: '1',
      borderRadius: 'var(--radius-standard)',
      background: window.WF_PHOTO(n + 2)
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Title",
    placeholder: "Where did you go?"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Place",
    placeholder: "Add a location",
    iconStart: /*#__PURE__*/React.createElement(Glyph, {
      name: "map-pin",
      size: 16,
      color: "var(--sema-color-text-subtle)"
    })
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Date",
    defaultValue: "14 June 2026",
    iconStart: /*#__PURE__*/React.createElement(Glyph, {
      name: "calendar",
      size: 16,
      color: "var(--sema-color-text-subtle)"
    })
  }), /*#__PURE__*/React.createElement(Select, {
    label: "Visibility",
    options: ['Private', 'Friends', 'Public']
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--text-caption)',
      fontWeight: 700,
      marginBottom: 8
    }
  }, "Tags"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, all.map(t => /*#__PURE__*/React.createElement(Tag, {
    key: t,
    selected: tags.includes(t),
    onClick: () => setTags(tags.includes(t) ? tags.filter(x => x !== t) : [...tags, t])
  }, t)))), /*#__PURE__*/React.createElement(Switch, {
    defaultChecked: true,
    label: "Use location from photos"
  }), /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    fullWidth: true,
    onClick: onSave
  }, "Save log"))));
}
Object.assign(window, {
  ComposeSheet
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/ios_app/ComposeSheet.jsx", error: String((e && e.message) || e) }); }

// ui_kits/ios_app/DetailScreen.jsx
try { (() => {
const {
  IconButton,
  Tag,
  Button,
  Badge
} = window.WayfareDesignSystem_8d1d8a;
function DetailScreen({
  log,
  onBack,
  saved,
  toggleSave
}) {
  const i = window.WF_LOGS.findIndex(l => l.id === log.id);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto',
      marginTop: -44
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      height: 340,
      background: window.WF_PHOTO(i),
      borderBottomLeftRadius: 'var(--radius-hero)',
      borderBottomRightRadius: 'var(--radius-hero)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(180deg,rgba(33,25,34,.45) 0%,rgba(33,25,34,0) 38%,rgba(33,25,34,.35) 100%)',
      borderBottomLeftRadius: 'var(--radius-hero)',
      borderBottomRightRadius: 'var(--radius-hero)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 52,
      left: 16,
      right: 16,
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    label: "Back",
    variant: "overlay",
    onClick: onBack,
    icon: /*#__PURE__*/React.createElement(Glyph, {
      name: "arrow-left",
      size: 18
    })
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    label: "Share",
    variant: "overlay",
    icon: /*#__PURE__*/React.createElement(Glyph, {
      name: "share",
      size: 18
    })
  }), /*#__PURE__*/React.createElement(IconButton, {
    label: "Save",
    variant: saved ? 'accent' : 'overlay',
    onClick: toggleSave,
    icon: /*#__PURE__*/React.createElement(Glyph, {
      name: "bookmark",
      size: 18,
      color: saved ? '#fff' : 'var(--sema-color-text-default)'
    })
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 20,
      right: 20,
      bottom: 22
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "wash"
  }, log.place), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: '10px 0 0',
      font: 'var(--text-heading)',
      fontSize: 32,
      letterSpacing: '-1.2px',
      color: '#fff'
    }
  }, log.title))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px 20px 28px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 16,
      font: 'var(--text-caption)',
      color: 'var(--sema-color-text-subtle)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      gap: 5,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Glyph, {
    name: "calendar",
    size: 14,
    color: "var(--sema-color-text-subtle)"
  }), log.meta.split(' · ')[0]), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      gap: 5,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Glyph, {
    name: "camera",
    size: 14,
    color: "var(--sema-color-text-subtle)"
  }), log.meta.split(' · ')[1]), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      gap: 5,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Glyph, {
    name: "route",
    size: 14,
    color: "var(--sema-color-text-subtle)"
  }), "32 km")), /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--text-body)',
      lineHeight: 1.4,
      marginTop: 14
    }
  }, "We left before the caf\xE9 opened and ate the last of yesterday\u2019s bread on the pier. The crossing takes an hour and ten minutes; nobody on board seemed in a hurry."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginTop: 14,
      flexWrap: 'wrap'
    }
  }, log.tags.map(t => /*#__PURE__*/React.createElement(Tag, {
    key: t
  }, t))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12,
      marginTop: 20
    }
  }, [1, 2, 3, 4].map(n => /*#__PURE__*/React.createElement("div", {
    key: n,
    style: {
      height: 120,
      borderRadius: 'var(--radius-comfortable)',
      background: window.WF_PHOTO(i + n)
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 20,
      borderRadius: 'var(--radius-section)',
      overflow: 'hidden',
      background: 'var(--sema-color-background-subtle)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 140,
      background: 'var(--sema-color-background-nature)',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: '38%',
      top: '44%'
    }
  }, /*#__PURE__*/React.createElement(Glyph, {
    name: "map-pin",
    size: 26,
    color: "var(--base-color-amber-500)"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: '62%',
      top: '30%'
    }
  }, /*#__PURE__*/React.createElement(Glyph, {
    name: "map-pin",
    size: 20,
    color: "rgba(255,255,255,.7)"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 14,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--text-caption)',
      fontWeight: 700
    }
  }, "2 stops on this day"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "sm"
  }, "Open map")))));
}
Object.assign(window, {
  DetailScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/ios_app/DetailScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/ios_app/HomeScreen.jsx
try { (() => {
const {
  Input,
  Tag,
  PhotoCard,
  IconButton,
  Badge
} = window.WayfareDesignSystem_8d1d8a;
function HomeScreen({
  onOpen,
  saved,
  toggleSave
}) {
  const [filter, setFilter] = React.useState('All');
  const filters = ['All', 'Coastal', 'Hiking', 'Food', 'City', 'Slow travel'];
  const logs = window.WF_LOGS.filter(l => filter === 'All' || l.tags.includes(filter));
  const art = l => window.WF_PHOTO(window.WF_LOGS.findIndex(x => x.id === l.id));
  const cols = [logs.filter((_, i) => i % 2 === 0), logs.filter((_, i) => i % 2 === 1)];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '6px 16px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      font: 'var(--text-heading)',
      letterSpacing: 'var(--letter-spacing-heading)'
    }
  }, "Your logs"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--text-caption)',
      color: 'var(--sema-color-text-subtle)'
    }
  }, window.WF_LOGS.length, " entries")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement(Input, {
    placeholder: "Search logs, places, people",
    iconStart: /*#__PURE__*/React.createElement(Glyph, {
      name: "search",
      size: 16,
      color: "var(--sema-color-text-subtle)"
    })
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      overflowX: 'auto',
      padding: '14px 0 4px',
      scrollbarWidth: 'none'
    }
  }, filters.map(t => /*#__PURE__*/React.createElement(Tag, {
    key: t,
    selected: filter === t,
    onClick: () => setFilter(t),
    style: {
      flex: '0 0 auto'
    }
  }, t)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      padding: '12px 16px 24px'
    }
  }, cols.map((col, ci) => /*#__PURE__*/React.createElement("div", {
    key: ci,
    style: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, col.map(l => /*#__PURE__*/React.createElement("div", {
    key: l.id,
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement(PhotoCard, {
    background: art(l),
    height: l.h * 0.62,
    title: l.title,
    place: l.place,
    meta: l.meta,
    saved: !!saved[l.id],
    onSave: () => toggleSave(l.id),
    onClick: () => onOpen(l),
    style: {
      background: 'transparent'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none'
    }
  })))))));
}
Object.assign(window, {
  HomeScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/ios_app/HomeScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/ios_app/MapScreen.jsx
try { (() => {
const {
  Tabs,
  Card,
  IconButton,
  Badge
} = window.WayfareDesignSystem_8d1d8a;
function MapScreen({
  onOpen
}) {
  const [mode, setMode] = React.useState('Pins');
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      position: 'relative',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'var(--base-color-green-700)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      opacity: .25,
      background: 'repeating-linear-gradient(0deg,transparent 0 38px,rgba(255,255,255,.25) 38px 39px),repeating-linear-gradient(90deg,transparent 0 38px,rgba(255,255,255,.25) 38px 39px)'
    }
  }), [[28, 30], [55, 22], [42, 48], [68, 58], [33, 68]].map(([l, t], n) => /*#__PURE__*/React.createElement("span", {
    key: n,
    style: {
      position: 'absolute',
      left: l + '%',
      top: t + '%'
    }
  }, /*#__PURE__*/React.createElement(Glyph, {
    name: "map-pin",
    size: n === 2 ? 32 : 24,
    color: n === 2 ? 'var(--base-color-amber-500)' : 'rgba(255,255,255,.85)'
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 12,
      left: 16,
      right: 16,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Tabs, {
    variant: "segmented",
    items: ['Pins', 'Route', 'Heat'],
    value: mode,
    onChange: setMode,
    style: {
      background: 'rgba(255,255,255,.9)',
      backdropFilter: 'blur(10px)'
    }
  }), /*#__PURE__*/React.createElement(IconButton, {
    label: "Filter",
    variant: "overlay",
    icon: /*#__PURE__*/React.createElement(Glyph, {
      name: "sliders-horizontal",
      size: 18
    })
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      padding: '0 16px 16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      overflowX: 'auto',
      scrollbarWidth: 'none'
    }
  }, window.WF_LOGS.slice(0, 3).map((l, i) => /*#__PURE__*/React.createElement(Card, {
    key: l.id,
    padding: "10px",
    radius: "var(--radius-comfortable)",
    style: {
      flex: '0 0 232px',
      display: 'flex',
      gap: 12,
      alignItems: 'center',
      cursor: 'pointer'
    },
    onClick: () => onOpen(l)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 56,
      height: 56,
      borderRadius: 'var(--radius-standard)',
      background: window.WF_PHOTO(i),
      flex: '0 0 auto'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--text-body)',
      fontSize: 14,
      fontWeight: 700,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, l.title), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--text-caption)',
      color: 'var(--sema-color-text-subtle)',
      marginTop: 2
    }
  }, l.place, " \xB7 ", l.meta.split(' · ')[0])))))));
}
Object.assign(window, {
  MapScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/ios_app/MapScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/ios_app/PhoneApp.jsx
try { (() => {
const {
  TabBar,
  IconButton,
  Toast
} = window.WayfareDesignSystem_8d1d8a;
function App() {
  const [tab, setTab] = React.useState('home');
  const [open, setOpen] = React.useState(null);
  const [compose, setCompose] = React.useState(false);
  const [saved, setSaved] = React.useState({
    fjord: true
  });
  const [toast, setToast] = React.useState(null);
  const toggleSave = id => {
    setSaved(s => ({
      ...s,
      [id]: !s[id]
    }));
    setToast(saved[id] ? 'Removed from Saved' : 'Saved to Nordic summer');
    setTimeout(() => setToast(null), 2200);
  };
  const dark = !!open; // only the detail hero runs under the status bar
  return /*#__PURE__*/React.createElement(PhoneFrame, {
    dark: dark
  }, open ? /*#__PURE__*/React.createElement(DetailScreen, {
    log: open,
    onBack: () => setOpen(null),
    saved: !!saved[open.id],
    toggleSave: () => toggleSave(open.id)
  }) : tab === 'home' ? /*#__PURE__*/React.createElement(HomeScreen, {
    onOpen: setOpen,
    saved: saved,
    toggleSave: toggleSave
  }) : tab === 'map' ? /*#__PURE__*/React.createElement(MapScreen, {
    onOpen: setOpen
  }) : tab === 'saved' ? /*#__PURE__*/React.createElement(HomeScreen, {
    onOpen: setOpen,
    saved: saved,
    toggleSave: toggleSave
  }) : /*#__PURE__*/React.createElement(ProfileScreen, null), compose && /*#__PURE__*/React.createElement(ComposeSheet, {
    onClose: () => setCompose(false),
    onSave: () => {
      setCompose(false);
      setToast('Log saved');
      setTimeout(() => setToast(null), 2200);
    }
  }), toast && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 108,
      display: 'flex',
      justifyContent: 'center',
      zIndex: 30
    }
  }, /*#__PURE__*/React.createElement(Toast, {
    message: toast
  })), !open && /*#__PURE__*/React.createElement(TabBar, {
    value: tab,
    onChange: v => v === 'new' ? setCompose(true) : setTab(v),
    items: [{
      value: 'home',
      label: 'Home',
      icon: ICON('house')
    }, {
      value: 'map',
      label: 'Map',
      icon: ICON('map-pin')
    }, {
      value: 'new',
      label: 'New',
      icon: ICON('plus')
    }, {
      value: 'saved',
      label: 'Saved',
      icon: ICON('bookmark')
    }, {
      value: 'you',
      label: 'You',
      icon: ICON('user')
    }]
  }));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/ios_app/PhoneApp.jsx", error: String((e && e.message) || e) }); }

// ui_kits/ios_app/PhoneChrome.jsx
try { (() => {
const ICON = n => '../../assets/icons/' + n + '.svg';
function Glyph({
  name,
  size = 20,
  color = 'var(--sema-color-text-default)'
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      width: size,
      height: size,
      display: 'inline-block',
      flex: '0 0 auto',
      background: color,
      WebkitMask: `center/${size}px no-repeat url(${ICON(name)})`,
      mask: `center/${size}px no-repeat url(${ICON(name)})`
    }
  });
}
function StatusBar({
  dark = false
}) {
  const c = dark ? '#fff' : 'var(--sema-color-text-default)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 10,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '14px 28px 6px',
      font: 'var(--text-caption)',
      fontWeight: 700,
      color: c,
      fontSize: 14
    }
  }, /*#__PURE__*/React.createElement("span", null, "9:41"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      gap: 6,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 17,
      height: 11,
      borderRadius: 2,
      background: c,
      clipPath: 'polygon(0 60%,20% 60%,20% 100%,0 100%,0 60%,30% 40%,50% 40%,50% 100%,30% 100%,30% 40%,60% 18%,80% 18%,80% 100%,60% 100%,60% 18%)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 24,
      height: 12,
      borderRadius: 3,
      border: `1.5px solid ${c}`,
      padding: 1.5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      height: '100%',
      width: '72%',
      background: c,
      borderRadius: 1
    }
  }))));
}
function PhoneFrame({
  children,
  dark
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: 390,
      height: 844,
      borderRadius: 46,
      background: 'var(--sema-color-background-page)',
      overflow: 'hidden',
      position: 'relative',
      boxShadow: '0 24px 70px rgba(33,25,34,.22)',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement(StatusBar, {
    dark: dark
  }), children, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: '50%',
      bottom: 8,
      transform: 'translateX(-50%)',
      width: 134,
      height: 5,
      borderRadius: 3,
      background: dark ? 'rgba(255,255,255,.6)' : 'rgba(33,25,34,.3)'
    }
  }));
}
Object.assign(window, {
  Glyph,
  StatusBar,
  PhoneFrame,
  ICON
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/ios_app/PhoneChrome.jsx", error: String((e && e.message) || e) }); }

// ui_kits/ios_app/ProfileScreen.jsx
try { (() => {
const {
  Card,
  Button,
  Switch,
  Tabs,
  Tag,
  Badge
} = window.WayfareDesignSystem_8d1d8a;
function ProfileScreen() {
  const [tab, setTab] = React.useState('Stats');
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto',
      padding: '6px 20px 24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 16,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 72,
      height: 72,
      borderRadius: '50%',
      background: window.WF_PHOTO(3),
      flex: '0 0 auto'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      font: 'var(--text-heading)',
      fontSize: 24,
      letterSpacing: '-1px'
    }
  }, "Ines Halvorsen"), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--text-caption)',
      color: 'var(--sema-color-text-subtle)',
      marginTop: 4
    }
  }, "Oslo \xB7 joined 2023"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "md",
    style: {
      flex: 1
    }
  }, "Edit profile"), /*#__PURE__*/React.createElement(Button, {
    size: "md",
    style: {
      flex: 1
    }
  }, "Share")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginTop: 18
    }
  }, [['24', 'logs'], ['9', 'countries'], ['1,208', 'photos']].map(([n, l]) => /*#__PURE__*/React.createElement(Card, {
    key: l,
    tone: "subtle",
    padding: "14px",
    style: {
      flex: 1,
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--text-heading)',
      fontSize: 22,
      letterSpacing: '-.8px'
    }
  }, n), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--text-caption)',
      color: 'var(--sema-color-text-subtle)'
    }
  }, l)))), /*#__PURE__*/React.createElement(Tabs, {
    items: ['Stats', 'Settings'],
    value: tab,
    onChange: setTab,
    style: {
      marginTop: 22
    }
  }), tab === 'Stats' ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18,
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, [['Nordic summer', '6 logs · 9 days'], ['Kansai in autumn', '11 logs · 14 days'], ['Weekends at home', '7 logs · ongoing']].map(([t, m], i) => /*#__PURE__*/React.createElement(Card, {
    key: t,
    padding: "12px",
    radius: "var(--radius-comfortable)",
    tone: "subtle",
    style: {
      display: 'flex',
      gap: 12,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 52,
      height: 52,
      borderRadius: 'var(--radius-standard)',
      background: window.WF_PHOTO(i + 4)
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 14
    }
  }, t), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--text-caption)',
      color: 'var(--sema-color-text-subtle)',
      marginTop: 2
    }
  }, m)), /*#__PURE__*/React.createElement(Glyph, {
    name: "chevron-right",
    size: 18,
    color: "var(--sema-color-text-subtle)"
  })))) : /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18,
      display: 'flex',
      flexDirection: 'column',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement(Switch, {
    defaultChecked: true,
    label: "Auto-add photo location"
  }), /*#__PURE__*/React.createElement(Switch, {
    defaultChecked: true,
    label: "Sync over cellular"
  }), /*#__PURE__*/React.createElement(Switch, {
    label: "Offline maps"
  }), /*#__PURE__*/React.createElement(Switch, {
    label: "Weekly recap email"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--text-caption)',
      color: 'var(--sema-color-text-subtle)'
    }
  }, "Version 2.0 \xB7 Wayfare for iPhone")));
}
Object.assign(window, {
  ProfileScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/ios_app/ProfileScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/ios_app/photos.js
try { (() => {
// Warm placeholder photography. No real imagery was supplied with the brief;
// these stand in for the photo layer and keep the palette warm.
window.WF_PHOTOS = ['linear-gradient(155deg,#dcd2c2,#a8a394)', 'linear-gradient(155deg,#cfd6d2,#7f8f88)', 'linear-gradient(155deg,#e7dcc8,#c2a98f)', 'linear-gradient(155deg,#d5cdd0,#8d7f86)', 'linear-gradient(155deg,#cbd7dd,#7c95a3)', 'linear-gradient(155deg,#e2d6cd,#b08e79)', 'linear-gradient(155deg,#d9ddcd,#8a9673)', 'linear-gradient(155deg,#efe4d6,#cdb59b)'];
window.WF_PHOTO = i => window.WF_PHOTOS[i % window.WF_PHOTOS.length];
window.WF_LOGS = [{
  id: 'aero',
  title: 'Ferry to Ærø',
  place: 'Denmark',
  meta: '14 Jun · 6 photos',
  h: 240,
  tags: ['Coastal', 'Slow travel']
}, {
  id: 'fjord',
  title: 'Morning on the fjord',
  place: 'Norway',
  meta: '17 Jun · 11 photos',
  h: 320,
  tags: ['Hiking']
}, {
  id: 'market',
  title: 'Saturday market',
  place: 'Malmö',
  meta: '19 Jun · 8 photos',
  h: 200,
  tags: ['Food']
}, {
  id: 'dunes',
  title: 'Dunes at Skagen',
  place: 'Denmark',
  meta: '21 Jun · 14 photos',
  h: 280,
  tags: ['Coastal']
}, {
  id: 'tram',
  title: 'Last tram home',
  place: 'Gothenburg',
  meta: '23 Jun · 4 photos',
  h: 220,
  tags: ['City']
}, {
  id: 'cabin',
  title: 'A cabin with no road',
  place: 'Sweden',
  meta: '25 Jun · 19 photos',
  h: 300,
  tags: ['Hiking', 'Slow travel']
}];
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/ios_app/photos.js", error: String((e && e.message) || e) }); }

// ui_kits/ipad_app/DetailPane.jsx
try { (() => {
const {
  IconButton,
  Tag,
  Button,
  Badge,
  Card
} = window.WayfareDesignSystem_8d1d8a;
function DetailPane({
  log,
  onClose,
  saved,
  toggleSave
}) {
  const i = window.WF_LOGS.findIndex(l => l.id === log.id);
  return /*#__PURE__*/React.createElement("aside", {
    style: {
      width: 380,
      flex: '0 0 380px',
      borderLeft: '1px solid var(--sema-color-border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '14px 18px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--text-caption)',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '.08em',
      color: 'var(--sema-color-text-subtle)'
    }
  }, "Entry"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    label: "Edit",
    size: "sm",
    icon: /*#__PURE__*/React.createElement(Glyph, {
      name: "pencil",
      size: 16
    })
  }), /*#__PURE__*/React.createElement(IconButton, {
    label: "Save",
    size: "sm",
    variant: saved ? 'accent' : 'circle',
    onClick: toggleSave,
    icon: /*#__PURE__*/React.createElement(Glyph, {
      name: "bookmark",
      size: 16,
      color: saved ? '#fff' : 'var(--sema-color-text-default)'
    })
  }), /*#__PURE__*/React.createElement(IconButton, {
    label: "Close",
    size: "sm",
    onClick: onClose,
    icon: /*#__PURE__*/React.createElement(Glyph, {
      name: "x",
      size: 16
    })
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto',
      padding: '0 18px 24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 230,
      borderRadius: 'var(--radius-comfortable)',
      background: window.WF_PHOTO(i),
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: 12,
      bottom: 12
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "wash"
  }, log.place))), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '16px 0 0',
      font: 'var(--text-heading)',
      fontSize: 24,
      letterSpacing: '-1px'
    }
  }, log.title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14,
      marginTop: 8,
      font: 'var(--text-caption)',
      color: 'var(--sema-color-text-subtle)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      gap: 5,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Glyph, {
    name: "calendar",
    size: 14,
    color: "var(--sema-color-text-subtle)"
  }), log.meta.split(' · ')[0]), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      gap: 5,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Glyph, {
    name: "camera",
    size: 14,
    color: "var(--sema-color-text-subtle)"
  }), log.meta.split(' · ')[1])), /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--text-body)',
      lineHeight: 1.4,
      marginTop: 12
    }
  }, "We left before the caf\xE9 opened and ate the last of yesterday\u2019s bread on the pier. The crossing takes an hour and ten minutes."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      marginTop: 12
    }
  }, log.tags.map(t => /*#__PURE__*/React.createElement(Tag, {
    key: t
  }, t))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: 8,
      marginTop: 16
    }
  }, [1, 2, 3, 4, 5, 6].map(n => /*#__PURE__*/React.createElement("div", {
    key: n,
    style: {
      aspectRatio: '1',
      borderRadius: 'var(--radius-standard)',
      background: window.WF_PHOTO(i + n)
    }
  }))), /*#__PURE__*/React.createElement(Card, {
    tone: "subtle",
    padding: "0",
    radius: "var(--radius-comfortable)",
    style: {
      marginTop: 16,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 120,
      background: 'var(--sema-color-background-nature)',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: '42%',
      top: '40%'
    }
  }, /*#__PURE__*/React.createElement(Glyph, {
    name: "map-pin",
    size: 24,
    color: "var(--base-color-amber-500)"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 12,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--text-caption)',
      fontWeight: 700
    }
  }, "\xC6r\xF8sk\xF8bing harbour"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "sm"
  }, "Open map")))));
}
Object.assign(window, {
  DetailPane
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/ipad_app/DetailPane.jsx", error: String((e && e.message) || e) }); }

// ui_kits/ipad_app/LibraryPane.jsx
try { (() => {
const {
  Input,
  Tag,
  PhotoCard,
  Tabs,
  IconButton,
  Button
} = window.WayfareDesignSystem_8d1d8a;
function LibraryPane({
  selected,
  onSelect,
  saved,
  toggleSave,
  onCompose
}) {
  const [filter, setFilter] = React.useState('All');
  const [mode, setMode] = React.useState('Grid');
  const filters = ['All', 'Coastal', 'Hiking', 'Food', 'City', 'Slow travel'];
  const logs = window.WF_LOGS.filter(l => filter === 'All' || l.tags.includes(filter));
  const art = l => window.WF_PHOTO(window.WF_LOGS.findIndex(x => x.id === l.id));
  const cols = [0, 1, 2].map(c => logs.filter((_, i) => i % 3 === c));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 24px 0',
      display: 'flex',
      alignItems: 'center',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      font: 'var(--text-heading)',
      letterSpacing: 'var(--letter-spacing-heading)',
      whiteSpace: 'nowrap'
    }
  }, "Nordic summer"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      maxWidth: 360
    }
  }, /*#__PURE__*/React.createElement(Input, {
    placeholder: "Search this trip",
    iconStart: /*#__PURE__*/React.createElement(Glyph, {
      name: "search",
      size: 16,
      color: "var(--sema-color-text-subtle)"
    })
  })), /*#__PURE__*/React.createElement(Tabs, {
    variant: "segmented",
    items: ['Grid', 'List'],
    value: mode,
    onChange: setMode
  }), /*#__PURE__*/React.createElement(Button, {
    size: "md",
    iconStart: /*#__PURE__*/React.createElement(Glyph, {
      name: "plus",
      size: 16
    }),
    onClick: onCompose
  }, "New log")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      padding: '14px 24px 0',
      flexWrap: 'wrap'
    }
  }, filters.map(t => /*#__PURE__*/React.createElement(Tag, {
    key: t,
    selected: filter === t,
    onClick: () => setFilter(t)
  }, t))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto',
      padding: '16px 24px 24px'
    }
  }, mode === 'Grid' ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 16
    }
  }, cols.map((col, ci) => /*#__PURE__*/React.createElement("div", {
    key: ci,
    style: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 18
    }
  }, col.map(l => /*#__PURE__*/React.createElement(PhotoCard, {
    key: l.id,
    background: art(l),
    height: l.h * 0.7,
    title: l.title,
    place: l.place,
    meta: l.meta,
    saved: !!saved[l.id],
    onSave: () => toggleSave(l.id),
    onClick: () => onSelect(l),
    style: {
      outline: selected && selected.id === l.id ? '3px solid var(--base-color-amber-500)' : 'none',
      outlineOffset: 4,
      borderRadius: 'var(--radius-comfortable)'
    }
  }))))) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, logs.map((l, i) => /*#__PURE__*/React.createElement("div", {
    key: l.id,
    onClick: () => onSelect(l),
    style: {
      display: 'flex',
      gap: 14,
      alignItems: 'center',
      padding: 10,
      borderRadius: 'var(--radius-standard)',
      cursor: 'pointer',
      background: selected && selected.id === l.id ? 'var(--sema-color-background-secondary)' : 'transparent'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 64,
      height: 64,
      borderRadius: 'var(--radius-standard)',
      background: window.WF_PHOTO(i),
      flex: '0 0 auto'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 16
    }
  }, l.title), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--text-caption)',
      color: 'var(--sema-color-text-subtle)',
      marginTop: 3
    }
  }, l.place, " \xB7 ", l.meta)), /*#__PURE__*/React.createElement(Glyph, {
    name: "chevron-right",
    size: 18,
    color: "var(--sema-color-text-subtle)"
  }))))));
}
Object.assign(window, {
  LibraryPane
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/ipad_app/LibraryPane.jsx", error: String((e && e.message) || e) }); }

// ui_kits/ipad_app/TabletApp.jsx
try { (() => {
const {
  Sidebar,
  IconButton,
  Toast,
  Dialog,
  Button,
  Input,
  Select,
  Switch,
  Tag
} = window.WayfareDesignSystem_8d1d8a;
function App() {
  const [view, setView] = React.useState('nordic');
  const [selected, setSelected] = React.useState(window.WF_LOGS[0]);
  const [saved, setSaved] = React.useState({
    fjord: true
  });
  const [toast, setToast] = React.useState(null);
  const [compose, setCompose] = React.useState(false);
  const toggleSave = id => {
    setSaved(s => ({
      ...s,
      [id]: !s[id]
    }));
    setToast(saved[id] ? 'Removed from Saved' : 'Saved to Nordic summer');
    setTimeout(() => setToast(null), 2200);
  };
  return /*#__PURE__*/React.createElement(TabletFrame, null, /*#__PURE__*/React.createElement(Sidebar, {
    width: 252,
    title: "Wayfare",
    value: view,
    onChange: setView,
    sections: [{
      label: 'Library',
      items: [{
        value: 'all',
        label: 'All logs',
        icon: ICON('book-open'),
        count: 24
      }, {
        value: 'map',
        label: 'Map',
        icon: ICON('map-pin')
      }, {
        value: 'saved',
        label: 'Saved',
        icon: ICON('bookmark'),
        count: 112
      }, {
        value: 'recent',
        label: 'Recently added',
        icon: ICON('clock')
      }]
    }, {
      label: 'Trips',
      items: [{
        value: 'nordic',
        label: 'Nordic summer',
        icon: ICON('route')
      }, {
        value: 'kansai',
        label: 'Kansai in autumn',
        icon: ICON('route')
      }, {
        value: 'home',
        label: 'Weekends at home',
        icon: ICON('house')
      }]
    }],
    footer: /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '0 8px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: window.WF_PHOTO(3)
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        font: 'var(--text-caption)',
        fontWeight: 700,
        flex: 1
      }
    }, "Ines H."), /*#__PURE__*/React.createElement(IconButton, {
      label: "Settings",
      size: "sm",
      variant: "ghost",
      icon: /*#__PURE__*/React.createElement(Glyph, {
        name: "settings",
        size: 16
      })
    }))
  }), /*#__PURE__*/React.createElement(LibraryPane, {
    selected: selected,
    onSelect: setSelected,
    saved: saved,
    toggleSave: toggleSave,
    onCompose: () => setCompose(true)
  }), selected && /*#__PURE__*/React.createElement(DetailPane, {
    log: selected,
    onClose: () => setSelected(null),
    saved: !!saved[selected.id],
    toggleSave: () => toggleSave(selected.id)
  }), compose && /*#__PURE__*/React.createElement(Dialog, {
    open: true,
    width: 520,
    title: "New log",
    description: "Add photos and we\u2019ll pull the place and date from them.",
    onClose: () => setCompose(false),
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "md",
      onClick: () => setCompose(false)
    }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
      size: "md",
      onClick: () => {
        setCompose(false);
        setToast('Log saved');
        setTimeout(() => setToast(null), 2200);
      }
    }, "Save log"))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      gap: 8,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      aspectRatio: '1',
      borderRadius: 'var(--radius-standard)',
      background: 'var(--sema-color-background-secondary)',
      display: 'grid',
      placeItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Glyph, {
    name: "plus",
    size: 20,
    color: "var(--sema-color-text-subtle)"
  })), [0, 1, 2].map(n => /*#__PURE__*/React.createElement("div", {
    key: n,
    style: {
      aspectRatio: '1',
      borderRadius: 'var(--radius-standard)',
      background: window.WF_PHOTO(n + 2)
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Title",
    placeholder: "Where did you go?"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Place",
    placeholder: "Add a location",
    iconStart: /*#__PURE__*/React.createElement(Glyph, {
      name: "map-pin",
      size: 16,
      color: "var(--sema-color-text-subtle)"
    })
  }), /*#__PURE__*/React.createElement(Select, {
    label: "Visibility",
    options: ['Private', 'Friends', 'Public']
  })), /*#__PURE__*/React.createElement(Switch, {
    defaultChecked: true,
    label: "Use location from photos"
  }))), toast && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 28,
      display: 'flex',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Toast, {
    message: toast
  })));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/ipad_app/TabletApp.jsx", error: String((e && e.message) || e) }); }

// ui_kits/ipad_app/TabletChrome.jsx
try { (() => {
const ICON = n => '../../assets/icons/' + n + '.svg';
function Glyph({
  name,
  size = 20,
  color = 'var(--sema-color-text-default)'
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      width: size,
      height: size,
      display: 'inline-block',
      flex: '0 0 auto',
      background: color,
      WebkitMask: `center/${size}px no-repeat url(${ICON(name)})`,
      mask: `center/${size}px no-repeat url(${ICON(name)})`
    }
  });
}
function TabletFrame({
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: 1112,
      height: 834,
      borderRadius: 26,
      background: '#fff',
      overflow: 'hidden',
      boxShadow: '0 26px 80px rgba(33,25,34,.22)',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '10px 26px 2px',
      font: 'var(--text-caption)',
      fontWeight: 700,
      fontSize: 13,
      color: 'var(--sema-color-text-default)'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Tue 14 Jun \xA0 9:41"), /*#__PURE__*/React.createElement("span", null, "Wi-Fi \xB7 82%")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      minHeight: 0
    }
  }, children));
}
Object.assign(window, {
  ICON,
  Glyph,
  TabletFrame
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/ipad_app/TabletChrome.jsx", error: String((e && e.message) || e) }); }

// ui_kits/ipad_app/photos.js
try { (() => {
// Warm placeholder photography. No real imagery was supplied with the brief;
// these stand in for the photo layer and keep the palette warm.
window.WF_PHOTOS = ['linear-gradient(155deg,#dcd2c2,#a8a394)', 'linear-gradient(155deg,#cfd6d2,#7f8f88)', 'linear-gradient(155deg,#e7dcc8,#c2a98f)', 'linear-gradient(155deg,#d5cdd0,#8d7f86)', 'linear-gradient(155deg,#cbd7dd,#7c95a3)', 'linear-gradient(155deg,#e2d6cd,#b08e79)', 'linear-gradient(155deg,#d9ddcd,#8a9673)', 'linear-gradient(155deg,#efe4d6,#cdb59b)'];
window.WF_PHOTO = i => window.WF_PHOTOS[i % window.WF_PHOTOS.length];
window.WF_LOGS = [{
  id: 'aero',
  title: 'Ferry to Ærø',
  place: 'Denmark',
  meta: '14 Jun · 6 photos',
  h: 240,
  tags: ['Coastal', 'Slow travel']
}, {
  id: 'fjord',
  title: 'Morning on the fjord',
  place: 'Norway',
  meta: '17 Jun · 11 photos',
  h: 320,
  tags: ['Hiking']
}, {
  id: 'market',
  title: 'Saturday market',
  place: 'Malmö',
  meta: '19 Jun · 8 photos',
  h: 200,
  tags: ['Food']
}, {
  id: 'dunes',
  title: 'Dunes at Skagen',
  place: 'Denmark',
  meta: '21 Jun · 14 photos',
  h: 280,
  tags: ['Coastal']
}, {
  id: 'tram',
  title: 'Last tram home',
  place: 'Gothenburg',
  meta: '23 Jun · 4 photos',
  h: 220,
  tags: ['City']
}, {
  id: 'cabin',
  title: 'A cabin with no road',
  place: 'Sweden',
  meta: '25 Jun · 19 photos',
  h: 300,
  tags: ['Hiking', 'Slow travel']
}];
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/ipad_app/photos.js", error: String((e && e.message) || e) }); }

// ui_kits/macos_app/Inspector.jsx
try { (() => {
const {
  Input,
  Select,
  Tag,
  Switch,
  Button,
  IconButton,
  Card,
  Badge
} = window.WayfareDesignSystem_8d1d8a;
function Inspector({
  log,
  saved,
  toggleSave,
  onDelete
}) {
  if (!log) return /*#__PURE__*/React.createElement("aside", {
    style: {
      width: 320,
      flex: '0 0 320px',
      borderLeft: '1px solid var(--sema-color-border-subtle)',
      display: 'grid',
      placeItems: 'center',
      color: 'var(--sema-color-text-subtle)',
      font: 'var(--text-caption)'
    }
  }, "Select a log");
  const i = window.WF_LOGS.findIndex(l => l.id === log.id);
  return /*#__PURE__*/React.createElement("aside", {
    style: {
      width: 320,
      flex: '0 0 320px',
      borderLeft: '1px solid var(--sema-color-border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0,
      background: 'var(--sema-color-background-page)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '14px 16px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--text-caption)',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '.08em',
      color: 'var(--sema-color-text-subtle)'
    }
  }, "Inspector"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    label: "Save",
    size: "sm",
    variant: saved ? 'accent' : 'circle',
    onClick: toggleSave,
    icon: /*#__PURE__*/React.createElement(Glyph, {
      name: "bookmark",
      size: 15,
      color: saved ? '#fff' : 'var(--sema-color-text-default)'
    })
  }), /*#__PURE__*/React.createElement(IconButton, {
    label: "Delete",
    size: "sm",
    onClick: onDelete,
    icon: /*#__PURE__*/React.createElement(Glyph, {
      name: "trash",
      size: 15
    })
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto',
      padding: '0 16px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 170,
      borderRadius: 'var(--radius-comfortable)',
      background: window.WF_PHOTO(i),
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: 10,
      bottom: 10
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "wash"
  }, log.place))), /*#__PURE__*/React.createElement(Input, {
    label: "Title",
    defaultValue: log.title,
    key: log.id + 't'
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Place",
    defaultValue: log.place,
    key: log.id + 'p',
    iconStart: /*#__PURE__*/React.createElement(Glyph, {
      name: "map-pin",
      size: 16,
      color: "var(--sema-color-text-subtle)"
    })
  }), /*#__PURE__*/React.createElement(Select, {
    label: "Visibility",
    options: ['Private', 'Friends', 'Public']
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--text-caption)',
      fontWeight: 700,
      marginBottom: 8
    }
  }, "Tags"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, log.tags.map(t => /*#__PURE__*/React.createElement(Tag, {
    key: t,
    onRemove: () => {}
  }, t)))), /*#__PURE__*/React.createElement(Switch, {
    defaultChecked: true,
    label: "Include in shared trip"
  }), /*#__PURE__*/React.createElement(Card, {
    tone: "subtle",
    padding: "12px",
    radius: "var(--radius-comfortable)"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--text-caption)',
      color: 'var(--sema-color-text-subtle)'
    }
  }, "Captured"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 14,
      marginTop: 2
    }
  }, log.meta)), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "md",
    fullWidth: true,
    iconStart: /*#__PURE__*/React.createElement(Glyph, {
      name: "download",
      size: 16
    })
  }, "Export entry")));
}
Object.assign(window, {
  Inspector
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/macos_app/Inspector.jsx", error: String((e && e.message) || e) }); }

// ui_kits/macos_app/Library.jsx
try { (() => {
const {
  PhotoCard,
  Tag,
  Card,
  Badge
} = window.WayfareDesignSystem_8d1d8a;
function Library({
  mode,
  selected,
  onSelect,
  saved,
  toggleSave
}) {
  const [filter, setFilter] = React.useState('All');
  const filters = ['All', 'Coastal', 'Hiking', 'Food', 'City', 'Slow travel'];
  const logs = window.WF_LOGS.filter(l => filter === 'All' || l.tags.includes(filter));
  const art = l => window.WF_PHOTO(window.WF_LOGS.findIndex(x => x.id === l.id));
  const cols = [0, 1, 2, 3].map(c => logs.filter((_, i) => i % 4 === c));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '16px 24px 0'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      font: 'var(--text-heading)',
      letterSpacing: 'var(--letter-spacing-heading)'
    }
  }, "Nordic summer"), /*#__PURE__*/React.createElement(Badge, {
    tone: "dark"
  }, "9 days"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--text-caption)',
      color: 'var(--sema-color-text-subtle)'
    }
  }, logs.length, " logs \xB7 62 photos")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      padding: '14px 24px 0',
      flexWrap: 'wrap'
    }
  }, filters.map(t => /*#__PURE__*/React.createElement(Tag, {
    key: t,
    selected: filter === t,
    onClick: () => setFilter(t)
  }, t))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto',
      padding: '18px 24px 24px'
    }
  }, mode === 'Map' ? /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      minHeight: 380,
      borderRadius: 'var(--radius-section)',
      background: 'var(--sema-color-background-nature)',
      position: 'relative',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      opacity: .22,
      background: 'repeating-linear-gradient(0deg,transparent 0 44px,rgba(255,255,255,.3) 44px 45px),repeating-linear-gradient(90deg,transparent 0 44px,rgba(255,255,255,.3) 44px 45px)'
    }
  }), [[22, 34], [40, 20], [52, 52], [70, 38], [63, 70], [33, 64]].map(([l, t], n) => /*#__PURE__*/React.createElement("span", {
    key: n,
    style: {
      position: 'absolute',
      left: l + '%',
      top: t + '%'
    }
  }, /*#__PURE__*/React.createElement(Glyph, {
    name: "map-pin",
    size: n === 2 ? 34 : 24,
    color: n === 2 ? 'var(--base-color-amber-500)' : 'rgba(255,255,255,.85)'
  })))) : mode === 'List' ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column'
    }
  }, logs.map((l, i) => /*#__PURE__*/React.createElement("div", {
    key: l.id,
    onClick: () => onSelect(l),
    style: {
      display: 'flex',
      gap: 16,
      alignItems: 'center',
      padding: '10px 12px',
      borderRadius: 'var(--radius-standard)',
      cursor: 'pointer',
      background: selected && selected.id === l.id ? 'var(--sema-color-background-secondary)' : 'transparent'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 56,
      height: 56,
      borderRadius: 'var(--radius-standard)',
      background: window.WF_PHOTO(i)
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700
    }
  }, l.title), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--text-caption)',
      color: 'var(--sema-color-text-subtle)',
      marginTop: 3
    }
  }, l.place)), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--text-caption)',
      color: 'var(--sema-color-text-subtle)',
      width: 120
    }
  }, l.meta), /*#__PURE__*/React.createElement(Glyph, {
    name: "chevron-right",
    size: 16,
    color: "var(--sema-color-text-subtle)"
  })))) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 18
    }
  }, cols.map((col, ci) => /*#__PURE__*/React.createElement("div", {
    key: ci,
    style: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, col.map(l => /*#__PURE__*/React.createElement(PhotoCard, {
    key: l.id,
    background: art(l),
    height: l.h * 0.8,
    title: l.title,
    place: l.place,
    meta: l.meta,
    saved: !!saved[l.id],
    onSave: () => toggleSave(l.id),
    onClick: () => onSelect(l),
    style: {
      outline: selected && selected.id === l.id ? '3px solid var(--base-color-amber-500)' : 'none',
      outlineOffset: 4,
      borderRadius: 'var(--radius-comfortable)'
    }
  })))))));
}
Object.assign(window, {
  Library
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/macos_app/Library.jsx", error: String((e && e.message) || e) }); }

// ui_kits/macos_app/MacApp.jsx
try { (() => {
const {
  Sidebar,
  Toast,
  Dialog,
  Button,
  IconButton
} = window.WayfareDesignSystem_8d1d8a;
function App() {
  const [view, setView] = React.useState('nordic');
  const [mode, setMode] = React.useState('Grid');
  const [selected, setSelected] = React.useState(window.WF_LOGS[1]);
  const [saved, setSaved] = React.useState({
    fjord: true
  });
  const [toast, setToast] = React.useState(null);
  const [confirm, setConfirm] = React.useState(false);
  const [compose, setCompose] = React.useState(false);
  const flash = m => {
    setToast(m);
    setTimeout(() => setToast(null), 2200);
  };
  const toggleSave = id => {
    setSaved(s => ({
      ...s,
      [id]: !s[id]
    }));
    flash(saved[id] ? 'Removed from Saved' : 'Saved to Nordic summer');
  };
  return /*#__PURE__*/React.createElement(MacWindow, null, /*#__PURE__*/React.createElement(Toolbar, {
    mode: mode,
    setMode: setMode,
    onCompose: () => setCompose(true)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      minHeight: 0,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement(Sidebar, {
    width: 230,
    title: "Wayfare",
    value: view,
    onChange: setView,
    sections: [{
      label: 'Library',
      items: [{
        value: 'all',
        label: 'All logs',
        icon: ICON('book-open'),
        count: 24
      }, {
        value: 'saved',
        label: 'Saved',
        icon: ICON('bookmark'),
        count: 112
      }, {
        value: 'recent',
        label: 'Recently added',
        icon: ICON('clock')
      }, {
        value: 'places',
        label: 'Places',
        icon: ICON('globe'),
        count: 9
      }]
    }, {
      label: 'Trips',
      items: [{
        value: 'nordic',
        label: 'Nordic summer',
        icon: ICON('route')
      }, {
        value: 'kansai',
        label: 'Kansai in autumn',
        icon: ICON('route')
      }, {
        value: 'home',
        label: 'Weekends at home',
        icon: ICON('house')
      }]
    }, {
      label: 'Tags',
      items: [{
        value: 'coastal',
        label: 'Coastal',
        icon: ICON('tag')
      }, {
        value: 'hiking',
        label: 'Hiking',
        icon: ICON('tag')
      }, {
        value: 'food',
        label: 'Food',
        icon: ICON('tag')
      }]
    }],
    footer: /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '0 8px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 30,
        height: 30,
        borderRadius: '50%',
        background: window.WF_PHOTO(3)
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        font: 'var(--text-caption)',
        fontWeight: 700,
        flex: 1
      }
    }, "Ines H."), /*#__PURE__*/React.createElement(IconButton, {
      label: "Settings",
      size: "sm",
      variant: "ghost",
      icon: /*#__PURE__*/React.createElement(Glyph, {
        name: "settings",
        size: 16
      })
    }))
  }), /*#__PURE__*/React.createElement(Library, {
    mode: mode,
    selected: selected,
    onSelect: setSelected,
    saved: saved,
    toggleSave: toggleSave
  }), /*#__PURE__*/React.createElement(Inspector, {
    log: selected,
    saved: selected && !!saved[selected.id],
    toggleSave: () => selected && toggleSave(selected.id),
    onDelete: () => setConfirm(true)
  }), toast && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 24,
      display: 'flex',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Toast, {
    message: toast,
    action: "Undo",
    onAction: () => setToast(null)
  }))), confirm && /*#__PURE__*/React.createElement(Dialog, {
    open: true,
    title: "Delete this log?",
    description: "Its photos stay in your library.",
    onClose: () => setConfirm(false),
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "md",
      onClick: () => setConfirm(false)
    }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
      size: "md",
      onClick: () => {
        setConfirm(false);
        flash('Log deleted');
      }
    }, "Delete"))
  }), compose && /*#__PURE__*/React.createElement(Dialog, {
    open: true,
    width: 480,
    title: "New log",
    description: "Drop photos here and we\u2019ll read the place and date from them.",
    onClose: () => setCompose(false),
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "md",
      onClick: () => setCompose(false)
    }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
      size: "md",
      onClick: () => {
        setCompose(false);
        flash('Log saved');
      }
    }, "Save log"))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      border: '2px dashed var(--sema-color-border-default)',
      borderRadius: 'var(--radius-section)',
      padding: '36px 20px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement(Glyph, {
    name: "upload",
    size: 26,
    color: "var(--sema-color-text-subtle)"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--text-body)',
      fontWeight: 700,
      marginTop: 10
    }
  }, "Drop photos to start a log"), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--text-caption)',
      color: 'var(--sema-color-text-subtle)',
      marginTop: 4
    }
  }, "JPEG, HEIC or RAW \xB7 up to 200 at a time"))));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/macos_app/MacApp.jsx", error: String((e && e.message) || e) }); }

// ui_kits/macos_app/MacChrome.jsx
try { (() => {
const ICON = n => '../../assets/icons/' + n + '.svg';
function Glyph({
  name,
  size = 18,
  color = 'var(--sema-color-text-default)'
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      width: size,
      height: size,
      display: 'inline-block',
      flex: '0 0 auto',
      background: color,
      WebkitMask: `center/${size}px no-repeat url(${ICON(name)})`,
      mask: `center/${size}px no-repeat url(${ICON(name)})`
    }
  });
}
function MacWindow({
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: 1280,
      height: 800,
      borderRadius: 12,
      overflow: 'hidden',
      background: '#fff',
      boxShadow: '0 30px 90px rgba(33,25,34,.28)',
      display: 'flex',
      flexDirection: 'column'
    }
  }, children);
}
function TrafficLights() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'center'
    }
  }, ['#ff5f57', '#febc2e', '#28c840'].map(c => /*#__PURE__*/React.createElement("span", {
    key: c,
    style: {
      width: 12,
      height: 12,
      borderRadius: '50%',
      background: c
    }
  })));
}
Object.assign(window, {
  ICON,
  Glyph,
  MacWindow,
  TrafficLights
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/macos_app/MacChrome.jsx", error: String((e && e.message) || e) }); }

// ui_kits/macos_app/Toolbar.jsx
try { (() => {
const {
  Input,
  Tabs,
  IconButton,
  Button,
  Tooltip
} = window.WayfareDesignSystem_8d1d8a;
function Toolbar({
  mode,
  setMode,
  onCompose
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '10px 16px',
      borderBottom: '1px solid var(--sema-color-border-subtle)',
      background: 'var(--sema-color-background-page)'
    }
  }, /*#__PURE__*/React.createElement(TrafficLights, null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4,
      marginLeft: 8
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    label: "Back",
    size: "sm",
    variant: "ghost",
    icon: /*#__PURE__*/React.createElement(Glyph, {
      name: "chevron-left",
      size: 16
    })
  }), /*#__PURE__*/React.createElement(IconButton, {
    label: "Forward",
    size: "sm",
    variant: "ghost",
    icon: /*#__PURE__*/React.createElement(Glyph, {
      name: "chevron-right",
      size: 16
    })
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      maxWidth: 420
    }
  }, /*#__PURE__*/React.createElement(Input, {
    placeholder: "Search all logs",
    iconStart: /*#__PURE__*/React.createElement(Glyph, {
      name: "search",
      size: 16,
      color: "var(--sema-color-text-subtle)"
    })
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(Tabs, {
    variant: "segmented",
    items: ['Grid', 'List', 'Map'],
    value: mode,
    onChange: setMode
  }), /*#__PURE__*/React.createElement(Tooltip, {
    label: "Filter"
  }, /*#__PURE__*/React.createElement(IconButton, {
    label: "Filter",
    size: "sm",
    icon: /*#__PURE__*/React.createElement(Glyph, {
      name: "sliders-horizontal",
      size: 16
    })
  })), /*#__PURE__*/React.createElement(Tooltip, {
    label: "Share"
  }, /*#__PURE__*/React.createElement(IconButton, {
    label: "Share",
    size: "sm",
    icon: /*#__PURE__*/React.createElement(Glyph, {
      name: "share",
      size: 16
    })
  })), /*#__PURE__*/React.createElement(Button, {
    size: "md",
    iconStart: /*#__PURE__*/React.createElement(Glyph, {
      name: "plus",
      size: 16
    }),
    onClick: onCompose
  }, "New log"));
}
Object.assign(window, {
  Toolbar
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/macos_app/Toolbar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/macos_app/photos.js
try { (() => {
// Warm placeholder photography. No real imagery was supplied with the brief;
// these stand in for the photo layer and keep the palette warm.
window.WF_PHOTOS = ['linear-gradient(155deg,#dcd2c2,#a8a394)', 'linear-gradient(155deg,#cfd6d2,#7f8f88)', 'linear-gradient(155deg,#e7dcc8,#c2a98f)', 'linear-gradient(155deg,#d5cdd0,#8d7f86)', 'linear-gradient(155deg,#cbd7dd,#7c95a3)', 'linear-gradient(155deg,#e2d6cd,#b08e79)', 'linear-gradient(155deg,#d9ddcd,#8a9673)', 'linear-gradient(155deg,#efe4d6,#cdb59b)'];
window.WF_PHOTO = i => window.WF_PHOTOS[i % window.WF_PHOTOS.length];
window.WF_LOGS = [{
  id: 'aero',
  title: 'Ferry to Ærø',
  place: 'Denmark',
  meta: '14 Jun · 6 photos',
  h: 240,
  tags: ['Coastal', 'Slow travel']
}, {
  id: 'fjord',
  title: 'Morning on the fjord',
  place: 'Norway',
  meta: '17 Jun · 11 photos',
  h: 320,
  tags: ['Hiking']
}, {
  id: 'market',
  title: 'Saturday market',
  place: 'Malmö',
  meta: '19 Jun · 8 photos',
  h: 200,
  tags: ['Food']
}, {
  id: 'dunes',
  title: 'Dunes at Skagen',
  place: 'Denmark',
  meta: '21 Jun · 14 photos',
  h: 280,
  tags: ['Coastal']
}, {
  id: 'tram',
  title: 'Last tram home',
  place: 'Gothenburg',
  meta: '23 Jun · 4 photos',
  h: 220,
  tags: ['City']
}, {
  id: 'cabin',
  title: 'A cabin with no road',
  place: 'Sweden',
  meta: '25 Jun · 19 photos',
  h: 300,
  tags: ['Hiking', 'Slow travel']
}];
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/macos_app/photos.js", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.PhotoCard = __ds_scope.PhotoCard;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Dialog = __ds_scope.Dialog;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Tooltip = __ds_scope.Tooltip;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Radio = __ds_scope.Radio;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.NavBar = __ds_scope.NavBar;

__ds_ns.Sidebar = __ds_scope.Sidebar;

__ds_ns.TabBar = __ds_scope.TabBar;

__ds_ns.Tabs = __ds_scope.Tabs;

})();
