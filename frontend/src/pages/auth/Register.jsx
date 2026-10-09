import React, { useEffect, useMemo, useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();

  const {
    register,
    isAuthenticated,
    loading: authLoading,
  } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [agreedTerms, setAgreedTerms] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [focusedField, setFocusedField] = useState("");

  /*
   * Redirect authenticated users.
   */
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate("/dashboard", {
        replace: true,
      });
    }
  }, [
    authLoading,
    isAuthenticated,
    navigate,
  ]);

  /*
   * Password strength.
   */
  const passwordStrength = useMemo(() => {
    const password = form.password;

    if (!password) {
      return {
        score: 0,
        label: "Not started",
      };
    }

    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) {
      return {
        score,
        label: "Weak",
      };
    }

    if (score === 3) {
      return {
        score,
        label: "Medium",
      };
    }

    if (score === 4) {
      return {
        score,
        label: "Strong",
      };
    }

    return {
      score,
      label: "Excellent",
    };
  }, [form.password]);

  /*
   * Password requirements.
   */
  const passwordRules = useMemo(
    () => [
      {
        label: "8+ characters",
        valid: form.password.length >= 8,
      },
      {
        label: "Uppercase",
        valid: /[A-Z]/.test(form.password),
      },
      {
        label: "Number",
        valid: /[0-9]/.test(form.password),
      },
      {
        label: "Special character",
        valid: /[^A-Za-z0-9]/.test(
          form.password
        ),
      },
    ],
    [form.password]
  );

  /*
   * Input change.
   */
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
    }
  };

  /*
   * Validation.
   */
  const validateForm = () => {
    const name = form.name.trim();
    const email = form.email.trim();
    const password = form.password;
    const confirmPassword =
      form.confirmPassword;

    if (!name) {
      return "Please enter your full name.";
    }

    if (name.length < 2) {
      return "Your name must contain at least 2 characters.";
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      return "Please enter your email address.";
    }

    if (!emailRegex.test(email)) {
      return "Please enter a valid email address.";
    }

    if (!password) {
      return "Please create a password.";
    }

    if (password.length < 6) {
      return "Password must contain at least 6 characters.";
    }

    if (passwordStrength.score < 3) {
      return "Please create a stronger password.";
    }

    if (!confirmPassword) {
      return "Please confirm your password.";
    }

    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }

    if (!agreedTerms) {
      return "Please accept the Terms of Service and Privacy Policy.";
    }

    return "";
  };

  /*
   * Backend error message.
   */
  const getErrorMessage = (err) => {
    const backendMessage =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.response?.data?.data?.message ||
      err?.message;

    if (
      typeof backendMessage === "string" &&
      backendMessage.trim()
    ) {
      return backendMessage;
    }

    return "Unable to create your account. Please try again.";
  };

  /*
   * Register.
   *
   * Uses AuthContext.register()
   * so ProtectedRoute stays synchronized.
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
    };

    try {
      setSubmitting(true);

      console.log(
        "ProblemLens Register Request:",
        {
          name: payload.name,
          email: payload.email,
        }
      );

      const result = await register(payload);

      console.log(
        "ProblemLens AuthContext Register Result:",
        result
      );

      /*
       * AuthContext register may return a token
       * and authenticate the user immediately.
       */
      const receivedToken =
        result?.token ||
        result?.accessToken ||
        result?.data?.token ||
        result?.data?.accessToken;

      if (receivedToken) {
        setSuccess(
          "Account created successfully. Opening your workspace..."
        );

        setTimeout(() => {
          navigate("/dashboard", {
            replace: true,
          });
        }, 600);

        return;
      }

      /*
       * If registration requires login after
       * account creation.
       */
      setSuccess(
        "Account created successfully. Redirecting to sign in..."
      );

      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: {
            registered: true,
            email: payload.email,
          },
        });
      }, 900);
    } catch (err) {
      console.error(
        "ProblemLens Register Error:",
        err
      );

      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * Initial auth loading.
   */
  if (authLoading) {
    return (
      <div className="problem-register-loading">
        <div className="problem-register-loader">
          <div className="problem-register-loader-ring" />

          <div className="problem-register-loader-core">
            PL
          </div>
        </div>

        <p>
          Initializing ProblemLens...
        </p>

        <style>{`
          .problem-register-loading {
            min-height: 100vh;

            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;

            gap: 20px;

            background:
              radial-gradient(
                circle at 20% 20%,
                rgba(37, 99, 235, 0.18),
                transparent 35%
              ),
              radial-gradient(
                circle at 80% 80%,
                rgba(124, 58, 237, 0.18),
                transparent 35%
              ),
              #060914;

            color: white;

            font-family:
              Inter,
              ui-sans-serif,
              system-ui,
              -apple-system,
              BlinkMacSystemFont,
              "Segoe UI",
              sans-serif;
          }

          .problem-register-loading p {
            margin: 0;

            color: rgba(255, 255, 255, 0.62);

            font-size: 14px;
          }

          .problem-register-loader {
            width: 72px;
            height: 72px;

            position: relative;

            display: grid;
            place-items: center;
          }

          .problem-register-loader-ring {
            position: absolute;
            inset: 0;

            border-radius: 50%;

            border:
              2px solid
              rgba(96, 165, 250, 0.16);

            border-top-color:
              #60a5fa;

            animation:
              registerLoaderSpin
              1s linear infinite;
          }

          .problem-register-loader-core {
            width: 48px;
            height: 48px;

            display: grid;
            place-items: center;

            border-radius: 15px;

            background:
              linear-gradient(
                135deg,
                #2563eb,
                #7c3aed
              );

            box-shadow:
              0 10px 40px
              rgba(37, 99, 235, 0.35);

            font-size: 12px;
            font-weight: 800;
            letter-spacing: 0.08em;
          }

          @keyframes registerLoaderSpin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <main className="problem-register-page">

      {/* Background */}
      <div className="problem-register-noise" />

      <div className="problem-register-orb problem-register-orb-one" />

      <div className="problem-register-orb problem-register-orb-two" />

      <div className="problem-register-orb problem-register-orb-three" />

      <div className="problem-register-grid" />

      {/* Main shell */}
      <section className="problem-register-shell">

        {/* =====================================================
            LEFT SIDE
        ===================================================== */}

        <div className="problem-register-visual">

          <div className="problem-register-visual-overlay" />

          {/* Brand */}

          <div className="problem-register-brand">

            <div className="problem-register-brand-icon">
              <span>PL</span>
            </div>

            <div>
              <strong>
                ProblemLens
              </strong>

              <small>
                Intelligence for better decisions
              </small>
            </div>

          </div>

          {/* Hero */}

          <div className="problem-register-visual-content">

            <div className="problem-register-eyebrow">

              <span className="problem-register-eyebrow-dot" />

              AI-POWERED DISCOVERY PLATFORM

            </div>

            <h1>
              Turn problems into
              <span>
                opportunities.
              </span>
            </h1>

            <p>
              Create your workspace to discover
              meaningful problems, analyze evidence,
              identify patterns, and transform insights
              into actionable opportunities.
            </p>

            {/* Features */}

            <div className="problem-register-feature-list">

              <RegisterFeature
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M12 3v18" />
                    <path d="M3 12h18" />
                    <path d="M5.5 5.5l13 13" />
                    <path d="M18.5 5.5l-13 13" />
                  </svg>
                }
                title="Intelligent Discovery"
                description="Find patterns hidden inside real-world evidence."
              />

              <RegisterFeature
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M4 19V5" />
                    <path d="M4 19h16" />
                    <path d="M7 15l3-4 3 2 5-7" />
                  </svg>
                }
                title="Evidence Intelligence"
                description="Connect evidence with measurable insights."
              />

              <RegisterFeature
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z" />
                    <path d="M9 12l2 2 4-5" />
                  </svg>
                }
                title="Explainable Analysis"
                description="Understand why an opportunity matters."
              />

            </div>

          </div>

          {/* Bottom */}

          <div className="problem-register-visual-footer">

            <div className="problem-register-status">

              <span className="problem-register-status-dot" />

              <span>
                AI systems online
              </span>

            </div>

            <span>
              Secure workspace
            </span>

          </div>

        </div>

        {/* =====================================================
            RIGHT SIDE
        ===================================================== */}

        <div className="problem-register-form-area">

          <div className="problem-register-card">

            {/* Mobile brand */}

            <div className="problem-register-mobile-brand">

              <div className="problem-register-brand-icon">
                <span>PL</span>
              </div>

              <div>
                <strong>
                  ProblemLens
                </strong>

                <small>
                  Opportunity Intelligence
                </small>
              </div>

            </div>

            {/* Header */}

            <div className="problem-register-header">

              <div className="problem-register-welcome">

                Create your workspace

                <span>✦</span>

              </div>

              <h2>
                Start your
                <span>
                  journey
                </span>
              </h2>

              <p>
                Create your ProblemLens account and
                start discovering meaningful
                opportunities.
              </p>

            </div>

            {/* Error */}

            {error && (
              <div
                className="
                  problem-register-alert
                  problem-register-alert-error
                "
              >

                <div className="problem-register-alert-icon">
                  !
                </div>

                <div>
                  <strong>
                    Registration unsuccessful
                  </strong>

                  <span>
                    {error}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setError("")
                  }
                  aria-label="Close error"
                >
                  ×
                </button>

              </div>
            )}

            {/* Success */}

            {success && (
              <div
                className="
                  problem-register-alert
                  problem-register-alert-success
                "
              >

                <div className="problem-register-success-icon">
                  ✓
                </div>

                <div>
                  <strong>
                    Account created
                  </strong>

                  <span>
                    {success}
                  </span>
                </div>

              </div>
            )}

            {/* Form */}

            <form
              className="problem-register-form"
              onSubmit={handleSubmit}
              noValidate
            >

              {/* Full name */}

              <div
                className={`
                  problem-register-field
                  ${
                    focusedField === "name"
                      ? "is-focused"
                      : ""
                  }
                  ${
                    form.name
                      ? "has-value"
                      : ""
                  }
                `}
              >

                <label htmlFor="register-name">
                  Full name
                </label>

                <div className="problem-register-input-wrap">

                  <div className="problem-register-input-icon">

                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <circle
                        cx="12"
                        cy="8"
                        r="3.5"
                      />

                      <path d="M5 20c.8-4 3.1-6 7-6s6.2 2 7 6" />
                    </svg>

                  </div>

                  <input
                    id="register-name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    onFocus={() =>
                      setFocusedField("name")
                    }
                    onBlur={() =>
                      setFocusedField("")
                    }
                    placeholder="Enter your full name"
                    autoComplete="name"
                    disabled={submitting}
                  />

                  {form.name.trim().length >=
                    2 && (
                    <div className="problem-register-valid-icon">
                      ✓
                    </div>
                  )}

                </div>

              </div>

              {/* Email */}

              <div
                className={`
                  problem-register-field
                  ${
                    focusedField === "email"
                      ? "is-focused"
                      : ""
                  }
                  ${
                    form.email
                      ? "has-value"
                      : ""
                  }
                `}
              >

                <label htmlFor="register-email">
                  Email address
                </label>

                <div className="problem-register-input-wrap">

                  <div className="problem-register-input-icon">

                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <rect
                        x="3"
                        y="5"
                        width="18"
                        height="14"
                        rx="2"
                      />

                      <path d="m3 7 9 6 9-6" />
                    </svg>

                  </div>

                  <input
                    id="register-email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    onFocus={() =>
                      setFocusedField("email")
                    }
                    onBlur={() =>
                      setFocusedField("")
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                    spellCheck="false"
                    disabled={submitting}
                  />

                  {form.email &&
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                      form.email
                    ) && (
                      <div className="problem-register-valid-icon">
                        ✓
                      </div>
                    )}

                </div>

              </div>

              {/* Password */}

              <div
                className={`
                  problem-register-field
                  ${
                    focusedField === "password"
                      ? "is-focused"
                      : ""
                  }
                `}
              >

                <label htmlFor="register-password">
                  Password
                </label>

                <div className="problem-register-input-wrap">

                  <div className="problem-register-input-icon">

                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <rect
                        x="5"
                        y="10"
                        width="14"
                        height="10"
                        rx="2"
                      />

                      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                    </svg>

                  </div>

                  <input
                    id="register-password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={form.password}
                    onChange={handleChange}
                    onFocus={() =>
                      setFocusedField("password")
                    }
                    onBlur={() =>
                      setFocusedField("")
                    }
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    disabled={submitting}
                  />

                  <button
                    type="button"
                    className="problem-register-password-toggle"
                    onClick={() =>
                      setShowPassword(
                        (previous) => !previous
                      )
                    }
                    disabled={submitting}
                  >
                    {showPassword ? (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="M3 3l18 18" />
                        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                        <path d="M9.9 4.3A10.8 10.8 0 0 1 12 4c5 0 8.8 3.2 10 8a11.7 11.7 0 0 1-2.1 4.1" />
                        <path d="M6.6 6.6A11.8 11.8 0 0 0 2 12c1.2 4.8 5 8 10 8 1.5 0 2.9-.3 4.1-.9" />
                      </svg>
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                        <circle
                          cx="12"
                          cy="12"
                          r="3"
                        />
                      </svg>
                    )}
                  </button>

                </div>

                {/* Strength */}

                {form.password && (
                  <div className="problem-register-password-strength">

                    <div className="problem-register-strength-bars">

                      {[1, 2, 3, 4, 5].map(
                        (bar) => (
                          <span
                            key={bar}
                            className={
                              bar <=
                              passwordStrength.score
                                ? "active"
                                : ""
                            }
                          />
                        )
                      )}

                    </div>

                    <span>
                      {passwordStrength.label}
                    </span>

                  </div>
                )}

                {/* Requirements */}

                {form.password && (
                  <div className="problem-register-password-rules">

                    {passwordRules.map(
                      (rule) => (
                        <div
                          key={rule.label}
                          className={
                            rule.valid
                              ? "valid"
                              : ""
                          }
                        >

                          <span>
                            {rule.valid
                              ? "✓"
                              : "•"}
                          </span>

                          {rule.label}

                        </div>
                      )
                    )}

                  </div>
                )}

              </div>

              {/* Confirm password */}

              <div
                className={`
                  problem-register-field
                  ${
                    focusedField ===
                    "confirmPassword"
                      ? "is-focused"
                      : ""
                  }
                `}
              >

                <label htmlFor="register-confirm">
                  Confirm password
                </label>

                <div className="problem-register-input-wrap">

                  <div className="problem-register-input-icon">

                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <rect
                        x="5"
                        y="10"
                        width="14"
                        height="10"
                        rx="2"
                      />

                      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                    </svg>

                  </div>

                  <input
                    id="register-confirm"
                    name="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      form.confirmPassword
                    }
                    onChange={handleChange}
                    onFocus={() =>
                      setFocusedField(
                        "confirmPassword"
                      )
                    }
                    onBlur={() =>
                      setFocusedField("")
                    }
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                    disabled={submitting}
                  />

                  <button
                    type="button"
                    className="problem-register-password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(
                        (previous) => !previous
                      )
                    }
                    disabled={submitting}
                  >
                    {showConfirmPassword ? (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="M3 3l18 18" />
                        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                        <path d="M9.9 4.3A10.8 10.8 0 0 1 12 4c5 0 8.8 3.2 10 8a11.7 11.7 0 0 1-2.1 4.1" />
                        <path d="M6.6 6.6A11.8 11.8 0 0 0 2 12c1.2 4.8 5 8 10 8 1.5 0 2.9-.3 4.1-.9" />
                      </svg>
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                        <circle
                          cx="12"
                          cy="12"
                          r="3"
                        />
                      </svg>
                    )}
                  </button>

                </div>

                {form.confirmPassword && (
                  <div
                    className={`
                      problem-register-match
                      ${
                        form.password ===
                        form.confirmPassword
                          ? "match"
                          : "not-match"
                      }
                    `}
                  >
                    {form.password ===
                    form.confirmPassword
                      ? "✓ Passwords match"
                      : "Passwords do not match"}
                  </div>
                )}

              </div>

              {/* Terms */}

              <label className="problem-register-checkbox">

                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(event) =>
                    setAgreedTerms(
                      event.target.checked
                    )
                  }
                  disabled={submitting}
                />

                <span className="problem-register-checkmark">
                  ✓
                </span>

                <span>
                  I agree to the{" "}
                  <button
                    type="button"
                    onClick={(event) =>
                      event.preventDefault()
                    }
                  >
                    Terms of Service
                  </button>{" "}
                  and{" "}
                  <button
                    type="button"
                    onClick={(event) =>
                      event.preventDefault()
                    }
                  >
                    Privacy Policy
                  </button>
                  .
                </span>

              </label>

              {/* Submit */}

              <button
                className={`
                  problem-register-submit
                  ${
                    submitting
                      ? "is-loading"
                      : ""
                  }
                  ${
                    success
                      ? "is-success"
                      : ""
                  }
                `}
                type="submit"
                disabled={submitting}
              >

                <span className="problem-register-submit-bg" />

                <span className="problem-register-submit-content">

                  {submitting ? (
                    <>
                      <span className="problem-register-spinner" />

                      <span>
                        Creating workspace...
                      </span>
                    </>
                  ) : success ? (
                    <>
                      <span className="problem-register-submit-success">
                        ✓
                      </span>

                      <span>
                        Workspace created
                      </span>
                    </>
                  ) : (
                    <>
                      <span>
                        Create your ProblemLens account
                      </span>

                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M5 12h14" />
                        <path d="m13 6 6 6-6 6" />
                      </svg>
                    </>
                  )}

                </span>

              </button>

            </form>

            {/* Login */}

            <div className="problem-register-login">

              <span>
                Already have an account?
              </span>

              <Link to="/login">
                Sign in
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14" />
                  <path d="m13 6 6 6-6 6" />
                </svg>
              </Link>

            </div>

            {/* Trust */}

            <div className="problem-register-trust">

              <div>

                <span className="problem-register-trust-icon">

                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <rect
                      x="5"
                      y="10"
                      width="14"
                      height="10"
                      rx="2"
                    />

                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>

                </span>

                <span>
                  Protected authentication
                </span>

              </div>

              <div>

                <span className="problem-register-trust-dot" />

                System operational

              </div>

            </div>

          </div>

        </div>

      </section>

      <style>{REGISTER_STYLES}</style>

    </main>
  );
}

/* =========================================================
   FEATURE
========================================================= */

function RegisterFeature({
  icon,
  title,
  description,
}) {
  return (
    <div className="problem-register-feature">

      <div className="problem-register-feature-icon">
        {icon}
      </div>

      <div>

        <strong>
          {title}
        </strong>

        <span>
          {description}
        </span>

      </div>

    </div>
  );
}

/* =========================================================
   PREMIUM REGISTER STYLES
   Designed to match Login.jsx
========================================================= */

const REGISTER_STYLES = `
* {
  box-sizing: border-box;
}

/* =========================================================
   PAGE
========================================================= */

.problem-register-page {
  min-height: 100vh;
  min-height: 100dvh;

  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;

  overflow: hidden;

  padding: 28px;

  color: #eef4ff;

  background:
    radial-gradient(
      circle at 12% 12%,
      rgba(37, 99, 235, 0.17),
      transparent 30%
    ),
    radial-gradient(
      circle at 86% 82%,
      rgba(124, 58, 237, 0.14),
      transparent 34%
    ),
    radial-gradient(
      circle at 55% 100%,
      rgba(34, 211, 238, 0.06),
      transparent 30%
    ),
    #060914;

  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}

/* =========================================================
   BACKGROUND
========================================================= */

.problem-register-page::before {
  content: "";

  position: absolute;
  inset: 0;

  pointer-events: none;

  background-image:
    linear-gradient(
      rgba(255,255,255,.018) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(255,255,255,.018) 1px,
      transparent 1px
    );

  background-size: 50px 50px;

  mask-image:
    linear-gradient(
      to bottom,
      black,
      transparent 85%
    );
}

.problem-register-noise {
  position: absolute;
  inset: 0;

  pointer-events: none;

  opacity: .035;

  background-image:
    url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.6'/%3E%3C/svg%3E");
}

.problem-register-grid {
  position: absolute;
  inset: 0;

  pointer-events: none;

  opacity: .22;

  background-image:
    linear-gradient(
      rgba(96,165,250,.035) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(96,165,250,.035) 1px,
      transparent 1px
    );

  background-size: 90px 90px;

  animation:
    registerGridMove
    20s linear infinite;
}

@keyframes registerGridMove {
  from {
    transform: translate3d(0,0,0);
  }

  to {
    transform: translate3d(90px,90px,0);
  }
}

.problem-register-orb {
  position: absolute;

  border-radius: 50%;

  pointer-events: none;

  animation:
    registerOrbFloat
    12s ease-in-out infinite;
}

.problem-register-orb-one {
  width: 380px;
  height: 380px;

  left: -150px;
  top: 5%;

  background:
    radial-gradient(
      circle,
      rgba(37,99,235,.14),
      transparent 68%
    );
}

.problem-register-orb-two {
  width: 440px;
  height: 440px;

  right: -180px;
  bottom: -150px;

  background:
    radial-gradient(
      circle,
      rgba(124,58,237,.13),
      transparent 68%
    );

  animation-delay: -4s;
}

.problem-register-orb-three {
  width: 230px;
  height: 230px;

  right: 20%;
  top: -130px;

  background:
    radial-gradient(
      circle,
      rgba(34,211,238,.07),
      transparent 68%
    );

  animation-delay: -7s;
}

@keyframes registerOrbFloat {
  0%,
  100% {
    transform:
      translate3d(0,0,0)
      scale(1);
  }

  50% {
    transform:
      translate3d(0,-25px,0)
      scale(1.04);
  }
}

/* =========================================================
   MAIN SHELL
========================================================= */

.problem-register-shell {
  position: relative;

  z-index: 5;

  width: min(1180px,100%);

  min-height: 720px;

  display: grid;

  grid-template-columns:
    .95fr
    1.05fr;

  overflow: hidden;

  border:
    1px solid
    rgba(255,255,255,.105);

  border-radius: 30px;

  background:
    linear-gradient(
      135deg,
      rgba(255,255,255,.055),
      rgba(255,255,255,.015)
    );

  box-shadow:
    0 40px 120px
      rgba(0,0,0,.55),
    0 0 0 1px
      rgba(59,130,246,.035),
    inset 0 1px 0
      rgba(255,255,255,.06);

  backdrop-filter:
    blur(28px);

  -webkit-backdrop-filter:
    blur(28px);

  animation:
    registerShellEnter
    .8s
    cubic-bezier(.22,1,.36,1);
}

@keyframes registerShellEnter {
  from {
    opacity: 0;

    transform:
      translateY(24px)
      scale(.98);
  }

  to {
    opacity: 1;

    transform:
      translateY(0)
      scale(1);
  }
}

/* =========================================================
   LEFT VISUAL
========================================================= */

.problem-register-visual {
  position: relative;

  min-height: 720px;

  display: flex;
  flex-direction: column;
  justify-content: space-between;

  padding: 42px;

  overflow: hidden;

  background:
    radial-gradient(
      circle at 15% 20%,
      rgba(59,130,246,.25),
      transparent 38%
    ),
    radial-gradient(
      circle at 90% 85%,
      rgba(139,92,246,.22),
      transparent 38%
    ),
    linear-gradient(
      145deg,
      #0a1833,
      #0a1022 48%,
      #0d0a20
    );

  border-right:
    1px solid
    rgba(255,255,255,.07);
}

.problem-register-visual::before {
  content: "";

  position: absolute;

  width: 520px;
  height: 520px;

  top: 18%;
  left: -240px;

  border-radius: 50%;

  border:
    1px solid
    rgba(96,165,250,.12);

  box-shadow:
    0 0 0 70px
      rgba(96,165,250,.018),
    0 0 0 140px
      rgba(96,165,250,.012);

  animation:
    registerVisualPulse
    8s ease-in-out infinite;
}

@keyframes registerVisualPulse {
  0%,
  100% {
    transform: scale(.98);
    opacity: .65;
  }

  50% {
    transform: scale(1.04);
    opacity: 1;
  }
}

.problem-register-visual-overlay {
  position: absolute;
  inset: 0;

  pointer-events: none;

  background:
    linear-gradient(
      115deg,
      transparent 30%,
      rgba(255,255,255,.025) 50%,
      transparent 70%
    );

  background-size: 250% 100%;

  animation:
    registerShimmer
    8s ease-in-out infinite;
}

@keyframes registerShimmer {
  0%,
  60% {
    background-position: 200% 0;
  }

  100% {
    background-position: -100% 0;
  }
}

/* =========================================================
   BRAND
========================================================= */

.problem-register-brand {
  position: relative;
  z-index: 2;

  display: flex;
  align-items: center;

  gap: 13px;
}

.problem-register-brand-icon {
  width: 45px;
  height: 45px;

  flex: 0 0 45px;

  display: grid;
  place-items: center;

  border-radius: 14px;

  background:
    linear-gradient(
      135deg,
      #2563eb,
      #6366f1 52%,
      #8b5cf6
    );

  box-shadow:
    0 12px 30px
      rgba(59,130,246,.3),
    inset 0 1px 1px
      rgba(255,255,255,.28);

  transform: rotate(-3deg);

  transition:
    transform .3s ease,
    box-shadow .3s ease;
}

.problem-register-brand:hover
.problem-register-brand-icon {
  transform:
    rotate(0)
    scale(1.06);
}

.problem-register-brand-icon span {
  color: white;

  font-size: 12px;

  font-weight: 900;

  letter-spacing: .08em;
}

.problem-register-brand strong {
  display: block;

  color: white;

  font-size: 15px;

  font-weight: 750;
}

.problem-register-brand small {
  display: block;

  margin-top: 2px;

  color:
    rgba(255,255,255,.45);

  font-size: 10px;
}

/* =========================================================
   LEFT HERO
========================================================= */

.problem-register-visual-content {
  position: relative;

  z-index: 2;

  max-width: 490px;

  margin-top: auto;
  margin-bottom: auto;

  padding:
    70px 0
    45px;
}

.problem-register-eyebrow {
  display: inline-flex;
  align-items: center;

  gap: 8px;

  padding:
    7px 11px;

  border:
    1px solid
    rgba(96,165,250,.16);

  border-radius: 999px;

  background:
    rgba(59,130,246,.07);

  color: #8dbbff;

  font-size: 9px;

  font-weight: 800;

  letter-spacing: .12em;
}

.problem-register-eyebrow-dot {
  width: 6px;
  height: 6px;

  border-radius: 50%;

  background: #60a5fa;

  box-shadow:
    0 0 0 4px
      rgba(96,165,250,.09),
    0 0 14px
      rgba(96,165,250,.8);

  animation:
    registerDotPulse
    2s ease-in-out infinite;
}

@keyframes registerDotPulse {
  0%,
  100% {
    opacity: .55;
  }

  50% {
    opacity: 1;
  }
}

.problem-register-visual-content h1 {
  margin:
    22px 0
    18px;

  color: white;

  font-size:
    clamp(36px,4vw,58px);

  line-height: 1.02;

  letter-spacing: -.055em;

  font-weight: 760;
}

.problem-register-visual-content h1 span {
  display: block;

  background:
    linear-gradient(
      100deg,
      #60a5fa,
      #a78bfa,
      #67e8f9
    );

  -webkit-background-clip: text;
  background-clip: text;

  color: transparent;

  background-size: 180% auto;

  animation:
    registerGradientText
    5s ease-in-out infinite;
}

@keyframes registerGradientText {
  0%,
  100% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }
}

.problem-register-visual-content > p {
  max-width: 450px;

  margin: 0;

  color:
    rgba(221,231,255,.58);

  font-size: 14px;

  line-height: 1.8;
}

/* =========================================================
   FEATURES
========================================================= */

.problem-register-feature-list {
  display: grid;

  gap: 13px;

  margin-top: 34px;
}

.problem-register-feature {
  display: flex;
  align-items: center;

  gap: 13px;

  padding: 12px;

  border:
    1px solid
    rgba(255,255,255,.055);

  border-radius: 14px;

  background:
    rgba(255,255,255,.025);

  transition:
    transform .3s ease,
    background .3s ease,
    border-color .3s ease;
}

.problem-register-feature:hover {
  transform: translateX(6px);

  background:
    rgba(255,255,255,.045);

  border-color:
    rgba(96,165,250,.14);
}

.problem-register-feature-icon {
  width: 35px;
  height: 35px;

  flex: 0 0 35px;

  display: grid;
  place-items: center;

  border-radius: 10px;

  background:
    linear-gradient(
      135deg,
      rgba(59,130,246,.16),
      rgba(139,92,246,.1)
    );

  color: #82b6ff;
}

.problem-register-feature-icon svg {
  width: 17px;
  height: 17px;
}

.problem-register-feature strong {
  display: block;

  margin-bottom: 2px;

  color:
    rgba(255,255,255,.86);

  font-size: 11px;

  font-weight: 700;
}

.problem-register-feature span {
  display: block;

  color:
    rgba(214,225,250,.43);

  font-size: 10px;

  line-height: 1.45;
}

/* =========================================================
   LEFT FOOTER
========================================================= */

.problem-register-visual-footer {
  position: relative;
  z-index: 2;

  display: flex;
  align-items: center;
  justify-content: space-between;

  color:
    rgba(255,255,255,.34);

  font-size: 9px;

  font-weight: 600;
}

.problem-register-status {
  display: flex;
  align-items: center;

  gap: 7px;
}

.problem-register-status-dot {
  width: 6px;
  height: 6px;

  border-radius: 50%;

  background: #34d399;

  box-shadow:
    0 0 10px
      rgba(52,211,153,.8);
}

/* =========================================================
   RIGHT AREA
========================================================= */

.problem-register-form-area {
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 40px 52px;

  background:
    linear-gradient(
      135deg,
      rgba(255,255,255,.025),
      rgba(255,255,255,.005)
    );
}

.problem-register-card {
  width: min(460px,100%);

  animation:
    registerCardEnter
    .7s
    cubic-bezier(.22,1,.36,1);
}

@keyframes registerCardEnter {
  from {
    opacity: 0;

    transform:
      translateY(18px)
      scale(.985);
  }

  to {
    opacity: 1;

    transform:
      translateY(0)
      scale(1);
  }
}

.problem-register-mobile-brand {
  display: none;
}

/* =========================================================
   HEADER
========================================================= */

.problem-register-header {
  margin-bottom: 24px;
}

.problem-register-welcome {
  display: inline-flex;
  align-items: center;

  gap: 7px;

  margin-bottom: 10px;

  color: #6faaff;

  font-size: 10px;

  font-weight: 800;

  letter-spacing: .1em;

  text-transform: uppercase;
}

.problem-register-welcome span {
  color: #a78bfa;

  animation:
    registerStar
    2.2s ease-in-out infinite;
}

@keyframes registerStar {
  0%,
  100% {
    transform: scale(.9);
    opacity: .55;
  }

  50% {
    transform: scale(1.15);
    opacity: 1;
  }
}

.problem-register-header h2 {
  margin: 0;

  color: white;

  font-size:
    clamp(28px,3vw,37px);

  line-height: 1.1;

  letter-spacing: -.045em;

  font-weight: 760;
}

.problem-register-header h2 span {
  color: #8dbbff;
}

.problem-register-header p {
  max-width: 410px;

  margin:
    11px 0 0;

  color: #8e9ab1;

  font-size: 12px;

  line-height: 1.7;
}

/* =========================================================
   ALERT
========================================================= */

.problem-register-alert {
  display: flex;
  align-items: flex-start;

  gap: 10px;

  margin-bottom: 16px;

  padding: 11px;

  border-radius: 13px;

  animation:
    registerAlertIn
    .35s ease;
}

@keyframes registerAlertIn {
  from {
    opacity: 0;

    transform:
      translateY(-6px);
  }

  to {
    opacity: 1;

    transform:
      translateY(0);
  }
}

.problem-register-alert-error {
  border:
    1px solid
    rgba(251,113,133,.18);

  background:
    rgba(251,113,133,.065);
}

.problem-register-alert-success {
  border:
    1px solid
    rgba(52,211,153,.18);

  background:
    rgba(52,211,153,.065);
}

.problem-register-alert-icon,
.problem-register-success-icon {
  width: 27px;
  height: 27px;

  flex: 0 0 27px;

  display: grid;
  place-items: center;

  border-radius: 8px;

  font-size: 11px;

  font-weight: 900;
}

.problem-register-alert-icon {
  color: #fb7185;

  background:
    rgba(251,113,133,.12);
}

.problem-register-success-icon {
  color: #34d399;

  background:
    rgba(52,211,153,.12);
}

.problem-register-alert > div:nth-child(2) {
  flex: 1;
  min-width: 0;
}

.problem-register-alert strong {
  display: block;

  margin-bottom: 2px;

  color:
    rgba(255,255,255,.82);

  font-size: 10px;
}

.problem-register-alert span {
  display: block;

  color: #8e9ab1;

  font-size: 9px;

  line-height: 1.5;
}

.problem-register-alert button {
  border: 0;

  background: transparent;

  color:
    rgba(255,255,255,.4);

  cursor: pointer;

  font-size: 18px;
}

/* =========================================================
   FORM
========================================================= */

.problem-register-form {
  display: grid;

  gap: 15px;
}

.problem-register-field {
  position: relative;
}

.problem-register-field label {
  display: block;

  margin-bottom: 7px;

  color: #aab5c8;

  font-size: 10px;

  font-weight: 700;

  transition: color .2s ease;
}

.problem-register-field.is-focused label {
  color: #79adff;
}

/* =========================================================
   INPUT
========================================================= */

.problem-register-input-wrap {
  position: relative;

  display: flex;
  align-items: center;

  height: 51px;

  border:
    1px solid
    rgba(255,255,255,.085);

  border-radius: 14px;

  background:
    rgba(4,8,19,.48);

  overflow: hidden;

  transition:
    border-color .25s ease,
    background .25s ease,
    box-shadow .25s ease;
}

.problem-register-field.is-focused
.problem-register-input-wrap {
  border-color:
    rgba(96,165,250,.48);

  background:
    rgba(7,14,30,.7);

  box-shadow:
    0 0 0 3px
      rgba(59,130,246,.08),
    0 10px 30px
      rgba(0,0,0,.12);
}

.problem-register-input-icon {
  width: 47px;

  flex: 0 0 47px;

  display: grid;
  place-items: center;

  color: #586780;

  transition: color .2s ease;
}

.problem-register-input-icon svg {
  width: 17px;
  height: 17px;
}

.problem-register-field.is-focused
.problem-register-input-icon {
  color: #6faaff;
}

.problem-register-input-wrap input {
  min-width: 0;

  flex: 1;

  height: 100%;

  border: 0;
  outline: 0;

  padding:
    0 8px 0 0;

  background: transparent;

  color: white;

  font-family: inherit;

  font-size: 12px;

  caret-color: #60a5fa;
}

.problem-register-input-wrap input::placeholder {
  color: #4d5a70;
}

.problem-register-input-wrap input:-webkit-autofill,
.problem-register-input-wrap input:-webkit-autofill:hover,
.problem-register-input-wrap input:-webkit-autofill:focus {
  -webkit-text-fill-color: white;

  box-shadow:
    0 0 0 1000px
    #0a1020
    inset;
}

.problem-register-valid-icon {
  width: 24px;
  height: 24px;

  margin-right: 10px;

  flex: 0 0 24px;

  display: grid;
  place-items: center;

  border-radius: 50%;

  background:
    rgba(52,211,153,.1);

  color: #34d399;

  font-size: 10px;
  font-weight: 900;

  animation:
    registerValidPop
    .25s ease;
}

@keyframes registerValidPop {
  from {
    transform: scale(.6);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* =========================================================
   PASSWORD BUTTON
========================================================= */

.problem-register-password-toggle {
  width: 43px;
  height: 100%;

  flex: 0 0 43px;

  display: grid;
  place-items: center;

  border: 0;

  background: transparent;

  color: #59677e;

  cursor: pointer;

  transition:
    color .2s ease,
    transform .2s ease;
}

.problem-register-password-toggle:hover {
  color: #9cbfff;
}

.problem-register-password-toggle:active {
  transform: scale(.9);
}

.problem-register-password-toggle svg {
  width: 17px;
  height: 17px;
}

/* =========================================================
   PASSWORD STRENGTH
========================================================= */

.problem-register-password-strength {
  display: flex;
  align-items: center;

  gap: 9px;

  margin-top: 7px;
}

.problem-register-strength-bars {
  flex: 1;

  display: grid;

  grid-template-columns:
    repeat(5,1fr);

  gap: 4px;
}

.problem-register-strength-bars span {
  height: 3px;

  border-radius: 999px;

  background:
    rgba(255,255,255,.07);

  transition:
    background .25s ease,
    transform .25s ease;
}

.problem-register-strength-bars span.active {
  background:
    linear-gradient(
      90deg,
      #3b82f6,
      #8b5cf6
    );

  transform:
    scaleY(1.35);
}

.problem-register-password-strength > span {
  min-width: 48px;

  color: #637088;

  font-size: 8px;

  font-weight: 700;

  text-align: right;
}

/* =========================================================
   PASSWORD RULES
========================================================= */

.problem-register-password-rules {
  display: grid;

  grid-template-columns:
    repeat(2,1fr);

  gap: 5px 12px;

  margin-top: 7px;
}

.problem-register-password-rules div {
  color: #4d5a70;

  font-size: 7px;

  transition:
    color .25s ease;
}

.problem-register-password-rules div span {
  margin-right: 5px;

  color: #475569;
}

.problem-register-password-rules div.valid {
  color: #8493aa;
}

.problem-register-password-rules div.valid span {
  color: #34d399;
}

/* =========================================================
   MATCH
========================================================= */

.problem-register-match {
  margin-top: 6px;

  font-size: 8px;

  font-weight: 700;
}

.problem-register-match.match {
  color: #34d399;
}

.problem-register-match.not-match {
  color: #fb7185;
}

/* =========================================================
   TERMS
========================================================= */

.problem-register-checkbox {
  position: relative;

  display: flex;
  align-items: flex-start;

  gap: 8px;

  margin-top: 1px;

  color: #758198;

  font-size: 8px;

  line-height: 1.6;

  cursor: pointer;

  user-select: none;
}

.problem-register-checkbox input {
  position: absolute;

  opacity: 0;

  pointer-events: none;
}

.problem-register-checkmark {
  width: 15px;
  height: 15px;

  flex: 0 0 15px;

  display: grid;
  place-items: center;

  border:
    1px solid
    rgba(255,255,255,.14);

  border-radius: 5px;

  background:
    rgba(255,255,255,.025);

  color: transparent;

  font-size: 8px;

  transition:
    background .2s ease,
    border-color .2s ease,
    color .2s ease;
}

.problem-register-checkbox
input:checked
+ .problem-register-checkmark {
  border-color: #4f8ffb;

  background:
    linear-gradient(
      135deg,
      #2563eb,
      #7c3aed
    );

  color: white;
}

.problem-register-checkbox
span:last-child {
  flex: 1;
}

.problem-register-checkbox button {
  padding: 0;

  border: 0;

  background: transparent;

  color: #78adff;

  font: inherit;

  font-weight: 700;

  cursor: pointer;
}

/* =========================================================
   BUTTON
========================================================= */

.problem-register-submit {
  position: relative;

  width: 100%;
  height: 55px;

  display: flex;
  align-items: center;
  justify-content: center;

  overflow: hidden;

  border: 0;

  border-radius: 14px;

  background:
    linear-gradient(
      100deg,
      #2563eb,
      #4f46e5 52%,
      #7c3aed
    );

  color: white;

  cursor: pointer;

  box-shadow:
    0 15px 35px
      rgba(37,99,235,.2),
    inset 0 1px 1px
      rgba(255,255,255,.18);

  transition:
    transform .25s ease,
    box-shadow .25s ease,
    filter .25s ease;
}

.problem-register-submit:hover:not(:disabled) {
  transform: translateY(-2px);

  box-shadow:
    0 20px 45px
      rgba(37,99,235,.3),
    inset 0 1px 1px
      rgba(255,255,255,.2);

  filter: brightness(1.06);
}

.problem-register-submit:active:not(:disabled) {
  transform:
    translateY(0)
    scale(.99);
}

.problem-register-submit:disabled {
  cursor: not-allowed;

  opacity: .78;
}

.problem-register-submit-bg {
  position: absolute;
  inset: 0;

  background:
    linear-gradient(
      110deg,
      transparent 20%,
      rgba(255,255,255,.17) 45%,
      transparent 70%
    );

  background-size: 220% 100%;

  animation:
    registerButtonShimmer
    4s ease-in-out infinite;
}

@keyframes registerButtonShimmer {
  0%,
  45% {
    background-position: 200% 0;
  }

  75%,
  100% {
    background-position: -100% 0;
  }
}

.problem-register-submit-content {
  position: relative;

  z-index: 2;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: 9px;

  padding: 0 14px;

  text-align: center;

  font-size: 10px;

  font-weight: 750;
}

.problem-register-submit-content svg {
  width: 16px;
  height: 16px;

  flex: 0 0 auto;

  transition:
    transform .25s ease;
}

.problem-register-submit:hover
.problem-register-submit-content
svg {
  transform:
    translateX(3px);
}

.problem-register-spinner {
  width: 16px;
  height: 16px;

  border:
    2px solid
    rgba(255,255,255,.28);

  border-top-color: white;

  border-radius: 50%;

  animation:
    registerSpin
    .75s linear infinite;
}

@keyframes registerSpin {
  to {
    transform: rotate(360deg);
  }
}

.problem-register-submit-success {
  width: 19px;
  height: 19px;

  display: grid;
  place-items: center;

  border-radius: 50%;

  background:
    rgba(255,255,255,.16);
}

/* =========================================================
   LOGIN LINK
========================================================= */

.problem-register-login {
  display: flex;
  align-items: center;
  justify-content: center;

  gap: 5px;

  margin-top: 19px;

  color: #5f6c82;

  font-size: 9px;
}

.problem-register-login a {
  display: inline-flex;
  align-items: center;

  gap: 4px;

  color: #78adff;

  font-weight: 700;

  text-decoration: none;

  transition:
    color .2s ease,
    gap .2s ease;
}

.problem-register-login a:hover {
  color: #a9ccff;

  gap: 7px;
}

.problem-register-login svg {
  width: 11px;
  height: 11px;
}

/* =========================================================
   TRUST
========================================================= */

.problem-register-trust {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-top: 21px;

  padding-top: 15px;

  border-top:
    1px solid
    rgba(255,255,255,.055);

  color: #4d596e;

  font-size: 8px;
}

.problem-register-trust > div {
  display: flex;
  align-items: center;

  gap: 6px;
}

.problem-register-trust-icon {
  width: 23px;
  height: 23px;

  display: grid;
  place-items: center;

  border-radius: 7px;

  background:
    rgba(255,255,255,.035);

  color: #64738a;
}

.problem-register-trust-icon svg {
  width: 12px;
  height: 12px;
}

.problem-register-trust-dot {
  width: 5px;
  height: 5px;

  border-radius: 50%;

  background: #34d399;

  box-shadow:
    0 0 8px
      rgba(52,211,153,.6);
}

/* =========================================================
   TABLET
========================================================= */

@media (max-width: 980px) {

  .problem-register-page {
    padding: 18px;
  }

  .problem-register-shell {
    grid-template-columns:
      .8fr
      1.2fr;

    min-height: 680px;
  }

  .problem-register-visual {
    min-height: 680px;

    padding: 32px;
  }

  .problem-register-form-area {
    padding: 35px;
  }

  .problem-register-visual-content h1 {
    font-size: 40px;
  }

  .problem-register-feature-list {
    margin-top: 25px;
  }

}

/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 760px) {

  .problem-register-page {
    min-height: 100dvh;

    padding: 0;

    align-items: stretch;
  }

  .problem-register-shell {
    width: 100%;

    min-height: 100dvh;

    display: block;

    border: 0;

    border-radius: 0;

    background:
      linear-gradient(
        180deg,
        rgba(10,16,32,.9),
        rgba(6,9,20,.97)
      );

    box-shadow: none;
  }

  .problem-register-visual {
    display: none;
  }

  .problem-register-form-area {
    min-height: 100dvh;

    display: flex;
    align-items: center;

    padding:
      30px
      22px;
  }

  .problem-register-card {
    width: min(450px,100%);

    margin: 0 auto;
  }

  .problem-register-mobile-brand {
    display: flex;
    align-items: center;

    gap: 11px;

    margin-bottom: 40px;
  }

  .problem-register-mobile-brand
  .problem-register-brand-icon {
    width: 40px;
    height: 40px;

    flex-basis: 40px;

    border-radius: 12px;
  }

  .problem-register-mobile-brand strong {
    display: block;

    color: white;

    font-size: 14px;

    font-weight: 750;
  }

  .problem-register-mobile-brand small {
    display: block;

    margin-top: 2px;

    color: #65728a;

    font-size: 9px;
  }

  .problem-register-header h2 {
    font-size: 32px;
  }

}

/* =========================================================
   SMALL MOBILE
========================================================= */

@media (max-width: 420px) {

  .problem-register-form-area {
    padding:
      24px
      16px;
  }

  .problem-register-mobile-brand {
    margin-bottom: 32px;
  }

  .problem-register-header {
    margin-bottom: 21px;
  }

  .problem-register-header h2 {
    font-size: 28px;
  }

  .problem-register-header p {
    font-size: 10px;
  }

  .problem-register-input-wrap {
    height: 53px;
  }

  .problem-register-password-rules {
    grid-template-columns: 1fr;
  }

  .problem-register-trust {
    font-size: 7px;
  }

}

/* =========================================================
   REDUCED MOTION
========================================================= */

@media (prefers-reduced-motion: reduce) {

  *,
  *::before,
  *::after {
    animation-duration: .01ms !important;

    animation-iteration-count: 1 !important;

    transition-duration: .01ms !important;
  }

}
`;