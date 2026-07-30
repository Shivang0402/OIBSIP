function PrimaryButton({ children, type = 'button', disabled = false, ...props }) {
  return (
    <button type={type} className="primary-button" disabled={disabled} {...props}>
      {children}
    </button>
  );
}

export default PrimaryButton;
