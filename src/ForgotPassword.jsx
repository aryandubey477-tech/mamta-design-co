import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: trimmedEmail }),
        }
      );

      // Always show the generic success message regardless of response
      // This prevents email enumeration
      setSubmitted(true);
    } catch (err) {
      console.error("Forgot password request error:", err);
      // Still show the generic message to prevent enumeration
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="login-page">
        <div className="login-container">

          <div className="login-brand">
            MAMTA DESIGN CO.
          </div>

          <div className="login-heading">
            <p>PASSWORD RESET</p>
            <h1>Check your inbox.</h1>
          </div>

          <p className="forgot-info-text">
            If an account exists for{" "}
            <strong>{email.trim().toLowerCase()}</strong>, a password reset link
            has been sent. Please check your inbox and spam folder.
          </p>

          <p className="forgot-info-text" style={{ marginTop: "12px" }}>
            The link will expire in <strong>20 minutes</strong>.
          </p>

          <button
            type="button"
            className="login-submit"
            style={{ marginTop: "32px" }}
            onClick={() => navigate("/login")}
          >
            BACK TO SIGN IN
          </button>

          <div className="login-switch" style={{ marginTop: "20px" }}>
            <span>Didn&apos;t receive the email?</span>
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setEmail("");
              }}
            >
              Try again
            </button>
          </div>

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
          <h1>Forgot Password?</h1>
        </div>

        <p className="forgot-info-text">
          Enter the email address associated with your account and we&apos;ll
          send you a secure link to reset your password.
        </p>

        <form onSubmit={handleSubmit} style={{ marginTop: "28px" }}>

          <div className="login-field">
            <label>EMAIL ADDRESS</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              autoFocus
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
            {loading ? "SENDING..." : "SEND RESET LINK"}
          </button>

        </form>

        <div className="login-switch" style={{ marginTop: "28px" }}>
          <span>Remembered your password?</span>
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

export default ForgotPassword;
