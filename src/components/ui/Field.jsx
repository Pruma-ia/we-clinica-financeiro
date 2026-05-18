import { TXT, SUB, BDR, WHITE, RED } from '../../constants/colors.js'

const labelStyle = { fontSize: 13, color: TXT, fontWeight: 500, marginBottom: 6, display: 'block' }
const hintStyle  = { fontSize: 11, color: SUB, marginTop: 4 }
const fieldBase  = {
  width: '100%', padding: '11px 14px', borderRadius: 10,
  border: `1px solid ${BDR}`, background: WHITE, fontSize: 14, color: TXT,
  outline: 'none',
}

export function Inp({
  label, value, onChange, type = 'text', required = false, hint, placeholder,
  disabled = false, min, step, style = {},
}) {
  return (
    <div style={{ marginBottom: 14, ...style }}>
      {label && (
        <label style={labelStyle}>
          {label} {required && <span style={{ color: RED }}>*</span>}
        </label>
      )}
      <input
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        step={step}
        style={{
          ...fieldBase,
          background: disabled ? '#F5F5F2' : WHITE,
          cursor: disabled ? 'not-allowed' : 'text',
        }}
      />
      {hint && <div style={hintStyle}>{hint}</div>}
    </div>
  )
}

export function Sel({
  label, value, onChange, options = [], required = false, hint, placeholder = 'Selecionar…',
  disabled = false, style = {},
}) {
  return (
    <div style={{ marginBottom: 14, ...style }}>
      {label && (
        <label style={labelStyle}>
          {label} {required && <span style={{ color: RED }}>*</span>}
        </label>
      )}
      <select
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        style={{
          ...fieldBase,
          background: disabled ? '#F5F5F2' : WHITE,
          cursor: disabled ? 'not-allowed' : 'pointer',
          appearance: 'auto',
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.v} value={o.v}>{o.l}</option>
        ))}
      </select>
      {hint && <div style={hintStyle}>{hint}</div>}
    </div>
  )
}

export function TxA({ label, value, onChange, hint, rows = 3, style = {} }) {
  return (
    <div style={{ marginBottom: 14, ...style }}>
      {label && <label style={labelStyle}>{label}</label>}
      <textarea
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
        rows={rows}
        style={{ ...fieldBase, resize: 'vertical', fontFamily: 'inherit' }}
      />
      {hint && <div style={hintStyle}>{hint}</div>}
    </div>
  )
}
