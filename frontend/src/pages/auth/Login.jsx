import React, { useEffect, useMemo, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthVisual from "./AuthVisual";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    login,
    isAuthenticated,
    loading: authLoading,
  } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [focusedField, setFocusedField] = useState("");

  /*
   * Redirect already authenticated users.
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
        label: "",
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

    if (score <= 3) {
      return {
        score,
        label: "Medium",
      };
    }

    return {
      score,
      label: "Strong",
    };
  }, [form.password]);

  /*
   * Input handler.
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
   * Form validation.
   */
  const validateForm = () => {
    const email = form.email.trim();
    const password = form.password;

    if (!email) {
      return "Please enter your email address.";
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return "Please enter a valid email address.";
    }

    if (!password) {
      return "Please enter your password.";
    }

    if (password.length < 6) {
      return "Password must contain at least 6 characters.";
    }

    return "";
  };

  /*
   * Get useful backend error message.
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

    return "Unable to sign in. Please check your credentials and try again.";
  };

  /*
   * Login submit.
   *
   * IMPORTANT:
   * We use AuthContext.login().
   *
   * This keeps authentication state synchronized
   * with ProtectedRoute.
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

    const email = form.email.trim().toLowerCase();

    try {
      setSubmitting(true);

      await login({
        email,
        password: form.password,
      });

      setSuccess(
        "Authentication successful. Opening your workspace..."
      );

      /*
       * If the user was redirected to login from a protected
       * page, return them there.
       *
       * Otherwise go to dashboard.
       */
      const previousLocation = location.state?.from;

      const redirectPath =
        previousLocation?.pathname &&
        previousLocation.pathname !== "/login"
          ? `${previousLocation.pathname}${
              previousLocation.search || ""
            }${previousLocation.hash || ""}`
          : "/dashboard";

      /*
       * Small success animation before navigation.
       */
      setTimeout(() => {
        navigate(redirectPath, {
          replace: true,
        });
      }, 550);
    } catch (err) {
      // Do not log Axios errors: their config can contain submitted credentials.
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * Demo credentials are intentionally not hardcoded.
   * This keeps the screen fully dynamic.
   */
  const handleDemoFill = () => {
    setForm({
      email: "",
      password: "",
    });

    setError(
      "Enter your registered ProblemLens account credentials."
    );
  };

  /*
   * Initial authentication loading.
   */
  if (authLoading) {
    return (
      <div className="problem-login-loading">
        <div className="problem-login-loader">
          <div className="problem-login-loader-ring" />
          <div className="problem-login-loader-core">
            PL
          </div>
        </div>

        <p>Initializing ProblemLens...</p>

        <style>{`
          .problem-login-loading {
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
            color: #fff;
            font-family:
              Inter,
              ui-sans-serif,
              system-ui,
              -apple-system,
              BlinkMacSystemFont,
              "Segoe UI",
              sans-serif;
          }

          .problem-login-loading p {
            margin: 0;
            color: rgba(255, 255, 255, 0.62);
            font-size: 14px;
            letter-spacing: 0.02em;
          }

          .problem-login-loader {
            width: 72px;
            height: 72px;
            position: relative;
            display: grid;
            place-items: center;
          }

          .problem-login-loader-ring {
            position: absolute;
            inset: 0;
            border-radius: 50%;
            border: 2px solid rgba(96, 165, 250, 0.16);
            border-top-color: #60a5fa;
            animation:
              problemLoaderSpin
              1s linear infinite;
          }

          .problem-login-loader-core {
            width: 48px;
            height: 48px;
            border-radius: 15px;
            display: grid;
            place-items: center;
            background:
              linear-gradient(
                135deg,
                #2563eb,
                #7c3aed
              );
            box-shadow:
              0 10px 40px rgba(37, 99, 235, 0.35);
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 0.08em;
          }

          @keyframes problemLoaderSpin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <main className="problem-login-page">
      {/* Background effects */}
      <div className="problem-login-noise" />

      <div className="problem-login-orb problem-login-orb-one" />
      <div className="problem-login-orb problem-login-orb-two" />
      <div className="problem-login-orb problem-login-orb-three" />

      <div className="problem-login-grid" />

      <section className="problem-login-shell">
        {/* ============================
            LEFT VISUAL PANEL
        ============================ */}
        <div className="problem-login-visual">
          <div className="problem-login-visual-overlay" />

          <div className="problem-login-brand">
            <div className="problem-login-brand-icon">
              <span>PL</span>
            </div>

            <div>
              <strong>ProblemLens</strong>
              <small>
                Intelligence for better decisions
              </small>
            </div>
          </div>

          <div className="problem-login-visual-content">
            <div className="problem-login-eyebrow">
              <span className="problem-login-eyebrow-dot" />
              AI-POWERED DISCOVERY PLATFORM
            </div>

            <h1>
              Turn problems into
              <span> opportunities.</span>
            </h1>

            <p>
              Discover meaningful problems, analyze
              evidence, identify patterns, and transform
              insights into actionable opportunities.
            </p>

            <div className="problem-login-feature-list">
              <div className="problem-login-feature">
                <div className="problem-login-feature-icon">
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
                </div>

                <div>
                  <strong>
                    Intelligent Discovery
                  </strong>
                  <span>
                    Find patterns hidden inside real-world
                    evidence.
                  </span>
                </div>
              </div>

              <div className="problem-login-feature">
                <div className="problem-login-feature-icon">
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
                </div>

                <div>
                  <strong>
                    Evidence Intelligence
                  </strong>
                  <span>
                    Connect evidence with measurable
                    insights.
                  </span>
                </div>
              </div>

              <div className="problem-login-feature">
                <div className="problem-login-feature-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z" />
                    <path d="M9 12l2 2 4-5" />
                  </svg>
                </div>

                <div>
                  <strong>
                    Explainable Analysis
                  </strong>
                  <span>
                    Understand why an opportunity matters.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="problem-login-visual-footer">
            <div className="problem-login-status">
              <span className="problem-login-status-dot" />
              <span>AI systems online</span>
            </div>

            <span>
              Secure workspace
            </span>
          </div>
        </div>

        {/* ============================
            RIGHT LOGIN PANEL
        ============================ */}
        <div className="problem-login-form-area">
          <div className="problem-login-card">
            {/* Mobile brand */}
            <div className="problem-login-mobile-brand">
              <div className="problem-login-brand-icon">
                <span>PL</span>
              </div>

              <div>
                <strong>ProblemLens</strong>
                <small>
                  Opportunity Intelligence
                </small>
              </div>
            </div>

            {/* Header */}
            <div className="problem-login-header">
              <div className="problem-login-welcome">
                Welcome back
                <span>✦</span>
              </div>

              <h2>
                Sign in to your
                <span> workspace</span>
              </h2>

              <p>
                Continue discovering insights and
                opportunities with ProblemLens.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div
                className="problem-login-alert problem-login-alert-error"
                role="alert"
              >
                <div className="problem-login-alert-icon">
                  !
                </div>

                <div>
                  <strong>
                    Sign in unsuccessful
                  </strong>

                  <span>{error}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setError("")}
                  aria-label="Close error"
                >
                  ×
                </button>
              </div>
            )}

            {/* Success */}
            {success && (
              <div
                className="problem-login-alert problem-login-alert-success"
                role="status"
              >
                <div className="problem-login-success-icon">
                  ✓
                </div>

                <div>
                  <strong>
                    You're authenticated
                  </strong>

                  <span>{success}</span>
                </div>
              </div>
            )}

            {/* Form */}
            <form
              className="problem-login-form"
              onSubmit={handleSubmit}
              noValidate
            >
              {/* Email */}
              <div
                className={`problem-login-field ${
                  focusedField === "email"
                    ? "is-focused"
                    : ""
                } ${
                  form.email
                    ? "has-value"
                    : ""
                }`}
              >
                <label htmlFor="login-email">
                  Email address
                </label>

                <div className="problem-login-input-wrap">
                  <div className="problem-login-input-icon">
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
                    id="login-email"
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
                    disabled={submitting}
                    spellCheck="false"
                  />

                  {form.email && (
                    <div className="problem-login-valid-icon">
                      ✓
                    </div>
                  )}
                </div>
              </div>

              {/* Password */}
              <div
                className={`problem-login-field ${
                  focusedField === "password"
                    ? "is-focused"
                    : ""
                } ${
                  form.password
                    ? "has-value"
                    : ""
                }`}
              >
                <div className="problem-login-label-row">
                  <label htmlFor="login-password">
                    Password
                  </label>

                  <Link to="/forgot-password">
                    Forgot password?
                  </Link>
                </div>

                <div className="problem-login-input-wrap">
                  <div className="problem-login-input-icon">
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
                    id="login-password"
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
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={submitting}
                  />

                  <button
                    type="button"
                    className="problem-login-password-toggle"
                    onClick={() =>
                      setShowPassword(
                        (previous) => !previous
                      )
                    }
                    disabled={submitting}
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
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

                {/* Password strength */}
                {form.password && (
                  <div className="problem-login-password-strength">
                    <div className="problem-login-strength-bars">
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
              </div>

              {/* Remember */}
              <div className="problem-login-options">
                <label className="problem-login-checkbox">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(event) =>
                      setRemember(
                        event.target.checked
                      )
                    }
                    disabled={submitting}
                  />

                  <span className="problem-login-checkmark">
                    ✓
                  </span>

                  <span>
                    Keep me signed in
                  </span>
                </label>

                <span className="problem-login-security">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z" />
                    <path d="M9 12l2 2 4-5" />
                  </svg>
                  Secure
                </span>
              </div>

              {/* Submit */}
              <button
                className={`problem-login-submit ${
                  submitting
                    ? "is-loading"
                    : ""
                } ${
                  success
                    ? "is-success"
                    : ""
                }`}
                type="submit"
                disabled={submitting}
              >
                <span className="problem-login-submit-bg" />

                <span className="problem-login-submit-content">
                  {submitting ? (
                    <>
                      <span className="problem-login-spinner" />
                      <span>
                        Authenticating...
                      </span>
                    </>
                  ) : success ? (
                    <>
                      <span className="problem-login-submit-success">
                        ✓
                      </span>
                      <span>
                        Signed in
                      </span>
                    </>
                  ) : (
                    <>
                      <span>
                        Sign in to ProblemLens
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

            {/* Register */}
            <div className="problem-login-register">
              <span>
                Don't have an account?
              </span>

              <Link to="/register">
                Create your account
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

            {/* Bottom security */}
            <div className="problem-login-trust">
              <div>
                <span className="problem-login-trust-icon">
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
                <span className="problem-login-trust-dot" />
                System operational
              </div>
            </div>

            {/* Development helper */}
            {import.meta.env.DEV && (
              <button
                type="button"
                className="problem-login-dev-helper"
                onClick={handleDemoFill}
              >
                Development mode
              </button>
            )}
          </div>
        </div>
      </section>

      <style>{`
        /* =========================================================
           PROBLEMLENS PREMIUM LOGIN
        ========================================================= */

        :root {
          --pl-bg: #060914;
          --pl-bg-soft: #0a1020;
          --pl-card: rgba(10, 16, 32, 0.76);
          --pl-card-border: rgba(255, 255, 255, 0.1);

          --pl-white: #ffffff;
          --pl-text: #eef4ff;
          --pl-muted: #8e9ab1;
          --pl-muted-2: #66738c;

          --pl-blue: #3b82f6;
          --pl-blue-bright: #60a5fa;
          --pl-indigo: #6366f1;
          --pl-purple: #8b5cf6;
          --pl-cyan: #22d3ee;

          --pl-danger: #fb7185;
          --pl-success: #34d399;

          --pl-radius-xl: 30px;
          --pl-radius-lg: 20px;
          --pl-radius-md: 14px;
        }

        * {
          box-sizing: border-box;
        }

        .problem-login-page {
          min-height: 100vh;
          min-height: 100dvh;
          position: relative;
          overflow: hidden;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 28px;

          color: var(--pl-text);

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
            var(--pl-bg);

          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .problem-login-page::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;

          background-image:
            linear-gradient(
              rgba(255, 255, 255, 0.018) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.018) 1px,
              transparent 1px
            );

          background-size: 50px 50px;

          mask-image: linear-gradient(
            to bottom,
            black,
            transparent 85%
          );
        }

        .problem-login-noise {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.035;

          background-image:
            url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.6'/%3E%3C/svg%3E");
        }

        .problem-login-grid {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.22;

          background-image:
            linear-gradient(
              rgba(96, 165, 250, 0.035) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(96, 165, 250, 0.035) 1px,
              transparent 1px
            );

          background-size: 90px 90px;

          animation:
            problemGridMove
            20s linear infinite;
        }

        @keyframes problemGridMove {
          from {
            transform: translate3d(0, 0, 0);
          }

          to {
            transform: translate3d(90px, 90px, 0);
          }
        }

        .problem-login-orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(1px);

          animation:
            problemOrbFloat
            12s ease-in-out infinite;
        }

        .problem-login-orb-one {
          width: 380px;
          height: 380px;
          left: -150px;
          top: 5%;

          background:
            radial-gradient(
              circle,
              rgba(37, 99, 235, 0.14),
              transparent 68%
            );
        }

        .problem-login-orb-two {
          width: 440px;
          height: 440px;
          right: -180px;
          bottom: -150px;

          background:
            radial-gradient(
              circle,
              rgba(124, 58, 237, 0.13),
              transparent 68%
            );

          animation-delay: -4s;
        }

        .problem-login-orb-three {
          width: 230px;
          height: 230px;
          right: 20%;
          top: -130px;

          background:
            radial-gradient(
              circle,
              rgba(34, 211, 238, 0.07),
              transparent 68%
            );

          animation-delay: -7s;
        }

        @keyframes problemOrbFloat {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }

          50% {
            transform:
              translate3d(0, -25px, 0)
              scale(1.04);
          }
        }

        /* =========================================================
           MAIN SHELL
        ========================================================= */

        .problem-login-shell {
          position: relative;
          z-index: 5;

          width: min(1180px, 100%);

          min-height: 720px;

          display: grid;
          grid-template-columns: 0.95fr 1.05fr;

          overflow: hidden;

          border:
            1px solid
            rgba(255, 255, 255, 0.105);

          border-radius: var(--pl-radius-xl);

          background:
            linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.055),
              rgba(255, 255, 255, 0.015)
            );

          box-shadow:
            0 40px 120px rgba(0, 0, 0, 0.55),
            0 0 0 1px rgba(59, 130, 246, 0.035),
            inset 0 1px 0 rgba(255, 255, 255, 0.06);

          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);

          animation:
            problemShellEnter
            0.8s cubic-bezier(0.22, 1, 0.36, 1);
        }

        @keyframes problemShellEnter {
          from {
            opacity: 0;
            transform:
              translateY(24px)
              scale(0.98);
          }

          to {
            opacity: 1;
            transform:
              translateY(0)
              scale(1);
          }
        }

        /* =========================================================
           VISUAL PANEL
        ========================================================= */

        .problem-login-visual {
          position: relative;
          min-height: 720px;
          overflow: hidden;

          display: flex;
          flex-direction: column;
          justify-content: space-between;

          padding: 42px;

          background:
            radial-gradient(
              circle at 15% 20%,
              rgba(59, 130, 246, 0.25),
              transparent 38%
            ),
            radial-gradient(
              circle at 90% 85%,
              rgba(139, 92, 246, 0.22),
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
            rgba(255, 255, 255, 0.07);
        }

        .problem-login-visual::before {
          content: "";
          position: absolute;
          width: 520px;
          height: 520px;

          top: 18%;
          left: -240px;

          border-radius: 50%;

          border:
            1px solid
            rgba(96, 165, 250, 0.12);

          box-shadow:
            0 0 0 70px
              rgba(96, 165, 250, 0.018),
            0 0 0 140px
              rgba(96, 165, 250, 0.012);

          animation:
            problemVisualPulse
            8s ease-in-out infinite;
        }

        @keyframes problemVisualPulse {
          0%,
          100% {
            transform: scale(0.98);
            opacity: 0.65;
          }

          50% {
            transform: scale(1.04);
            opacity: 1;
          }
        }

        .problem-login-visual-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;

          background:
            linear-gradient(
              115deg,
              transparent 30%,
              rgba(255, 255, 255, 0.025) 50%,
              transparent 70%
            );

          background-size: 250% 100%;

          animation:
            problemShimmer
            8s ease-in-out infinite;
        }

        @keyframes problemShimmer {
          0%,
          60% {
            background-position: 200% 0;
          }

          100% {
            background-position: -100% 0;
          }
        }

        .problem-login-brand {
          position: relative;
          z-index: 2;

          display: flex;
          align-items: center;
          gap: 13px;
        }

        .problem-login-brand-icon {
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
              rgba(59, 130, 246, 0.3),
            inset 0 1px 1px
              rgba(255, 255, 255, 0.28);

          transform: rotate(-3deg);

          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
        }

        .problem-login-brand:hover
          .problem-login-brand-icon {
          transform:
            rotate(0deg)
            scale(1.06);
        }

        .problem-login-brand-icon span {
          color: white;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.08em;
        }

        .problem-login-brand strong {
          display: block;

          color: #fff;

          font-size: 15px;
          font-weight: 750;
          letter-spacing: -0.02em;
        }

        .problem-login-brand small {
          display: block;
          margin-top: 2px;

          color: rgba(255, 255, 255, 0.45);

          font-size: 10px;
          font-weight: 500;
        }

        .problem-login-visual-content {
          position: relative;
          z-index: 2;

          max-width: 490px;

          margin-top: auto;
          margin-bottom: auto;

          padding: 80px 0 55px;
        }

        .problem-login-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;

          padding: 7px 11px;

          border:
            1px solid
            rgba(96, 165, 250, 0.16);

          border-radius: 999px;

          background:
            rgba(59, 130, 246, 0.07);

          color: #8dbbff;

          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.12em;
        }

        .problem-login-eyebrow-dot {
          width: 6px;
          height: 6px;

          border-radius: 50%;

          background: #60a5fa;

          box-shadow:
            0 0 0 4px
              rgba(96, 165, 250, 0.09),
            0 0 14px
              rgba(96, 165, 250, 0.8);

          animation:
            problemDotPulse
            2s ease-in-out infinite;
        }

        @keyframes problemDotPulse {
          0%,
          100% {
            opacity: 0.55;
          }

          50% {
            opacity: 1;
          }
        }

        .problem-login-visual-content h1 {
          margin: 22px 0 18px;

          color: white;

          font-size:
            clamp(36px, 4vw, 58px);

          line-height: 1.02;

          letter-spacing: -0.055em;
          font-weight: 760;
        }

        .problem-login-visual-content h1 span {
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
            problemGradientText
            5s ease-in-out infinite;
        }

        @keyframes problemGradientText {
          0%,
          100% {
            background-position: 0% 50%;
          }

          50% {
            background-position: 100% 50%;
          }
        }

        .problem-login-visual-content > p {
          max-width: 450px;

          margin: 0;

          color: rgba(221, 231, 255, 0.58);

          font-size: 14px;
          line-height: 1.8;
        }

        .problem-login-feature-list {
          display: grid;
          gap: 13px;

          margin-top: 34px;
        }

        .problem-login-feature {
          display: flex;
          align-items: center;
          gap: 13px;

          padding: 12px;

          border:
            1px solid
            rgba(255, 255, 255, 0.055);

          border-radius: 14px;

          background:
            rgba(255, 255, 255, 0.025);

          transition:
            transform 0.3s ease,
            background 0.3s ease,
            border-color 0.3s ease;
        }

        .problem-login-feature:hover {
          transform: translateX(6px);

          background:
            rgba(255, 255, 255, 0.045);

          border-color:
            rgba(96, 165, 250, 0.14);
        }

        .problem-login-feature-icon {
          width: 35px;
          height: 35px;

          flex: 0 0 35px;

          display: grid;
          place-items: center;

          border-radius: 10px;

          background:
            linear-gradient(
              135deg,
              rgba(59, 130, 246, 0.16),
              rgba(139, 92, 246, 0.1)
            );

          color: #82b6ff;
        }

        .problem-login-feature-icon svg {
          width: 17px;
          height: 17px;
        }

        .problem-login-feature strong {
          display: block;

          margin-bottom: 2px;

          color: rgba(255, 255, 255, 0.86);

          font-size: 11px;
          font-weight: 700;
        }

        .problem-login-feature span {
          display: block;

          color: rgba(214, 225, 250, 0.43);

          font-size: 10px;
          line-height: 1.45;
        }

        .problem-login-visual-footer {
          position: relative;
          z-index: 2;

          display: flex;
          align-items: center;
          justify-content: space-between;

          color: rgba(255, 255, 255, 0.34);

          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.03em;
        }

        .problem-login-status {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .problem-login-status-dot {
          width: 6px;
          height: 6px;

          border-radius: 50%;

          background: #34d399;

          box-shadow:
            0 0 10px
              rgba(52, 211, 153, 0.8);
        }

        /* =========================================================
           FORM AREA
        ========================================================= */

        .problem-login-form-area {
          position: relative;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 52px;

          background:
            linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.025),
              rgba(255, 255, 255, 0.005)
            );
        }

        .problem-login-card {
          width: min(430px, 100%);
        }

        .problem-login-mobile-brand {
          display: none;
        }

        .problem-login-header {
          margin-bottom: 28px;
        }

        .problem-login-welcome {
          display: inline-flex;
          align-items: center;
          gap: 7px;

          margin-bottom: 10px;

          color: #6faaff;

          font-size: 10px;
          font-weight: 800;

          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .problem-login-welcome span {
          color: #a78bfa;

          animation:
            problemStar
            2.2s ease-in-out infinite;
        }

        @keyframes problemStar {
          0%,
          100% {
            transform: scale(0.9);
            opacity: 0.55;
          }

          50% {
            transform: scale(1.15);
            opacity: 1;
          }
        }

        .problem-login-header h2 {
          margin: 0;

          color: white;

          font-size:
            clamp(28px, 3vw, 37px);

          line-height: 1.1;

          letter-spacing: -0.045em;
          font-weight: 760;
        }

        .problem-login-header h2 span {
          color: #8dbbff;
        }

        .problem-login-header p {
          max-width: 390px;

          margin: 11px 0 0;

          color: var(--pl-muted);

          font-size: 12px;
          line-height: 1.7;
        }

        /* =========================================================
           ALERTS
        ========================================================= */

        .problem-login-alert {
          display: flex;
          align-items: flex-start;
          gap: 10px;

          margin-bottom: 18px;
          padding: 12px;

          border-radius: 13px;

          animation:
            problemAlertIn
            0.35s ease;
        }

        @keyframes problemAlertIn {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .problem-login-alert-error {
          border:
            1px solid
            rgba(251, 113, 133, 0.18);

          background:
            rgba(251, 113, 133, 0.065);
        }

        .problem-login-alert-success {
          border:
            1px solid
            rgba(52, 211, 153, 0.18);

          background:
            rgba(52, 211, 153, 0.065);
        }

        .problem-login-alert-icon,
        .problem-login-success-icon {
          width: 27px;
          height: 27px;

          flex: 0 0 27px;

          display: grid;
          place-items: center;

          border-radius: 8px;

          font-size: 11px;
          font-weight: 900;
        }

        .problem-login-alert-icon {
          background:
            rgba(251, 113, 133, 0.12);

          color: #fb7185;
        }

        .problem-login-success-icon {
          background:
            rgba(52, 211, 153, 0.12);

          color: #34d399;
        }

        .problem-login-alert div:nth-child(2) {
          min-width: 0;
          flex: 1;
        }

        .problem-login-alert strong {
          display: block;

          margin-bottom: 2px;

          color: rgba(255, 255, 255, 0.82);

          font-size: 10px;
          font-weight: 750;
        }

        .problem-login-alert span {
          display: block;

          color: var(--pl-muted);

          font-size: 10px;
          line-height: 1.5;

          word-break: break-word;
        }

        .problem-login-alert button {
          border: 0;
          background: transparent;

          color: rgba(255, 255, 255, 0.4);

          cursor: pointer;

          font-size: 18px;
          line-height: 1;

          padding: 2px;

          transition:
            color 0.2s ease,
            transform 0.2s ease;
        }

        .problem-login-alert button:hover {
          color: white;
          transform: scale(1.1);
        }

        /* =========================================================
           FORM
        ========================================================= */

        .problem-login-form {
          display: grid;
          gap: 19px;
        }

        .problem-login-field {
          position: relative;
        }

        .problem-login-field label {
          display: block;

          margin-bottom: 8px;

          color: #aab5c8;

          font-size: 10px;
          font-weight: 700;

          transition: color 0.2s ease;
        }

        .problem-login-field.is-focused label {
          color: #79adff;
        }

        .problem-login-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;

          margin-bottom: 8px;
        }

        .problem-login-label-row label {
          margin: 0;
        }

        .problem-login-label-row a {
          color: #6ea8ff;

          font-size: 9px;
          font-weight: 650;

          text-decoration: none;

          transition:
            color 0.2s ease,
            transform 0.2s ease;
        }

        .problem-login-label-row a:hover {
          color: #9bc4ff;
        }

        .problem-login-input-wrap {
          position: relative;

          display: flex;
          align-items: center;

          height: 53px;

          border:
            1px solid
            rgba(255, 255, 255, 0.085);

          border-radius: 14px;

          background:
            rgba(4, 8, 19, 0.48);

          overflow: hidden;

          transition:
            border-color 0.25s ease,
            background 0.25s ease,
            box-shadow 0.25s ease,
            transform 0.25s ease;
        }

        .problem-login-field.is-focused
          .problem-login-input-wrap {
          border-color:
            rgba(96, 165, 250, 0.48);

          background:
            rgba(7, 14, 30, 0.7);

          box-shadow:
            0 0 0 3px
              rgba(59, 130, 246, 0.08),
            0 10px 30px
              rgba(0, 0, 0, 0.12);
        }

        .problem-login-input-icon {
          width: 47px;

          display: grid;
          place-items: center;

          color: #586780;
        }

        .problem-login-input-icon svg {
          width: 17px;
          height: 17px;
        }

        .problem-login-field.is-focused
          .problem-login-input-icon {
          color: #6faaff;
        }

        .problem-login-input-wrap input {
          min-width: 0;
          flex: 1;

          height: 100%;

          border: 0;
          outline: 0;

          padding: 0 10px 0 0;

          background: transparent;

          color: white;

          font-family: inherit;
          font-size: 12px;

          caret-color: #60a5fa;
        }

        .problem-login-input-wrap input::placeholder {
          color: #4d5a70;
        }

        .problem-login-input-wrap input:-webkit-autofill,
        .problem-login-input-wrap input:-webkit-autofill:hover,
        .problem-login-input-wrap input:-webkit-autofill:focus {
          -webkit-text-fill-color: white;

          box-shadow:
            0 0 0 1000px
              #0a1020
              inset;

          transition:
            background-color
            9999s
            ease-in-out
            0s;
        }

        .problem-login-valid-icon {
          width: 25px;
          height: 25px;

          margin-right: 10px;

          display: grid;
          place-items: center;

          border-radius: 50%;

          background:
            rgba(52, 211, 153, 0.1);

          color: #34d399;

          font-size: 10px;
          font-weight: 900;

          animation:
            problemValidPop
            0.25s ease;
        }

        @keyframes problemValidPop {
          from {
            transform: scale(0.6);
            opacity: 0;
          }

          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .problem-login-password-toggle {
          width: 43px;
          height: 100%;

          display: grid;
          place-items: center;

          border: 0;
          background: transparent;

          color: #59677e;

          cursor: pointer;

          transition:
            color 0.2s ease,
            transform 0.2s ease;
        }

        .problem-login-password-toggle:hover {
          color: #9cbfff;
        }

        .problem-login-password-toggle:active {
          transform: scale(0.9);
        }

        .problem-login-password-toggle svg {
          width: 17px;
          height: 17px;
        }

        /* =========================================================
           PASSWORD STRENGTH
        ========================================================= */

        .problem-login-password-strength {
          display: flex;
          align-items: center;
          gap: 9px;

          margin-top: 8px;
        }

        .problem-login-strength-bars {
          flex: 1;

          display: grid;
          grid-template-columns:
            repeat(5, 1fr);

          gap: 4px;
        }

        .problem-login-strength-bars span {
          height: 3px;

          border-radius: 999px;

          background:
            rgba(255, 255, 255, 0.07);

          transition:
            background 0.25s ease,
            transform 0.25s ease;
        }

        .problem-login-strength-bars span.active {
          background:
            linear-gradient(
              90deg,
              #3b82f6,
              #8b5cf6
            );

          transform: scaleY(1.35);
        }

        .problem-login-password-strength > span {
          min-width: 38px;

          color: #637088;

          font-size: 8px;
          font-weight: 700;

          text-align: right;
        }

        /* =========================================================
           OPTIONS
        ========================================================= */

        .problem-login-options {
          display: flex;
          align-items: center;
          justify-content: space-between;

          margin-top: -2px;
        }

        .problem-login-checkbox {
          position: relative;

          display: inline-flex;
          align-items: center;
          gap: 8px;

          color: #758198;

          font-size: 9px;

          cursor: pointer;

          user-select: none;
        }

        .problem-login-checkbox input {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }

        .problem-login-checkmark {
          width: 15px;
          height: 15px;

          display: grid;
          place-items: center;

          border:
            1px solid
            rgba(255, 255, 255, 0.14);

          border-radius: 5px;

          background:
            rgba(255, 255, 255, 0.025);

          color: transparent;

          font-size: 8px;
          font-weight: 900;

          transition:
            background 0.2s ease,
            border-color 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease;
        }

        .problem-login-checkbox input:checked
          + .problem-login-checkmark {
          border-color: #4f8ffb;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #7c3aed
            );

          color: white;

          transform: scale(1.03);
        }

        .problem-login-security {
          display: inline-flex;
          align-items: center;
          gap: 5px;

          color: #59677c;

          font-size: 8px;
          font-weight: 650;
        }

        .problem-login-security svg {
          width: 12px;
          height: 12px;

          color: #5f8fca;
        }

        /* =========================================================
           SUBMIT BUTTON
        ========================================================= */

        .problem-login-submit {
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
              rgba(37, 99, 235, 0.2),
            inset 0 1px 1px
              rgba(255, 255, 255, 0.18);

          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease,
            filter 0.25s ease;
        }

        .problem-login-submit:hover:not(:disabled) {
          transform: translateY(-2px);

          box-shadow:
            0 20px 45px
              rgba(37, 99, 235, 0.3),
            inset 0 1px 1px
              rgba(255, 255, 255, 0.2);

          filter: brightness(1.06);
        }

        .problem-login-submit:active:not(:disabled) {
          transform: translateY(0) scale(0.99);
        }

        .problem-login-submit:disabled {
          cursor: not-allowed;
          opacity: 0.78;
        }

        .problem-login-submit-bg {
          position: absolute;
          inset: 0;

          background:
            linear-gradient(
              110deg,
              transparent 20%,
              rgba(255, 255, 255, 0.17) 45%,
              transparent 70%
            );

          background-size: 220% 100%;

          animation:
            problemButtonShimmer
            4s ease-in-out infinite;
        }

        @keyframes problemButtonShimmer {
          0%,
          45% {
            background-position: 200% 0;
          }

          75%,
          100% {
            background-position: -100% 0;
          }
        }

        .problem-login-submit-content {
          position: relative;
          z-index: 2;

          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;

          font-size: 11px;
          font-weight: 750;
          letter-spacing: 0.01em;
        }

        .problem-login-submit-content svg {
          width: 16px;
          height: 16px;

          transition:
            transform 0.25s ease;
        }

        .problem-login-submit:hover
          .problem-login-submit-content
          svg {
          transform: translateX(3px);
        }

        .problem-login-spinner {
          width: 16px;
          height: 16px;

          border:
            2px solid
            rgba(255, 255, 255, 0.28);

          border-top-color: white;

          border-radius: 50%;

          animation:
            problemSpin
            0.75s linear infinite;
        }

        @keyframes problemSpin {
          to {
            transform: rotate(360deg);
          }
        }

        .problem-login-submit-success {
          width: 19px;
          height: 19px;

          display: grid;
          place-items: center;

          border-radius: 50%;

          background:
            rgba(255, 255, 255, 0.16);

          font-size: 10px;
        }

        /* =========================================================
           REGISTER
        ========================================================= */

        .problem-login-register {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;

          margin-top: 23px;

          color: #5f6c82;

          font-size: 9px;
        }

        .problem-login-register a {
          display: inline-flex;
          align-items: center;
          gap: 4px;

          color: #78adff;

          font-weight: 700;

          text-decoration: none;

          transition:
            color 0.2s ease,
            gap 0.2s ease;
        }

        .problem-login-register a:hover {
          color: #a9ccff;
          gap: 7px;
        }

        .problem-login-register svg {
          width: 11px;
          height: 11px;
        }

        /* =========================================================
           TRUST
        ========================================================= */

        .problem-login-trust {
          display: flex;
          align-items: center;
          justify-content: space-between;

          margin-top: 25px;
          padding-top: 17px;

          border-top:
            1px solid
            rgba(255, 255, 255, 0.055);

          color: #4d596e;

          font-size: 8px;
        }

        .problem-login-trust > div {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .problem-login-trust-icon {
          width: 23px;
          height: 23px;

          display: grid;
          place-items: center;

          border-radius: 7px;

          background:
            rgba(255, 255, 255, 0.035);

          color: #64738a;
        }

        .problem-login-trust-icon svg {
          width: 12px;
          height: 12px;
        }

        .problem-login-trust-dot {
          width: 5px;
          height: 5px;

          border-radius: 50%;

          background: #34d399;

          box-shadow:
            0 0 8px
              rgba(52, 211, 153, 0.6);
        }

        .problem-login-dev-helper {
          display: block;

          margin: 14px auto 0;

          border: 0;
          background: transparent;

          color: rgba(255, 255, 255, 0.18);

          font-size: 7px;

          cursor: pointer;

          transition:
            color 0.2s ease;
        }

        .problem-login-dev-helper:hover {
          color: rgba(255, 255, 255, 0.45);
        }

        /* =========================================================
           TABLET
        ========================================================= */

        @media (max-width: 980px) {
          .problem-login-page {
            padding: 18px;
          }

          .problem-login-shell {
            grid-template-columns: 0.8fr 1.2fr;
            min-height: 680px;
          }

          .problem-login-visual {
            padding: 32px;
            min-height: 680px;
          }

          .problem-login-form-area {
            padding: 40px;
          }

          .problem-login-visual-content h1 {
            font-size: 40px;
          }

          .problem-login-feature-list {
            margin-top: 25px;
          }
        }

        /* =========================================================
           MOBILE
        ========================================================= */

        @media (max-width: 760px) {
          .problem-login-page {
            min-height: 100dvh;
            padding: 0;
            align-items: stretch;
          }

          .problem-login-shell {
            width: 100%;
            min-height: 100dvh;

            display: block;

            border: 0;
            border-radius: 0;

            background:
              linear-gradient(
                180deg,
                rgba(10, 16, 32, 0.9),
                rgba(6, 9, 20, 0.97)
              );

            box-shadow: none;
          }

          .problem-login-visual {
            display: none;
          }

          .problem-login-form-area {
            min-height: 100dvh;

            display: flex;
            align-items: center;

            padding:
              30px
              22px;
          }

          .problem-login-card {
            width: min(450px, 100%);
            margin: 0 auto;
          }

          .problem-login-mobile-brand {
            display: flex;
            align-items: center;
            gap: 11px;

            margin-bottom: 48px;
          }

          .problem-login-mobile-brand
            .problem-login-brand-icon {
            width: 40px;
            height: 40px;
            flex-basis: 40px;

            border-radius: 12px;
          }

          .problem-login-mobile-brand strong {
            display: block;

            color: white;

            font-size: 14px;
            font-weight: 750;
          }

          .problem-login-mobile-brand small {
            display: block;

            margin-top: 2px;

            color: #65728a;

            font-size: 9px;
          }

          .problem-login-header h2 {
            font-size: 32px;
          }

          .problem-login-header p {
            font-size: 11px;
          }

          .problem-login-input-wrap {
            height: 55px;
          }
        }

        /* =========================================================
           SMALL MOBILE
        ========================================================= */

        @media (max-width: 420px) {
          .problem-login-form-area {
            padding:
              25px
              17px;
          }

          .problem-login-mobile-brand {
            margin-bottom: 40px;
          }

          .problem-login-header {
            margin-bottom: 25px;
          }

          .problem-login-header h2 {
            font-size: 28px;
          }

          .problem-login-header p {
            font-size: 10px;
          }

          .problem-login-options {
            align-items: flex-start;
            gap: 10px;
          }

          .problem-login-security {
            display: none;
          }

          .problem-login-trust {
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
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </main>
  );
}