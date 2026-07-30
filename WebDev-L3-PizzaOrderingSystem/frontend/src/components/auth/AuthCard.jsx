function AuthCard({ title, subtitle, children }) {
  return (
    <div className="auth-card">
      <h1 className="auth-card__title">{title}</h1>
      {subtitle && <p className="auth-card__subtitle">{subtitle}</p>}
      {children}
    </div>
  );
}

export default AuthCard;
