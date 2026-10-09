import React, { useMemo } from "react";
import {
  Brain, Search, BarChart3, Lightbulb, ShieldCheck, Zap, Users,
  Send, Lock, CheckCircle2, TrendingUp, Sparkles, ArrowUpRight,
  Activity, Target, Layers3, Radar
} from "lucide-react";

const screens = {
  login: {
    eyebrow: "Opportunity intelligence platform",
    title: <>See the signal.<br/><em>Find the opportunity.</em></>,
    description: "ProblemLens transforms real-world conversations into structured intelligence so you can understand pain, demand, and opportunity before you build.",
    icon: Radar,
  },
  register: {
    eyebrow: "Build from evidence",
    title: <>Your next idea<br/><em>starts with a problem.</em></>,
    description: "Create a workspace for discovering, validating, and prioritizing meaningful problems with AI-assisted intelligence.",
    icon: Sparkles,
  },
  forgot: {
    eyebrow: "Protected recovery",
    title: <>Get back to<br/><em>your intelligence.</em></>,
    description: "Recover your workspace through a secure, simple flow designed to keep your account protected.",
    icon: ShieldCheck,
  },
  reset: {
    eyebrow: "Security center",
    title: <>Protect your<br/><em>workspace.</em></>,
    description: "Create a stronger password and keep your research, insights, and opportunity data protected.",
    icon: Lock,
  },
};

function FloatingOrb({ className = "" }) {
  return <div className={`pointer-events-none absolute rounded-full blur-3xl ${className}`} />;
}

function SignalCard() {
  return (
    <div className="signal-card absolute bottom-12 right-6 w-[280px] rounded-[24px] border border-white/10 bg-[#0b1224]/75 p-4 shadow-2xl backdrop-blur-2xl xl:right-12">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[8px] font-black uppercase tracking-[.2em] text-slate-600">Live signal</p>
          <p className="mt-1 text-xs font-bold text-white">Student productivity</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/15 bg-emerald-400/5 px-2 py-1 text-[8px] font-bold text-emerald-300">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> Active
        </span>
      </div>

      <div className="mt-4 flex h-20 items-end gap-1">
        {[22, 34, 28, 45, 39, 58, 51, 67, 61, 74, 70, 86, 79, 93].map((height, i) => (
          <span
            key={i}
            className="signal-bar flex-1 rounded-t-sm bg-gradient-to-t from-indigo-500/10 via-cyan-400/50 to-cyan-300"
            style={{ height: `${height}%`, animationDelay: `${i * 70}ms` }}
          />
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
        <span className="text-[9px] text-slate-600">Demand trajectory</span>
        <span className="flex items-center gap-1 text-[9px] font-bold text-cyan-300">
          <TrendingUp className="h-3 w-3" /> +24.8%
        </span>
      </div>
    </div>
  );
}

export default function AuthVisual({ view = "login" }) {
  const data = useMemo(() => screens[view] || screens.login, [view]);
  const Icon = data.icon;

  return (
    <aside className="elite-visual relative hidden min-h-screen w-[50%] overflow-hidden bg-[#02050d] text-white lg:flex">
      <FloatingOrb className="elite-orb left-[-15%] top-[-12%] h-[500px] w-[500px] bg-indigo-600/20" />
      <FloatingOrb className="elite-orb elite-orb-delay right-[-12%] top-[25%] h-[420px] w-[420px] bg-cyan-500/15" />
      <FloatingOrb className="elite-orb bottom-[-18%] left-[25%] h-[430px] w-[430px] bg-fuchsia-600/10" />

      <div className="elite-grid absolute inset-0 opacity-50" />
      <div className="elite-scan absolute inset-y-0 left-0 w-1/2" />
      <div className="elite-vignette absolute inset-0" />

      <div className="relative z-10 flex min-h-screen w-full flex-col px-9 py-8 xl:px-14 xl:py-10 2xl:px-16">
        <header className="flex items-center justify-between">
          <div className="group flex items-center gap-3">
            <div className="logo-shell relative flex h-12 w-12 items-center justify-center rounded-[17px] border border-cyan-300/20 bg-white/[0.035] shadow-[0_0_45px_rgba(34,211,238,.08)] backdrop-blur-xl">
              <div className="absolute inset-[4px] rounded-[13px] border border-white/5" />
              <Brain className="relative h-6 w-6 text-cyan-300 transition-transform duration-700 group-hover:rotate-[12deg] group-hover:scale-110" />
            </div>
            <div>
              <div className="text-[22px] font-black tracking-[-.055em]">Problem<span className="text-cyan-300">Lens</span></div>
              <div className="text-[8px] font-bold uppercase tracking-[.25em] text-slate-600">Opportunity intelligence</div>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-white/[.07] bg-white/[.025] px-3 py-2 text-[8px] font-bold uppercase tracking-[.16em] text-slate-600 xl:flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300 shadow-[0_0_12px_#67e8f9]" />
            AI engine operational
          </div>
        </header>

        <div className="relative my-auto max-w-[690px] py-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/10 bg-cyan-300/[.04] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.2em] text-cyan-300">
            <Icon className="h-3 w-3" />
            {data.eyebrow}
          </div>

          <h2 className="elite-title max-w-2xl text-[clamp(3.1rem,5vw,5.8rem)] font-black leading-[.93] tracking-[-.065em]">
            {data.title}
          </h2>

          <p className="mt-7 max-w-[560px] text-[13px] leading-7 text-slate-500 xl:text-[15px]">
            {data.description}
          </p>

          <div className="mt-9 grid grid-cols-3 gap-2.5 max-w-[600px]">
            {[
              [Search, "Discover", "Real pain"],
              [BarChart3, "Measure", "Demand"],
              [Lightbulb, "Create", "Opportunity"],
            ].map(([Item, title, sub], i) => (
              <div key={title} className="feature-tile group rounded-2xl border border-white/[.06] bg-white/[.025] p-3.5 backdrop-blur-xl">
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-300/10 bg-cyan-300/[.04]">
                  <Item className="h-4 w-4 text-cyan-300 transition-transform duration-500 group-hover:scale-110" />
                </div>
                <p className="text-[10px] font-black text-white">{title}</p>
                <p className="mt-1 text-[8px] text-slate-600">{sub}</p>
                <div className="mt-3 h-px w-full overflow-hidden bg-white/5">
                  <span className="feature-line block h-full w-1/2 bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
                </div>
              </div>
            ))}
          </div>

          <div className="relative mt-7 h-[115px] max-w-[600px] overflow-hidden rounded-[24px] border border-white/[.06] bg-white/[.018] p-5">
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-cyan-400/[.025] to-transparent" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[.2em] text-slate-700">Opportunity score</p>
                <div className="mt-1 flex items-end gap-2">
                  <span className="text-4xl font-black tracking-[-.06em] text-white">91</span>
                  <span className="mb-1 text-[9px] font-bold text-emerald-300">HIGH POTENTIAL</span>
                </div>
              </div>
              <div className="score-ring relative flex h-16 w-16 items-center justify-center rounded-full border border-cyan-300/15 bg-cyan-300/[.025]">
                <div className="absolute inset-2 rounded-full border border-cyan-300/10" />
                <Target className="h-5 w-5 text-cyan-200" />
              </div>
            </div>
          </div>
        </div>

        <SignalCard />

        <footer className="flex items-center justify-between border-t border-white/[.06] pt-5 pr-[300px]">
          <div className="flex items-center gap-2 text-[9px] font-semibold text-slate-700">
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-400/50" />
            Secure workspace • Evidence-led decisions
          </div>
          <div className="hidden items-center gap-2 text-[9px] font-bold text-slate-700 xl:flex">
            <Activity className="h-3.5 w-3.5 text-emerald-400/60" /> Live intelligence
          </div>
        </footer>
      </div>

      <style>{`
        .elite-grid {
          background-image: linear-gradient(rgba(100,116,139,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(100,116,139,.055) 1px,transparent 1px);
          background-size: 42px 42px;
          mask-image: radial-gradient(circle at 50% 50%,black 10%,transparent 78%);
        }
        .elite-vignette { background:radial-gradient(circle at 50% 42%,transparent 15%,rgba(2,5,13,.55) 72%,#02050d 100%); }
        .elite-scan { background:linear-gradient(90deg,transparent,rgba(34,211,238,.035),transparent); transform:skewX(-15deg); animation:scan 9s ease-in-out infinite; }
        .elite-orb { animation:orbFloat 9s ease-in-out infinite; }
        .elite-orb-delay { animation-delay:-4s; }
        .logo-shell { animation:logoPulse 5s ease-in-out infinite; }
        .elite-title { animation:titleIn .9s cubic-bezier(.16,1,.3,1) both; }
        .feature-tile { animation:tileIn .7s cubic-bezier(.16,1,.3,1) both; }
        .feature-tile:nth-child(2){animation-delay:.1s}.feature-tile:nth-child(3){animation-delay:.2s}
        .feature-line { animation:lineSweep 3.5s ease-in-out infinite; }
        .signal-card { animation:signalFloat 5s ease-in-out infinite; }
        .signal-bar { animation:bars 2.8s ease-in-out infinite alternate; transform-origin:bottom; }
        .score-ring { animation:ringPulse 3s ease-in-out infinite; }
        @keyframes orbFloat { 0%,100%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(25px,-20px,0) scale(1.08)} }
        @keyframes scan { 0%,100%{transform:translateX(-120%) skewX(-15deg)} 50%{transform:translateX(240%) skewX(-15deg)} }
        @keyframes logoPulse { 0%,100%{box-shadow:0 0 25px rgba(34,211,238,.03)}50%{box-shadow:0 0 45px rgba(34,211,238,.1)} }
        @keyframes titleIn { from{opacity:0;transform:translateY(20px);filter:blur(8px)}to{opacity:1;transform:none;filter:none} }
        @keyframes tileIn { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none} }
        @keyframes lineSweep { 0%,100%{transform:translateX(-130%)}50%{transform:translateX(260%)} }
        @keyframes signalFloat { 0%,100%{transform:translateY(0) rotate(.2deg)}50%{transform:translateY(-7px) rotate(-.2deg)} }
        @keyframes bars { from{transform:scaleY(.75);opacity:.65}to{transform:scaleY(1);opacity:1} }
        @keyframes ringPulse { 0%,100%{box-shadow:0 0 0 rgba(34,211,238,0)}50%{box-shadow:0 0 28px rgba(34,211,238,.12)} }
        @media (prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important}}
      `}</style>
    </aside>
  );
}
