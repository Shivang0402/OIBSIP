function InputField({ label, id, type = 'text', placeholder, error, ...props }) {
  return (
    <div className="input-field">
      {label && <label htmlFor={id}>{label}</label>}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        className={error ? 'input-field__input--invalid' : ''}
        {...props}
      />
      {error && <p className="input-field__error">{error}</p>}
    </div>
  );
}

export default InputField;
