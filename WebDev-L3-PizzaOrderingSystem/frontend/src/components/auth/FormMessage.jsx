function FormMessage({ type = 'error', children }) {
  return <p className={`form-message form-message--${type}`}>{children}</p>;
}

export default FormMessage;
