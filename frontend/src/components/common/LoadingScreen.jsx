import {
  BrainCircuit,
  Loader2,
  Sparkles,
} from "lucide-react";

/* =========================================================
   PROBLEMLENS — PREMIUM LOADING SCREEN
   ========================================================= */

export default function LoadingScreen({
  fullScreen = false,

  label = "Loading workspace...",
  description = "Preparing your ProblemLens experience",

  progress = null,
  showProgress = false,

  variant = "premium",

  compact = false,

  className = "",
}) {
  const variants = {
    default: {
      background: `
        bg-slate-50
        dark:bg-slate-950
      `,
      glow: "bg-slate-400/10",
      icon: `
        border-slate-200
        bg-white
        text-slate-500
        dark:border-white/[0.08]
        dark:bg-white/[0.04]
        dark:text-slate-300
      `,
    },

    premium: {
      background: `
        bg-gradient-to-br
        from-slate-50
        via-indigo-50/40
        to-violet-50/50
        dark:from-slate-950
        dark:via-indigo-950/20
        dark:to-violet-950/20
      `,
      glow: "bg-indigo-500/10",
      icon: `
        border-indigo-100/80
        bg-gradient-to-br
        from-white
        to-indigo-50
        text-indigo-600
        dark:border-indigo-400/15
        dark:from-white/[0.07]
        dark:to-indigo-400/10
        dark:text-indigo-300
      `,
    },

    ai: {
      background: `
        bg-gradient-to-br
        from-violet-50/60
        via-white
        to-indigo-50/60
        dark:from-violet-950/20
        dark:via-slate-950
        dark:to-indigo-950/20
      `,
      glow: "bg-violet-500/10",
      icon: `
        border-violet-200/80
        bg-gradient-to-br
        from-violet-50
        to-indigo-50
        text-violet-600
        dark:border-violet-400/15
        dark:from-violet-400/10
        dark:to-indigo-400/10
        dark:text-violet-300
      `,
    },
  };

  const selectedVariant =
    variants[variant] || variants.premium;

  const safeProgress =
    typeof progress === "number"
      ? Math.max(0, Math.min(100, progress))
      : null;

  const wrapperClasses = fullScreen
    ? `
        min-h-screen
        w-full
      `
    : `
        min-h-[240px]
        w-full
      `;

  return (
    <div
      className={[
        "relative isolate flex items-center justify-center overflow-hidden",
        wrapperClasses,
        selectedVariant.background,
        className,
      ].join(" ")}
      role="status"
      aria-live="polite"
    >
      {/* ===================================================
          AMBIENT BACKGROUND
      =================================================== */}

      <span
        aria-hidden="true"
        className={`
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          -z-10
          h-[420px]
          w-[420px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          blur-[110px]
          ${selectedVariant.glow}
          animate-[loadingPulse_4s_ease-in-out_infinite]
        `}
      />

      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -left-24
          -top-24
          -z-10
          h-64
          w-64
          rounded-full
          bg-indigo-500/[0.035]
          blur-3xl
        "
      />

      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -bottom-24
          -right-24
          -z-10
          h-72
          w-72
          rounded-full
          bg-violet-500/[0.035]
          blur-3xl
        "
      />

      {/* ===================================================
          GRID
      =================================================== */}

      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          -z-10
          opacity-[0.025]
          dark:opacity-[0.018]
          [background-image:linear-gradient(rgba(99,102,241,1)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,1)_1px,transparent_1px)]
          [background-size:32px_32px]
        "
      />

      {/* ===================================================
          CONTENT
      =================================================== */}

      <div
        className={[
          "relative z-10 flex flex-col items-center text-center",
          compact
            ? "px-5 py-8"
            : "px-6 py-12",
        ].join(" ")}
      >
        {/* =================================================
            LOADER
        ================================================= */}

        <div
          className="
            relative
            flex
            h-24
            w-24
            items-center
            justify-center
          "
        >
          {/* Outer orbit */}

          <span
            aria-hidden="true"
            className="
              absolute
              inset-0
              rounded-full
              border
              border-indigo-200/50
              dark:border-indigo-400/10
              animate-[loadingOrbit_5s_linear_infinite]
            "
          />

          {/* Second orbit */}

          <span
            aria-hidden="true"
            className="
              absolute
              inset-2
              rounded-full
              border
              border-dashed
              border-violet-200/60
              dark:border-violet-400/10
              animate-[loadingOrbitReverse_7s_linear_infinite]
            "
          />

          {/* Orbit dot */}

          <span
            aria-hidden="true"
            className="
              absolute
              -right-0.5
              top-1/2
              h-2
              w-2
              -translate-y-1/2
              rounded-full
              bg-indigo-500
              shadow-[0_0_14px_rgba(99,102,241,0.7)]
              dark:bg-indigo-400
            "
          />

          {/* Icon container */}

          <div
            className={`
              relative
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              border
              shadow-[0_15px_45px_rgba(79,70,229,0.12)]
              backdrop-blur-xl
              ${selectedVariant.icon}
            `}
          >
            {/* Inner shine */}

            <span
              aria-hidden="true"
              className="
                absolute
                inset-0
                rounded-2xl
                bg-gradient-to-br
                from-white/80
                to-transparent
                dark:from-white/[0.07]
              "
            />

            {variant === "ai" ? (
              <Sparkles
                className="
                  relative
                  z-10
                  h-6
                  w-6
                  animate-pulse
                "
                aria-hidden="true"
              />
            ) : (
              <BrainCircuit
                className="
                  relative
                  z-10
                  h-6
                  w-6
                  animate-pulse
                "
                aria-hidden="true"
              />
            )}
          </div>
        </div>

        {/* =================================================
            LABEL
        ================================================= */}

        <div className="mt-7 max-w-md">
          <h2
            className="
              text-base
              font-bold
              tracking-[-0.025em]
              text-slate-900
              dark:text-white
              sm:text-lg
            "
          >
            {label}
          </h2>

          {description && (
            <p
              className="
                mt-2
                text-xs
                leading-5
                text-slate-500
                dark:text-slate-400
                sm:text-sm
              "
            >
              {description}
            </p>
          )}
        </div>

        {/* =================================================
            PROGRESS
        ================================================= */}

        {showProgress && (
          <div className="mt-6 w-full max-w-xs">
            <div className="mb-2 flex items-center justify-between">
              <span
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.14em]
                  text-slate-400
                  dark:text-slate-500
                "
              >
                Progress
              </span>

              <span
                className="
                  text-xs
                  font-bold
                  tabular-nums
                  text-indigo-600
                  dark:text-indigo-300
                "
              >
                {safeProgress !== null
                  ? `${Math.round(safeProgress)}%`
                  : "Working"}
              </span>
            </div>

            <div
              className="
                relative
                h-1.5
                overflow-hidden
                rounded-full
                bg-slate-200/80
                dark:bg-white/[0.07]
              "
            >
              {safeProgress !== null ? (
                <div
                  className="
                    h-full
                    rounded-full
                    bg-gradient-to-r
                    from-indigo-500
                    via-violet-500
                    to-indigo-500
                    transition-[width]
                    duration-500
                    ease-out
                  "
                  style={{
                    width: `${safeProgress}%`,
                  }}
                />
              ) : (
                <div
                  className="
                    h-full
                    w-1/3
                    rounded-full
                    bg-gradient-to-r
                    from-transparent
                    via-indigo-500
                    to-transparent
                    animate-[loadingProgress_1.5s_ease-in-out_infinite]
                  "
                />
              )}
            </div>
          </div>
        )}

        {/* =================================================
            STATUS
        ================================================= */}

        <div
          className="
            mt-5
            flex
            items-center
            gap-2
            rounded-full
            border
            border-slate-200/70
            bg-white/60
            px-3
            py-1.5
            text-[10px]
            font-semibold
            text-slate-500
            shadow-sm
            backdrop-blur-xl
            dark:border-white/[0.06]
            dark:bg-white/[0.03]
            dark:text-slate-400
          "
        >
          <span
            className="
              relative
              flex
              h-2
              w-2
            "
          >
            <span
              className="
                absolute
                inline-flex
                h-full
                w-full
                animate-ping
                rounded-full
                bg-emerald-400
                opacity-60
              "
            />

            <span
              className="
                relative
                inline-flex
                h-2
                w-2
                rounded-full
                bg-emerald-500
              "
            />
          </span>

          Secure workspace initialization
        </div>
      </div>
    </div>
  );
}