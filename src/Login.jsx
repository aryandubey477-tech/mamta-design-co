import { useState } from "react";

function Login() {
  const [mode, setMode] = useState("login");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (mode === "signup") {
      try {
        const response = await fetch(
          "`${import.meta.env.VITE_API_URL}/api/users/register`",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(form),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Unable to create account.");
          return;
        }

        setMessage("Account created successfully!");

        setForm({
          name: "",
          email: "",
          phone: "",
          password: "",
        });

        setTimeout(() => {
          setMode("login");
          setMessage("");
        }, 1500);
      } catch (error) {
        console.error("Registration error:", error);
        setError(
          "Unable to connect to the server. Please try again."
        );
      }

      return;
    }

    try {
  const response = await fetch(
    "fetch(`${import.meta.env.VITE_API_URL}/api/users/login`, {",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: form.email,
        password: form.password,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    setError(data.message || "Invalid email or password.");
    return;
  }

  setMessage("Login successful!");

  localStorage.setItem(
    "mamtaUser",
    JSON.stringify(data.user)
  );

  setTimeout(() => {
    window.location.href = "/";
  }, 800);

} catch (error) {
  console.error("Login error:", error);

  setError(
    "Unable to connect to the server. Please try again."
  );
}


  };

  return (
    <div className="login-page">

      <div className="login-container">

        <div className="login-brand">
          MAMTA DESIGN CO.
        </div>

        <div className="login-heading">
          <p>
            {mode === "login"
              ? "WELCOME BACK"
              : "WELCOME TO MAMTA DESIGN CO."}
          </p>

          <h1>
            {mode === "login"
              ? "Sign in."
              : "Create account."}
          </h1>
        </div>

        <form onSubmit={handleSubmit}>

          {mode === "signup" && (
            <div className="login-field">
              <label>FULL NAME</label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                required
              />
            </div>
          )}

          <div className="login-field">
            <label>EMAIL</label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>

          {mode === "signup" && (
            <div className="login-field">
              <label>PHONE NUMBER</label>

              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Your phone number"
                required
              />
            </div>
          )}

          <div className="login-field">
            <label>PASSWORD</label>

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <p className="login-error">
              {error}
            </p>
          )}

          {message && (
            <p className="login-success">
              {message}
            </p>
          )}

          <button
            type="submit"
            className="login-submit"
          >
            {mode === "login"
              ? "SIGN IN"
              : "CREATE ACCOUNT"}
          </button>

        </form>

        <div className="login-switch">

          <span>
            {mode === "login"
              ? "Don't have an account?"
              : "Already have an account?"}
          </span>

          <button
            type="button"
            onClick={() => {
              setMode(
                mode === "login"
                  ? "signup"
                  : "login"
              );
              setError("");
              setMessage("");
            }}
          >
            {mode === "login"
              ? "Create account"
              : "Sign in"}
          </button>

        </div>

      </div>

    </div>
  );
}

export default Login;