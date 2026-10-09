import React, { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Copy,
  ExternalLink,
  Loader2,
  Mail,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AuthVisual from "./AuthVisual";
import { authApi, getApiErrorMessage } from "../../services/api";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [devResetUrl, setDevResetUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const emailValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()),
    [email]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setError("");
    setMessage("");
    setDevResetUrl("");
    setCopied(false);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!emailValid) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await authApi.forgotPassword({
        email: cleanEmail,
      });

      const data = response?.data || {};

      setMessage(
        data?.message ||
          "If an account exists for this email, recovery instructions have been prepared."
      );

      /*
       * The backend intentionally exposes this only in development.
       * Production should deliver the reset link through email.
       */
      setDevResetUrl(data?.devResetUrl || "");
      setDone(true);
    } catch (err) {
      // Avoid logging request/response data for password recovery.
      setError(
        getApiErrorMessage(
          err,
          "Unable to start password recovery. Please try again."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const copyResetUrl = async () => {
    if (!devResetUrl) return;

    try {
      await navigator.clipboard.writeText(devResetUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      // Clipboard failures are non-fatal; keep reset URLs out of console logs.
    }
  };

  const openResetPage = () => {
    if (!devResetUrl) return;

    try {
      const url = new URL(devResetUrl);
      const token = url.searchParams.get("token");

      if (token) {
        navigate(`/reset-password?token=${encodeURIComponent(token)}`);
      }
    } catch (err) {
      // Invalid development reset URLs are handled without logging URL details.
    }
  };

  const resetForm = () => {
    setEmail("");
    setDone(false);
    setError("");
    setMessage("");
    setDevResetUrl("");
    setCopied(false);
  };

  return (
    <main className="pl-forgot-page">
      <div className="pl-forgot-noise" />
      <div className="pl-forgot-orb pl-forgot-orb-one" />
      <div className="pl-forgot-orb pl-forgot-orb-two" />

      <div className="pl-forgot-layout">
        <AuthVisual view="forgot" />

        <section className="pl-forgot-content">
          <div className="pl-forgot-mobile-head">
            <Link to="/login" className="pl-forgot-back">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>

            <div className="pl-forgot-logo">
              Problem<span>Lens</span>
            </div>
          </div>

          <div className="pl-forgot-card">
            <div className="pl-forgot-card-glow" />

            <div className="pl-forgot-inner">
              {!done ? (
                <>
                  <header className="pl-forgot-header">
                    <div className="pl-forgot-icon">
                      <Mail className="h-6 w-6" />
                      <span />
                    </div>

                    <div className="pl-forgot-eyebrow">
                      <Sparkles className="h-3.5 w-3.5" />
                      Secure account recovery
                    </div>

                    <h1>
                      Forgot your
                      <span> password?</span>
                    </h1>

                    <p>
                      Enter the email connected to your ProblemLens
                      workspace. We&apos;ll securely start the password recovery
                      process.
                    </p>
                  </header>

                  {error && (
                    <div className="pl-forgot-alert pl-forgot-alert-error">
                      <div className="pl-forgot-alert-icon">
                        <AlertCircle className="h-4 w-4" />
                      </div>
                      <div>
                        <strong>Recovery request failed</strong>
                        <p>{error}</p>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="pl-forgot-form">
                    <div className="pl-forgot-field">
                      <div className="pl-forgot-label-row">
                        <label htmlFor="forgot-email">Account email</label>
                        {email && emailValid && (
                          <span className="pl-forgot-valid">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Valid email
                          </span>
                        )}
                      </div>

                      <div className="pl-forgot-input-wrap">
                        <Mail className="pl-forgot-input-icon" />
                        <input
                          id="forgot-email"
                          type="email"
                          value={email}
                          onChange={(event) => {
                            setEmail(event.target.value);
                            setError("");
                          }}
                          placeholder="you@example.com"
                          autoComplete="email"
                          autoFocus
                          disabled={loading}
                          spellCheck="false"
                        />
                        {email && emailValid && (
                          <CheckCircle2 className="pl-forgot-input-check" />
                        )}
                      </div>

                      <p className="pl-forgot-helper">
                        We never ask you to provide your existing password.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !emailValid}
                      className="pl-forgot-submit"
                    >
                      <span className="pl-forgot-submit-shine" />
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing recovery...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send recovery link
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="pl-forgot-security">
                    <div className="pl-forgot-security-icon">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <strong>Privacy-first recovery</strong>
                      <p>
                        Reset tokens are hashed in the database and expire
                        after 30 minutes.
                      </p>
                    </div>
                    <span className="pl-forgot-secure-status">
                      <i /> Secure
                    </span>
                  </div>

                  <div className="pl-forgot-footer">
                    <Link to="/login">
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Return to sign in
                    </Link>
                    <span>Protected by ProblemLens authentication</span>
                  </div>
                </>
              ) : (
                <div className="pl-forgot-success">
                  <div className="pl-forgot-success-icon">
                    <CheckCircle2 className="h-9 w-9" />
                  </div>

                  <div className="pl-forgot-success-label">
                    Recovery request processed
                  </div>

                  <h1>
                    Check your
                    <span> recovery.</span>
                  </h1>

                  <p>{message}</p>

                  <div className="pl-forgot-email-card">
                    <Mail className="h-4 w-4" />
                    <div>
                      <span>Recovery account</span>
                      <strong>{email}</strong>
                    </div>
                  </div>

                  {devResetUrl && (
                    <div className="pl-forgot-dev-card">
                      <div className="pl-forgot-dev-heading">
                        <span>Development reset link</span>
                        <b>DEV</b>
                      </div>

                      <div className="pl-forgot-dev-url">
                        <span>{devResetUrl}</span>
                        <button
                          type="button"
                          onClick={copyResetUrl}
                          aria-label="Copy reset link"
                        >
                          {copied ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      <button
                        type="button"
                        className="pl-forgot-open-reset"
                        onClick={openResetPage}
                      >
                        Open reset password
                        <ExternalLink className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                  <Link to="/login" className="pl-forgot-success-button">
                    <ArrowLeft className="h-4 w-4" />
                    Return to sign in
                  </Link>

                  <button
                    type="button"
                    onClick={resetForm}
                    className="pl-forgot-another"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Use another email
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="pl-forgot-brand-footer">
            <strong>ProblemLens</strong>
            <i />
            <span>AI Problem Discovery &amp; Opportunity Intelligence</span>
          </div>
        </section>
      </div>

      <style>{STYLES}</style>
    </main>
  );
}

const STYLES = `
.pl-forgot-page{min-height:100vh;min-height:100dvh;position:relative;overflow-x:hidden;background:radial-gradient(circle at 12% 15%,rgba(37,99,235,.17),transparent 30%),radial-gradient(circle at 88% 85%,rgba(124,58,237,.18),transparent 32%),#050814;color:#eef4ff;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
.pl-forgot-page *,.pl-forgot-page *::before,.pl-forgot-page *::after{box-sizing:border-box}
.pl-forgot-noise{position:fixed;inset:0;pointer-events:none;opacity:.03;background-image:radial-gradient(rgba(255,255,255,.8) .5px,transparent .5px);background-size:5px 5px}
.pl-forgot-orb{position:fixed;border-radius:999px;filter:blur(90px);pointer-events:none;animation:plForgotFloat 10s ease-in-out infinite}
.pl-forgot-orb-one{width:340px;height:340px;left:-150px;top:15%;background:rgba(37,99,235,.12)}
.pl-forgot-orb-two{width:320px;height:320px;right:-130px;bottom:7%;background:rgba(124,58,237,.12);animation-delay:-4s}
.pl-forgot-layout{position:relative;z-index:1;min-height:100vh;min-height:100dvh;display:flex}
.pl-forgot-content{flex:1;min-width:0;min-height:100vh;min-height:100dvh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:45px 7%}
.pl-forgot-mobile-head{display:none}
.pl-forgot-card{position:relative;width:min(100%,570px);overflow:hidden;border:1px solid rgba(255,255,255,.105);border-radius:34px;background:linear-gradient(145deg,rgba(16,23,43,.9),rgba(7,12,27,.8));box-shadow:0 45px 120px rgba(0,0,0,.45),0 0 80px rgba(79,70,229,.07),inset 0 1px 0 rgba(255,255,255,.055);backdrop-filter:blur(30px);-webkit-backdrop-filter:blur(30px);animation:plForgotCardIn .8s cubic-bezier(.16,1,.3,1) both}
.pl-forgot-card-glow{position:absolute;width:300px;height:300px;right:-140px;top:-150px;border-radius:50%;background:rgba(34,211,238,.08);filter:blur(55px);pointer-events:none}
.pl-forgot-inner{position:relative;padding:43px}
.pl-forgot-header{animation:plForgotUp .65s .05s both}
.pl-forgot-icon{position:relative;width:62px;height:62px;display:grid;place-items:center;margin-bottom:20px;border:1px solid rgba(96,165,250,.2);border-radius:19px;background:linear-gradient(145deg,rgba(59,130,246,.16),rgba(124,58,237,.12));color:#7dd3fc;box-shadow:0 18px 45px rgba(37,99,235,.13),inset 0 1px 0 rgba(255,255,255,.07)}
.pl-forgot-icon span{position:absolute;inset:-7px;border:1px solid rgba(96,165,250,.12);border-radius:24px;animation:plForgotPulse 2.4s ease-out infinite}
.pl-forgot-eyebrow{display:inline-flex;align-items:center;gap:7px;color:#7dd3fc;font-size:9px;font-weight:900;letter-spacing:.18em;text-transform:uppercase}
.pl-forgot-header h1,.pl-forgot-success h1{margin:11px 0 0;color:#fff;font-size:clamp(34px,4vw,46px);line-height:1.03;letter-spacing:-.055em;font-weight:950}
.pl-forgot-header h1 span,.pl-forgot-success h1 span{background:linear-gradient(100deg,#60a5fa,#a78bfa,#22d3ee);-webkit-background-clip:text;background-clip:text;color:transparent}
.pl-forgot-header p,.pl-forgot-success>p{max-width:470px;margin:15px 0 0;color:#7f8da5;font-size:13px;line-height:1.8}
.pl-forgot-alert{display:flex;gap:12px;margin-top:25px;padding:13px 15px;border-radius:16px;animation:plForgotShake .35s ease}
.pl-forgot-alert-error{border:1px solid rgba(251,113,133,.2);background:rgba(251,113,133,.055);color:#fda4af}
.pl-forgot-alert-icon{width:28px;height:28px;flex:0 0 28px;display:grid;place-items:center;border-radius:9px;background:rgba(251,113,133,.09)}
.pl-forgot-alert strong{display:block;font-size:10px;font-weight:900}.pl-forgot-alert p{margin:3px 0 0;color:#fb7185;font-size:10px;line-height:1.5}
.pl-forgot-form{margin-top:30px;animation:plForgotUp .65s .14s both}.pl-forgot-field{position:relative}.pl-forgot-label-row{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:9px}.pl-forgot-label-row label{color:#aeb9cc;font-size:10px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.pl-forgot-valid{display:flex;align-items:center;gap:4px;color:#34d399;font-size:9px;font-weight:800}
.pl-forgot-input-wrap{position:relative;display:flex;align-items:center;height:62px;border:1px solid rgba(255,255,255,.09);border-radius:18px;background:rgba(5,10,23,.72);transition:.25s}.pl-forgot-input-wrap:hover{border-color:rgba(255,255,255,.15)}.pl-forgot-input-wrap:focus-within{border-color:rgba(96,165,250,.55);box-shadow:0 0 0 4px rgba(59,130,246,.07),0 18px 45px rgba(0,0,0,.16);transform:translateY(-1px)}
.pl-forgot-input-icon{position:absolute;left:19px;color:#64748b;pointer-events:none;transition:.25s}.pl-forgot-input-wrap:focus-within .pl-forgot-input-icon{color:#60a5fa}.pl-forgot-input-wrap input{width:100%;height:100%;border:0;outline:0;background:transparent;color:#fff;padding:0 52px;font-size:13px;font-weight:600}.pl-forgot-input-wrap input::placeholder{color:#475569}.pl-forgot-input-check{position:absolute;right:18px;color:#34d399;animation:plForgotCheck .25s ease}.pl-forgot-helper{margin:9px 2px 0;color:#536078;font-size:9px}
.pl-forgot-submit{position:relative;display:flex;align-items:center;justify-content:center;gap:9px;width:100%;min-height:58px;margin-top:23px;overflow:hidden;border:1px solid rgba(255,255,255,.15);border-radius:17px;background:linear-gradient(105deg,#2563eb,#6366f1 48%,#8b5cf6);color:#fff;font-size:12px;font-weight:900;box-shadow:0 22px 50px rgba(79,70,229,.23),inset 0 1px 0 rgba(255,255,255,.2);cursor:pointer;transition:.3s}.pl-forgot-submit:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 28px 60px rgba(79,70,229,.32)}.pl-forgot-submit:active:not(:disabled){transform:scale(.99)}.pl-forgot-submit:disabled{opacity:.48;cursor:not-allowed}.pl-forgot-submit-shine{position:absolute;inset:0;transform:translateX(-120%);background:linear-gradient(100deg,transparent,rgba(255,255,255,.2),transparent);transition:transform .7s}.pl-forgot-submit:hover .pl-forgot-submit-shine{transform:translateX(120%)}
.pl-forgot-security{display:flex;align-items:center;gap:12px;margin-top:23px;padding:15px;border:1px solid rgba(255,255,255,.055);border-radius:17px;background:rgba(255,255,255,.018)}.pl-forgot-security-icon{width:32px;height:32px;flex:0 0 32px;display:grid;place-items:center;border-radius:10px;background:rgba(52,211,153,.07);color:#34d399}.pl-forgot-security strong{color:#9aa7bb;font-size:10px}.pl-forgot-security p{margin:3px 0 0;color:#56627a;font-size:8px;line-height:1.5}.pl-forgot-secure-status{margin-left:auto;display:flex;align-items:center;gap:5px;color:#475569;font-size:8px;font-weight:800}.pl-forgot-secure-status i{width:5px;height:5px;border-radius:50%;background:#34d399;box-shadow:0 0 10px rgba(52,211,153,.8)}
.pl-forgot-footer{display:flex;justify-content:space-between;align-items:center;gap:15px;margin-top:25px}.pl-forgot-footer a{display:flex;align-items:center;gap:6px;color:#71809a;font-size:10px;font-weight:800}.pl-forgot-footer a:hover{color:#fff}.pl-forgot-footer span{color:#39445a;font-size:8px}
.pl-forgot-success{text-align:center;padding:5px 0;animation:plForgotSuccess .7s cubic-bezier(.16,1,.3,1) both}.pl-forgot-success-icon{width:88px;height:88px;margin:0 auto;display:grid;place-items:center;border:1px solid rgba(52,211,153,.25);border-radius:28px;background:radial-gradient(circle,rgba(52,211,153,.14),rgba(52,211,153,.035));color:#34d399;box-shadow:0 0 60px rgba(52,211,153,.1),inset 0 1px 0 rgba(255,255,255,.06);animation:plForgotSuccessPulse 2.2s ease-in-out infinite}.pl-forgot-success-label{margin-top:25px;color:#34d399;font-size:9px;font-weight:900;letter-spacing:.18em;text-transform:uppercase}.pl-forgot-success h1{margin-top:10px}.pl-forgot-success>p{margin-left:auto;margin-right:auto;text-align:center}
.pl-forgot-email-card{display:flex;align-items:center;gap:12px;margin-top:24px;padding:15px;border:1px solid rgba(255,255,255,.075);border-radius:17px;background:rgba(255,255,255,.025);text-align:left}.pl-forgot-email-card>svg{color:#60a5fa}.pl-forgot-email-card div{min-width:0}.pl-forgot-email-card span{display:block;color:#536078;font-size:8px;font-weight:800;text-transform:uppercase;letter-spacing:.12em}.pl-forgot-email-card strong{display:block;margin-top:4px;overflow:hidden;color:#dbeafe;font-size:11px;text-overflow:ellipsis;white-space:nowrap}
.pl-forgot-dev-card{margin-top:15px;padding:14px;border:1px solid rgba(251,191,36,.16);border-radius:17px;background:rgba(251,191,36,.035);text-align:left}.pl-forgot-dev-heading{display:flex;justify-content:space-between;align-items:center;color:#a8b2c4;font-size:9px;font-weight:900}.pl-forgot-dev-heading b{padding:3px 7px;border-radius:999px;background:rgba(251,191,36,.1);color:#fbbf24;font-size:7px;letter-spacing:.1em}.pl-forgot-dev-url{display:flex;align-items:center;gap:8px;margin-top:9px;padding:9px;border-radius:10px;background:rgba(0,0,0,.2)}.pl-forgot-dev-url span{min-width:0;flex:1;overflow:hidden;color:#64748b;font-size:8px;text-overflow:ellipsis;white-space:nowrap}.pl-forgot-dev-url button{width:28px;height:28px;display:grid;place-items:center;border:0;border-radius:8px;background:rgba(255,255,255,.05);color:#94a3b8;cursor:pointer}.pl-forgot-open-reset{display:flex;align-items:center;justify-content:center;gap:7px;width:100%;margin-top:10px;padding:10px;border:1px solid rgba(251,191,36,.14);border-radius:10px;background:rgba(251,191,36,.05);color:#fbbf24;font-size:9px;font-weight:900;cursor:pointer}
.pl-forgot-success-button{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;margin-top:24px;padding:14px;border:1px solid rgba(255,255,255,.09);border-radius:16px;background:rgba(255,255,255,.035);color:#dbeafe;font-size:10px;font-weight:900;transition:.25s}.pl-forgot-success-button:hover{background:rgba(255,255,255,.07);transform:translateY(-1px)}.pl-forgot-another{display:inline-flex;align-items:center;gap:6px;margin-top:17px;border:0;background:transparent;color:#56627a;font-size:9px;font-weight:800;cursor:pointer}.pl-forgot-another:hover{color:#cbd5e1}.pl-forgot-brand-footer{display:flex;align-items:center;justify-content:center;gap:9px;margin-top:22px;color:#3e4a61;font-size:8px}.pl-forgot-brand-footer strong{color:#66758f}.pl-forgot-brand-footer i{width:3px;height:3px;border-radius:50%;background:#334155}
@keyframes plForgotCardIn{from{opacity:0;transform:translateY(25px) scale(.985);filter:blur(6px)}to{opacity:1;transform:none;filter:none}}@keyframes plForgotUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}@keyframes plForgotPulse{0%{opacity:.7;transform:scale(.94)}70%,100%{opacity:0;transform:scale(1.12)}}@keyframes plForgotCheck{from{opacity:0;transform:scale(.5)}to{opacity:1;transform:scale(1)}}@keyframes plForgotShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}@keyframes plForgotSuccess{from{opacity:0;transform:scale(.96) translateY(15px)}to{opacity:1;transform:none}}@keyframes plForgotSuccessPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.035)}}@keyframes plForgotFloat{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(20px,-18px,0)}}
@media(max-width:1023px){.pl-forgot-layout{display:block}.pl-forgot-layout>aside{display:none}.pl-forgot-content{padding:25px 18px 35px}.pl-forgot-mobile-head{width:min(100%,570px);display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}.pl-forgot-back{display:flex;align-items:center;gap:7px;color:#7d8ba3;font-size:10px;font-weight:800}.pl-forgot-logo{color:#fff;font-size:18px;font-weight:950;letter-spacing:-.05em}.pl-forgot-logo span{color:#60a5fa}}
@media(max-width:600px){.pl-forgot-content{padding:18px 12px 25px}.pl-forgot-card{border-radius:27px}.pl-forgot-inner{padding:28px 20px}.pl-forgot-header h1,.pl-forgot-success h1{font-size:34px}.pl-forgot-security{align-items:flex-start}.pl-forgot-secure-status{display:none}.pl-forgot-footer{flex-direction:column;align-items:center}.pl-forgot-brand-footer{flex-wrap:wrap;text-align:center}}
@media(prefers-reduced-motion:reduce){.pl-forgot-page *,.pl-forgot-page *::before,.pl-forgot-page *::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}
`;
