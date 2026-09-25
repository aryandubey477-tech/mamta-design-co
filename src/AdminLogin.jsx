import React, { useState } from "react";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      console.log("ADMIN LOGIN RESPONSE:", data);

      if (data.success && data.token) {
        localStorage.setItem("adminToken", data.token);

        setMessage("Login successful! Redirecting...");

        setTimeout(() => {
          window.location.href = "/admin/products";
        }, 500);

        return;
      }

      setMessage(data.message || "Invalid admin email or password.");
    } catch (error) {
      console.error("Admin login error:", error);
      setMessage("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#F9F3E5",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#FFFDF8",
          padding: "40px",
          borderRadius: "16px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginBottom: "8px",
            color: "#4B352A",
          }}
        >
          MAMTA DESIGN CO.
        </h1>

        <p
          style={{
            textAlign: "center",
            marginBottom: "30px",
            color: "#5F4A3D",
          }}
        >
          Admin Login
        </p>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "14px",
              marginBottom: "15px",
              boxSizing: "border-box",
              border: "1px solid #E5D4B2",
              borderRadius: "8px",
              fontSize: "15px",
            }}
          />

          <input
            type="password"
            placeholder="Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "14px",
              marginBottom: "20px",
              boxSizing: "border-box",
              border: "1px solid #E5D4B2",
              borderRadius: "8px",
              fontSize: "15px",
            }}
          />

          {message && (
            <p
              style={{
                color: message.includes("successful") ? "green" : "#a33",
                textAlign: "center",
                marginBottom: "15px",
              }}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              border: "none",
              borderRadius: "8px",
              background: "#4B352A",
              color: "#FFFDF8",
              fontSize: "15px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "LOGGING IN..." : "ADMIN LOGIN"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;