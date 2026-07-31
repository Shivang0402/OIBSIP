function PrimaryButton({ children, type = 'button', loading = false, disabled = false, ...props }) {
  return (
    <button type={type} className="primary-button" disabled={disabled || loading} {...props}>
      {loading && <span className="primary-button__spinner" aria-hidden="true" />}
      {children}
    </button>
  );
}

export default PrimaryButton;
