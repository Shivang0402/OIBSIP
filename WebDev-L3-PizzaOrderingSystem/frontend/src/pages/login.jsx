import '../styles/Login.css';

function Login() {
  return (
    <div className="login-screen">
      <div className="login-card">
        <h1>Welcome back</h1>
        <form className="login-form">
          <input type="email" placeholder="Email" required />
          <input type="password" placeholder="Password" required />
          <button type="submit">Login</button>

          <div className="login-links">
            <p className="no-account">
              Don't have an account? <a href="#">Register</a>
            </p>
            <p className="forgot-link">
              <a href="#">Forgot Password?</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;