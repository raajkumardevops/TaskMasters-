import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../services/authService";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await loginUser({ email, password });
      localStorage.setItem("accessToken", data.accessToken);
      navigate("/dashboard");
    } catch {
      setError("Login failed");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  const handleGithubLogin = () => {
    window.location.href = "http://localhost:5000/api/auth/github";
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 400 }}>
      <h3 className="text-center mb-3">TaskMaster Login</h3>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <input
          className="form-control mb-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="form-control mb-2"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="btn btn-primary w-100 mb-2">
          Login
        </button>
      </form>

      <div className="text-center">OR</div>

      <div className="d-flex gap-2 mt-2">
        <button className="btn btn-outline-dark w-100" onClick={handleGoogleLogin}>
          Google
        </button>
        <button className="btn btn-outline-dark w-100" onClick={handleGithubLogin}>
          GitHub
        </button>
      </div>

      <div className="text-center mt-3">
        <Link to="/forgot-password">Forgot password?</Link>
      </div>
    </div>
  );
};

export default Login;
