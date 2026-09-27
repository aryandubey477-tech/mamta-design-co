import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract token from URL path: /reset-password/<token>
  const token = location.pathname.replace("/reset-password/", "").split("/")[0].split("?")[0].trim();

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link. Please request a new password reset.");
    }
  }, [token]);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!token) {
      setError("Invalid reset link. Please request a new password reset.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            password: form.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            "This reset link is invalid or has expired. Please request a new one."
        );
        return;
      }

      setSuccess(true);
    } catch (err) {
      console.error("Reset password error:", err);
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="login-page">
        <div className="login-container">

          <div className="login-brand">
            MAMTA DESIGN CO.
          </div>

          <div className="login-heading">
            <p>SUCCESS</p>
            <h1>Password Reset.</h1>
          </div>

          <p className="forgot-info-text">
            Your password has been updated. You can now sign in with your new
            password.
          </p>

          <button
            type="button"
            className="login-submit"
            style={{ marginTop: "32px" }}
            onClick={() => navigate("/login")}
          >
            SIGN IN
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-container">

        <div className="login-brand">
          MAMTA DESIGN CO.
        </div>

        <div className="login-heading">
          <p>ACCOUNT RECOVERY</p>
          <h1>Reset Password.</h1>
        </div>

        <p className="forgot-info-text">
          Enter your new password below. Make sure it is at least 8 characters
          long.
        </p>

        <form onSubmit={handleSubmit} style={{ marginTop: "28px" }}>

          <div className="login-field">
            <label>NEW PASSWORD</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="At least 8 characters"
              required
              minLength={8}
              autoComplete="new-password"
              autoFocus
            />
          </div>

          <div className="login-field">
            <label>CONFIRM NEW PASSWORD</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat your new password"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          {error && (
            <p className="login-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            {loading ? "RESETTING..." : "RESET PASSWORD"}
          </button>

        </form>

        <div className="login-switch" style={{ marginTop: "28px" }}>
          <span>Remember your password?</span>
          <button
            type="button"
            onClick={() => navigate("/login")}
          >
            Back to Sign In
          </button>
        </div>

      </div>
    </div>
  );
}

export default ResetPassword;
