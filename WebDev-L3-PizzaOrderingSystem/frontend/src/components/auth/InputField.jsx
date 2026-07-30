function InputField({ label, id, type = 'text', placeholder, ...props }) {
  return (
    <div className="input-field">
      {label && <label htmlFor={id}>{label}</label>}
      <input id={id} type={type} placeholder={placeholder} {...props} />
    </div>
  );
}

export default InputField;
