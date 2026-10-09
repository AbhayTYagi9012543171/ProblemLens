import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  ShieldCheck,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthVisual from "./AuthVisual";
import { authApi, getApiErrorMessage } from "../../services/api";

const passwordRules = (password) => [
  { label: "8+ characters", valid: password.length >= 8 },
  { label: "Uppercase", valid: /[A-Z]/.test(password) },
  { label: "Number", valid: /[0-9]/.test(password) },
  { label: "Special character", valid: /[^A-Za-z0-9]/.test(password) },
];

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const rules = useMemo(() => passwordRules(password), [password]);
  const strength = useMemo(
    () => rules.filter((rule) => rule.valid).length,
    [rules]
  );
  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;
  const validPassword = strength >= 3;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setError("");

    if (!token) {
      setError("This reset link is missing its security token.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (!validPassword) {
      setError(
        "Please use a stronger password with uppercase, number and special character."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      console.log("ProblemLens Reset Password Request");

      const response = await authApi.resetPassword({
        token,
        password,
      });

      console.log("ProblemLens Reset Password Response:", response);

      setDone(true);
    } catch (err) {
      console.error("ProblemLens Reset Password Error:", err);
      setError(
        getApiErrorMessage(
          err,
          "This reset link is invalid or expired. Please request a new one."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <main className="pl-reset-page">
        <div className="pl-reset-orb pl-reset-orb-one" />
        <div className="pl-reset-orb pl-reset-orb-two" />

        <div className="pl-reset-success-card">
          <div className="pl-reset-success-icon">
            <CheckCircle2 className="h-9 w-9" />
          </div>

          <div className="pl-reset-success-label">
            Password updated successfully
          </div>

          <h1>
            Your workspace is
            <span> secure.</span>
          </h1>

          <p>
            Your ProblemLens password has been changed. You can now sign in
            with your new password.
          </p>

          <button
            type="button"
            className="pl-reset-primary"
            onClick={() => navigate("/login", { replace: true })}
          >
            Continue to sign in
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <style>{SUCCESS_STYLES}</style>
      </main>
    );
  }

  return (
    <main className="pl-reset-page">
      <div className="pl-reset-noise" />
      <div className="pl-reset-orb pl-reset-orb-one" />
      <div className="pl-reset-orb pl-reset-orb-two" />

      <div className="pl-reset-layout">
        <AuthVisual view="forgot" />

        <section className="pl-reset-content">
          <div className="pl-reset-mobile-head">
            <Link to="/login" className="pl-reset-back">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <strong>
              Problem<span>Lens</span>
            </strong>
          </div>

          <div className="pl-reset-card">
            <div className="pl-reset-glow" />

            <div className="pl-reset-inner">
              <header>
                <div className="pl-reset-icon">
                  <KeyRound className="h-6 w-6" />
                </div>

                <div className="pl-reset-eyebrow">
                  <Sparkles className="h-3.5 w-3.5" />
                  Secure password reset
                </div>

                <h1>
                  Create a new
                  <span> password.</span>
                </h1>

                <p>
                  Choose a strong password for your ProblemLens workspace.
                  This reset link can only be used once.
                </p>
              </header>

              {error && (
                <div className="pl-reset-alert">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              {!token && (
                <div className="pl-reset-invalid">
                  <AlertCircle className="h-4 w-4" />
                  <div>
                    <strong>Invalid reset link</strong>
                    <p>
                      Open the reset link from your recovery request again.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="pl-reset-form">
                <PasswordInput
                  id="new-password"
                  label="New password"
                  value={password}
                  onChange={setPassword}
                  show={showPassword}
                  setShow={setShowPassword}
                  disabled={loading || !token}
                  placeholder="Create a strong password"
                />

                {password && (
                  <div className="pl-reset-strength">
                    <div className="pl-reset-bars">
                      {[1, 2, 3, 4].map((bar) => (
                        <span
                          key={bar}
                          className={bar <= strength ? "active" : ""}
                        />
                      ))}
                    </div>
                    <b>
                      {strength <= 1
                        ? "Weak"
                        : strength === 2
                        ? "Fair"
                        : strength === 3
                        ? "Strong"
                        : "Excellent"}
                    </b>
                  </div>
                )}

                {password && (
                  <div className="pl-reset-rules">
                    {rules.map((rule) => (
                      <span key={rule.label} className={rule.valid ? "valid" : ""}>
                        {rule.valid ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <i />
                        )}
                        {rule.label}
                      </span>
                    ))}
                  </div>
                )}

                <PasswordInput
                  id="confirm-password"
                  label="Confirm new password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  show={showConfirm}
                  setShow={setShowConfirm}
                  disabled={loading || !token}
                  placeholder="Repeat your new password"
                />

                {confirmPassword && (
                  <div
                    className={`pl-reset-match ${
                      passwordsMatch ? "match" : "not-match"
                    }`}
                  >
                    {passwordsMatch
                      ? "✓ Passwords match"
                      : "Passwords do not match"}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !token || !validPassword || !passwordsMatch}
                  className="pl-reset-primary"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating password...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Update password
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="pl-reset-security">
                <ShieldCheck className="h-4 w-4" />
                <div>
                  <strong>Secure password handling</strong>
                  <span>Your password is hashed before storage.</span>
                </div>
              </div>

              <Link to="/login" className="pl-reset-login-link">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to sign in
              </Link>
            </div>
          </div>
        </section>
      </div>

      <style>{STYLES}</style>
    </main>
  );
}

function PasswordInput({
  id,
  label,
  value,
  onChange,
  show,
  setShow,
  disabled,
  placeholder,
}) {
  return (
    <div className="pl-reset-field">
      <label htmlFor={id}>{label}</label>
      <div className="pl-reset-input-wrap">
        <Lock className="pl-reset-input-icon" />
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete="new-password"
          disabled={disabled}
        />
        <button
          type="button"
          onClick={() => setShow((current) => !current)}
          disabled={disabled}
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

const SUCCESS_STYLES = `
.pl-reset-page{min-height:100vh;min-height:100dvh;position:relative;display:grid;place-items:center;overflow:hidden;background:radial-gradient(circle at 20% 15%,rgba(37,99,235,.18),transparent 32%),radial-gradient(circle at 85% 85%,rgba(124,58,237,.18),transparent 34%),#050814;color:#fff;font-family:Inter,ui-sans-serif,system-ui,sans-serif}.pl-reset-orb{position:absolute;border-radius:50%;filter:blur(90px);pointer-events:none}.pl-reset-orb-one{width:360px;height:360px;left:-160px;top:15%;background:rgba(37,99,235,.12)}.pl-reset-orb-two{width:330px;height:330px;right:-120px;bottom:8%;background:rgba(124,58,237,.12)}.pl-reset-success-card{position:relative;width:min(92%,570px);padding:55px 45px;text-align:center;border:1px solid rgba(255,255,255,.1);border-radius:34px;background:linear-gradient(145deg,rgba(16,23,43,.92),rgba(7,12,27,.84));box-shadow:0 45px 120px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.05);backdrop-filter:blur(30px);animation:plResetSuccess .7s cubic-bezier(.16,1,.3,1) both}.pl-reset-success-icon{width:88px;height:88px;margin:0 auto;display:grid;place-items:center;border:1px solid rgba(52,211,153,.25);border-radius:28px;background:rgba(52,211,153,.05);color:#34d399;box-shadow:0 0 55px rgba(52,211,153,.1)}.pl-reset-success-label{margin-top:25px;color:#34d399;font-size:9px;font-weight:900;letter-spacing:.18em;text-transform:uppercase}.pl-reset-success-card h1{margin:10px 0 0;font-size:clamp(34px,5vw,46px);line-height:1.05;letter-spacing:-.055em;font-weight:950}.pl-reset-success-card h1 span{background:linear-gradient(100deg,#60a5fa,#a78bfa,#22d3ee);-webkit-background-clip:text;color:transparent}.pl-reset-success-card p{max-width:440px;margin:15px auto 0;color:#7f8da5;font-size:13px;line-height:1.8}.pl-reset-primary{position:relative;display:flex;align-items:center;justify-content:center;gap:9px;width:100%;min-height:57px;margin-top:24px;border:1px solid rgba(255,255,255,.14);border-radius:17px;background:linear-gradient(105deg,#2563eb,#6366f1 48%,#8b5cf6);color:#fff;font-size:11px;font-weight:900;box-shadow:0 22px 50px rgba(79,70,229,.23);cursor:pointer;transition:.3s}.pl-reset-primary:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 28px 60px rgba(79,70,229,.32)}@keyframes plResetSuccess{from{opacity:0;transform:translateY(20px) scale(.97)}to{opacity:1;transform:none}}
@media(max-width:600px){.pl-reset-success-card{padding:38px 22px;border-radius:27px}}
`;

const STYLES = `
.pl-reset-page{min-height:100vh;min-height:100dvh;position:relative;overflow:hidden;background:radial-gradient(circle at 12% 15%,rgba(37,99,235,.17),transparent 30%),radial-gradient(circle at 88% 85%,rgba(124,58,237,.18),transparent 32%),#050814;color:#eef4ff;font-family:Inter,ui-sans-serif,system-ui,sans-serif}.pl-reset-page *,.pl-reset-page *::before,.pl-reset-page *::after{box-sizing:border-box}.pl-reset-noise{position:fixed;inset:0;pointer-events:none;opacity:.03;background-image:radial-gradient(rgba(255,255,255,.8) .5px,transparent .5px);background-size:5px 5px}.pl-reset-orb{position:fixed;border-radius:50%;filter:blur(90px);pointer-events:none;animation:plResetFloat 10s ease-in-out infinite}.pl-reset-orb-one{width:340px;height:340px;left:-150px;top:15%;background:rgba(37,99,235,.12)}.pl-reset-orb-two{width:320px;height:320px;right:-130px;bottom:7%;background:rgba(124,58,237,.12);animation-delay:-4s}.pl-reset-layout{position:relative;z-index:1;min-height:100vh;min-height:100dvh;display:flex}.pl-reset-content{flex:1;min-width:0;min-height:100vh;min-height:100dvh;display:flex;align-items:center;justify-content:center;padding:45px 7%}.pl-reset-mobile-head{display:none}.pl-reset-card{position:relative;width:min(100%,570px);overflow:hidden;border:1px solid rgba(255,255,255,.105);border-radius:34px;background:linear-gradient(145deg,rgba(16,23,43,.9),rgba(7,12,27,.8));box-shadow:0 45px 120px rgba(0,0,0,.45),0 0 80px rgba(79,70,229,.07),inset 0 1px 0 rgba(255,255,255,.055);backdrop-filter:blur(30px);animation:plResetCardIn .8s cubic-bezier(.16,1,.3,1) both}.pl-reset-glow{position:absolute;width:300px;height:300px;right:-140px;top:-150px;border-radius:50%;background:rgba(34,211,238,.08);filter:blur(55px)}.pl-reset-inner{position:relative;padding:43px}.pl-reset-icon{width:62px;height:62px;display:grid;place-items:center;margin-bottom:20px;border:1px solid rgba(96,165,250,.2);border-radius:19px;background:linear-gradient(145deg,rgba(59,130,246,.16),rgba(124,58,237,.12));color:#7dd3fc;box-shadow:0 18px 45px rgba(37,99,235,.13)}.pl-reset-eyebrow{display:flex;align-items:center;gap:7px;color:#7dd3fc;font-size:9px;font-weight:900;letter-spacing:.18em;text-transform:uppercase}.pl-reset-inner header h1{margin:11px 0 0;color:#fff;font-size:clamp(34px,4vw,46px);line-height:1.03;letter-spacing:-.055em;font-weight:950}.pl-reset-inner header h1 span{background:linear-gradient(100deg,#60a5fa,#a78bfa,#22d3ee);-webkit-background-clip:text;color:transparent}.pl-reset-inner header p{max-width:470px;margin:15px 0 0;color:#7f8da5;font-size:13px;line-height:1.8}.pl-reset-alert,.pl-reset-invalid{display:flex;align-items:flex-start;gap:10px;margin-top:22px;padding:13px;border-radius:15px;border:1px solid rgba(251,113,133,.2);background:rgba(251,113,133,.05);color:#fda4af;font-size:10px}.pl-reset-invalid{border-color:rgba(251,191,36,.2);background:rgba(251,191,36,.04);color:#fbbf24}.pl-reset-invalid strong{display:block}.pl-reset-invalid p{margin:3px 0 0;color:#8b7a4d}.pl-reset-form{margin-top:27px;display:grid;gap:14px}.pl-reset-field label{display:block;margin-bottom:8px;color:#aeb9cc;font-size:10px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.pl-reset-input-wrap{height:59px;position:relative;display:flex;align-items:center;border:1px solid rgba(255,255,255,.09);border-radius:17px;background:rgba(5,10,23,.72);transition:.25s}.pl-reset-input-wrap:focus-within{border-color:rgba(96,165,250,.55);box-shadow:0 0 0 4px rgba(59,130,246,.07),0 18px 45px rgba(0,0,0,.16);transform:translateY(-1px)}.pl-reset-input-icon{position:absolute;left:18px;color:#64748b;pointer-events:none}.pl-reset-input-wrap input{width:100%;height:100%;border:0;outline:0;background:transparent;color:#fff;padding:0 48px;font-size:13px}.pl-reset-input-wrap input::placeholder{color:#475569}.pl-reset-input-wrap button{position:absolute;right:6px;width:44px;height:44px;display:grid;place-items:center;border:0;border-radius:12px;background:transparent;color:#64748b;cursor:pointer}.pl-reset-input-wrap button:hover{color:#cbd5e1}.pl-reset-strength{display:flex;align-items:center;gap:10px;margin-top:-5px}.pl-reset-bars{flex:1;display:grid;grid-template-columns:repeat(4,1fr);gap:4px}.pl-reset-bars span{height:4px;border-radius:999px;background:rgba(255,255,255,.07);transition:.3s}.pl-reset-bars span.active{background:linear-gradient(90deg,#3b82f6,#8b5cf6)}.pl-reset-strength b{min-width:58px;color:#64748b;font-size:8px;text-align:right}.pl-reset-rules{display:grid;grid-template-columns:repeat(2,1fr);gap:6px 14px;margin-top:-3px}.pl-reset-rules span{display:flex;align-items:center;gap:5px;color:#4d5a70;font-size:8px}.pl-reset-rules span.valid{color:#8b9ab0}.pl-reset-rules span.valid svg{color:#34d399}.pl-reset-rules i{width:4px;height:4px;border-radius:50%;background:#475569}.pl-reset-match{font-size:8px;font-weight:800;margin-top:-8px}.pl-reset-match.match{color:#34d399}.pl-reset-match.not-match{color:#fb7185}.pl-reset-security{display:flex;align-items:center;gap:10px;margin-top:19px;padding:13px;border:1px solid rgba(255,255,255,.055);border-radius:15px;background:rgba(255,255,255,.018);color:#34d399}.pl-reset-security div{display:grid;gap:2px}.pl-reset-security strong{color:#9aa7bb;font-size:9px}.pl-reset-security span{color:#56627a;font-size:8px}.pl-reset-login-link{display:flex;justify-content:center;align-items:center;gap:6px;margin-top:22px;color:#68758b;font-size:9px;font-weight:800}.pl-reset-login-link:hover{color:#fff}
@keyframes plResetCardIn{from{opacity:0;transform:translateY(25px) scale(.985);filter:blur(6px)}to{opacity:1;transform:none;filter:none}}@keyframes plResetFloat{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(20px,-18px,0)}}
@media(max-width:1023px){.pl-reset-layout{display:block}.pl-reset-layout>aside{display:none}.pl-reset-content{padding:25px 18px 35px}.pl-reset-mobile-head{width:min(100%,570px);display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}.pl-reset-back{display:flex;align-items:center;gap:7px;color:#7d8ba3;font-size:10px;font-weight:800}.pl-reset-mobile-head strong{color:#fff;font-size:18px;letter-spacing:-.05em}.pl-reset-mobile-head strong span{color:#60a5fa}}
@media(max-width:600px){.pl-reset-content{padding:18px 12px 25px}.pl-reset-card{border-radius:27px}.pl-reset-inner{padding:28px 20px}.pl-reset-inner header h1{font-size:34px}.pl-reset-rules{grid-template-columns:1fr}}
@media(prefers-reduced-motion:reduce){.pl-reset-page *,.pl-reset-page *::before,.pl-reset-page *::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}
`;
