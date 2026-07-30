import '../styles/Register.css';

function Register() {
  return (
    <div className="register-screen">
      <div className="register-card">
        <h1>Register</h1>
        <form className="register-form">
          <input type="text" placeholder="Name" required />
          <input type="email" placeholder="Email" required />
          <input type="password" placeholder="Password" required />
          <input type="password" placeholder="Confirm pass" required />
          <input type="tel" placeholder="Phone" required />
          <button type="submit">Register</button>
          <p>Already Registered? <a href="#">Login</a></p>
        </form>
      </div>
    </div>
  );
}

export default Register;