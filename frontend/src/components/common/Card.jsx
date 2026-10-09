import { useEffect, useRef, useState } from "react";
import {
  Loader2,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  CircleDot,
  Layers3,
  WandSparkles,
} from "lucide-react";

/* =========================================================
   PROBLEMLENS — PREMIUM CARD SYSTEM
   ========================================================= */

const variants = {
  default: `
    bg-white/90
    border-slate-200/75
    shadow-[0_8px_30px_rgba(15,23,42,0.05)]
    dark:bg-slate-900/85
    dark:border-white/[0.08]
    dark:shadow-[0_12px_40px_rgba(0,0,0,0.20)]
  `,

  glass: `
    bg-white/[0.62]
    border-white/75
    backdrop-blur-2xl
    shadow-[0_16px_55px_rgba(15,23,42,0.08)]
    dark:bg-white/[0.045]
    dark:border-white/[0.09]
    dark:shadow-[0_20px_65px_rgba(0,0,0,0.24)]
  `,

  elevated: `
    bg-white
    border-slate-200/70
    shadow-[0_18px_55px_rgba(15,23,42,0.09)]
    dark:bg-slate-900
    dark:border-white/[0.08]
    dark:shadow-[0_22px_65px_rgba(0,0,0,0.28)]
  `,

  premium: `
    bg-gradient-to-br
    from-white
    via-white
    to-indigo-50/70
    border-indigo-100/80
    shadow-[0_18px_55px_rgba(79,70,229,0.10)]
    dark:from-slate-900
    dark:via-slate-900
    dark:to-indigo-950/35
    dark:border-indigo-400/10
  `,

  ai: `
    bg-gradient-to-br
    from-violet-50/90
    via-white
    to-indigo-50/80
    border-violet-200/70
    shadow-[0_18px_60px_rgba(124,58,237,0.11)]
    dark:from-violet-950/35
    dark:via-slate-900
    dark:to-indigo-950/35
    dark:border-violet-400/15
  `,

  success: `
    bg-gradient-to-br
    from-emerald-50/80
    via-white
    to-teal-50/60
    border-emerald-200/70
    shadow-[0_16px_50px_rgba(16,185,129,0.08)]
    dark:from-emerald-950/25
    dark:via-slate-900
    dark:to-teal-950/20
    dark:border-emerald-400/15
  `,

  danger: `
    bg-gradient-to-br
    from-rose-50/80
    via-white
    to-orange-50/50
    border-rose-200/70
    shadow-[0_16px_50px_rgba(225,29,72,0.08)]
    dark:from-rose-950/25
    dark:via-slate-900
    dark:to-orange-950/15
    dark:border-rose-400/15
  `,

  subtle: `
    bg-slate-50/75
    border-slate-200/60
    shadow-none
    dark:bg-white/[0.035]
    dark:border-white/[0.06]
  `,
};

const sizes = {
  sm: "rounded-xl",
  md: "rounded-2xl",
  lg: "rounded-3xl",
  xl: "rounded-[2rem]",
};

const paddingMap = {
  none: "p-0",
  xs: "p-3",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
  xl: "p-8",
};

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

/* =========================================================
   PREMIUM CARD
   ========================================================= */

export default function Card({
  children,

  className = "",
  padding = "p-5",

  variant = "default",
  size = "md",

  hover = false,
  glow = false,
  clickable = false,

  loading = false,
  loadingText = "Loading...",

  header = null,
  footer = null,

  title = null,
  description = null,

  icon = null,

  badge = null,

  action = null,

  showArrow = false,

  spotlight = true,
  shine = true,

  interactive = false,

  accent = false,

  ...props
}) {
  const cardRef = useRef(null);

  const [pointer, setPointer] = useState({
    x: 50,
    y: 50,
  });

  const selectedVariant =
    variants[variant] || variants.default;

  const selectedSize =
    sizes[size] || sizes.md;

  const resolvedPadding =
    paddingMap[padding] || padding;

  const hasHeader =
    Boolean(header || title || description || icon || badge || action);

  const isInteractive =
    interactive || hover || clickable;

  /* =======================================================
     POINTER SPOTLIGHT
     ======================================================= */

  useEffect(() => {
    if (!spotlight || !isInteractive) return;

    const element = cardRef.current;

    if (!element) return;

    const handlePointerMove = (event) => {
      const rect = element.getBoundingClientRect();

      const x =
        ((event.clientX - rect.left) / rect.width) * 100;

      const y =
        ((event.clientY - rect.top) / rect.height) * 100;

      setPointer({
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
      });
    };

    const handlePointerLeave = () => {
      setPointer({
        x: 50,
        y: 50,
      });
    };

    element.addEventListener(
      "pointermove",
      handlePointerMove
    );

    element.addEventListener(
      "pointerleave",
      handlePointerLeave
    );

    return () => {
      element.removeEventListener(
        "pointermove",
        handlePointerMove
      );

      element.removeEventListener(
        "pointerleave",
        handlePointerLeave
      );
    };
  }, [spotlight, isInteractive]);

  /* =======================================================
     ACCESSIBLE CLICK SUPPORT
     ======================================================= */

  const handleKeyDown = (event) => {
    if (!clickable) return;

    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();

      props.onClick?.(event);
    }
  };

  return (
    <section
      ref={cardRef}
      tabIndex={clickable ? 0 : undefined}
      role={clickable ? "button" : undefined}
      onKeyDown={clickable ? handleKeyDown : undefined}
      style={
        spotlight && isInteractive
          ? {
              "--card-pointer-x": `${pointer.x}%`,
              "--card-pointer-y": `${pointer.y}%`,
            }
          : undefined
      }
      className={cn(
        "group relative isolate overflow-hidden",
        "border",
        selectedSize,
        selectedVariant,

        "transition-[transform,box-shadow,border-color,background-color]",
        "duration-500",
        "ease-[cubic-bezier(.22,1,.36,1)]",

        isInteractive &&
          `
            cursor-pointer
            will-change-transform
            hover:-translate-y-1
            hover:scale-[1.005]
            hover:border-slate-300/80
            hover:shadow-[0_24px_70px_rgba(15,23,42,0.11)]
            dark:hover:border-white/[0.14]
            dark:hover:shadow-[0_28px_80px_rgba(0,0,0,0.30)]
          `,

        clickable &&
          `
            active:translate-y-0
            active:scale-[0.995]
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-indigo-500/50
            focus-visible:ring-offset-2
            dark:focus-visible:ring-indigo-400/50
            dark:focus-visible:ring-offset-slate-950
          `,

        className
      )}
      {...props}
    >
      {/* ===================================================
          TOP GLASS HIGHLIGHT
      =================================================== */}

      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-8
          top-0
          z-30
          h-px
          rounded-full
          bg-gradient-to-r
          from-transparent
          via-white
          to-transparent
          opacity-80
          dark:via-white/25
        "
      />

      {/* ===================================================
          PREMIUM SHINE
      =================================================== */}

      {shine && (
        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -left-1/2
            top-0
            z-20
            h-full
            w-1/3
            -skew-x-12
            bg-gradient-to-r
            from-transparent
            via-white/30
            to-transparent
            opacity-0
            transition-all
            duration-1000
            group-hover:left-[120%]
            group-hover:opacity-100
            dark:via-white/[0.06]
          "
        />
      )}

      {/* ===================================================
          POINTER SPOTLIGHT
      =================================================== */}

      {spotlight && isInteractive && (
        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            z-0
            opacity-0
            transition-opacity
            duration-500
            group-hover:opacity-100
          "
          style={{
            background:
              "radial-gradient(280px circle at var(--card-pointer-x) var(--card-pointer-y), rgba(99,102,241,0.11), transparent 65%)",
          }}
        />
      )}

      {/* ===================================================
          AMBIENT GLOW
      =================================================== */}

      {glow && (
        <>
          <span
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              -right-24
              -top-24
              -z-10
              h-56
              w-56
              rounded-full
              bg-indigo-500/10
              blur-3xl
              transition-all
              duration-700
              group-hover:scale-125
              group-hover:bg-indigo-500/15
              dark:bg-indigo-400/10
            "
          />

          <span
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              -bottom-24
              -left-24
              -z-10
              h-48
              w-48
              rounded-full
              bg-violet-500/[0.06]
              blur-3xl
              transition-transform
              duration-700
              group-hover:scale-125
              dark:bg-violet-400/[0.05]
            "
          />
        </>
      )}

      {/* ===================================================
          PREMIUM GRID
      =================================================== */}

      {(variant === "premium" ||
        variant === "ai") && (
        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            -z-10
            opacity-[0.035]
            dark:opacity-[0.025]
            [background-image:linear-gradient(rgba(99,102,241,1)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,1)_1px,transparent_1px)]
            [background-size:24px_24px]
          "
        />
      )}

      {/* ===================================================
          ACCENT ORB
      =================================================== */}

      {accent && (
        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -right-8
            -top-8
            h-24
            w-24
            rounded-full
            bg-gradient-to-br
            from-indigo-500/20
            via-violet-500/10
            to-transparent
            blur-2xl
            transition-transform
            duration-700
            group-hover:scale-150
          "
        />
      )}

      {/* ===================================================
          HEADER
      =================================================== */}

      {hasHeader && (
        <div
          className={cn(
            "relative z-10",
            resolvedPadding,
            "pb-0"
          )}
        >
          {header ? (
            header
          ) : (
            <div className="flex items-start gap-3">
              {/* ICON */}

              {icon && (
                <div
                  className="
                    relative
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-2xl
                    border
                    border-indigo-100/80
                    bg-gradient-to-br
                    from-indigo-50
                    to-violet-50
                    text-indigo-600
                    shadow-[0_6px_20px_rgba(79,70,229,0.10)]
                    transition-all
                    duration-500
                    group-hover:scale-105
                    group-hover:rotate-1
                    dark:border-indigo-400/15
                    dark:from-indigo-400/10
                    dark:to-violet-400/10
                    dark:text-indigo-300
                  "
                >
                  <span
                    aria-hidden="true"
                    className="
                      absolute
                      inset-0
                      bg-gradient-to-br
                      from-white/70
                      to-transparent
                      dark:from-white/[0.06]
                    "
                  />

                  <span className="relative z-10">
                    {icon}
                  </span>
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {title && (
                      <h3
                        className="
                          truncate
                          text-sm
                          font-bold
                          tracking-[-0.02em]
                          text-slate-950
                          dark:text-white
                        "
                      >
                        {title}
                      </h3>
                    )}

                    {description && (
                      <p
                        className="
                          mt-1
                          max-w-2xl
                          text-xs
                          leading-5
                          text-slate-500
                          dark:text-slate-400
                        "
                      >
                        {description}
                      </p>
                    )}
                  </div>

                  {showArrow && (
                    <ArrowUpRight
                      className="
                        mt-0.5
                        h-4
                        w-4
                        shrink-0
                        text-slate-400
                        transition-all
                        duration-300
                        group-hover:-translate-y-0.5
                        group-hover:translate-x-0.5
                        group-hover:text-indigo-500
                        dark:text-slate-500
                        dark:group-hover:text-indigo-300
                      "
                      aria-hidden="true"
                    />
                  )}
                </div>

                {badge && (
                  <div className="mt-2">
                    {badge}
                  </div>
                )}
              </div>

              {action && (
                <div className="shrink-0">
                  {action}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ===================================================
          CONTENT
      =================================================== */}

      <div
        className={cn(
          "relative z-10",
          resolvedPadding,

          hasHeader
            ? "pt-4"
            : "",

          footer
            ? "pb-4"
            : ""
        )}
      >
        {loading ? (
          <PremiumLoader
            loadingText={loadingText}
          />
        ) : (
          children
        )}
      </div>

      {/* ===================================================
          FOOTER
      =================================================== */}

      {footer && (
        <div
          className="
            relative
            z-10
            border-t
            border-slate-100/80
            bg-slate-50/40
            px-5
            py-3.5
            backdrop-blur-xl
            dark:border-white/[0.06]
            dark:bg-white/[0.018]
          "
        >
          {footer}
        </div>
      )}

      {/* ===================================================
          AI BADGE
      =================================================== */}

      {variant === "ai" && (
        <div
          className="
            pointer-events-none
            absolute
            right-4
            top-4
            z-30
            flex
            items-center
            gap-1.5
            rounded-full
            border
            border-violet-200/70
            bg-white/70
            px-2.5
            py-1
            text-[9px]
            font-bold
            uppercase
            tracking-[0.14em]
            text-violet-600
            shadow-[0_4px_16px_rgba(124,58,237,0.08)]
            backdrop-blur-xl
            dark:border-violet-400/15
            dark:bg-violet-400/10
            dark:text-violet-300
          "
        >
          <Sparkles
            className="
              h-3 w-3
              animate-pulse
            "
            aria-hidden="true"
          />

          AI
        </div>
      )}

      {/* ===================================================
          PREMIUM STATUS
      =================================================== */}

      {variant === "premium" && (
        <div
          className="
            pointer-events-none
            absolute
            bottom-3
            right-4
            z-20
            flex
            items-center
            gap-1.5
            text-[9px]
            font-semibold
            uppercase
            tracking-[0.12em]
            text-indigo-500/70
            opacity-0
            transition-opacity
            duration-300
            group-hover:opacity-100
            dark:text-indigo-300/60
          "
        >
          <CircleDot
            className="h-3 w-3"
            aria-hidden="true"
          />

          Premium
        </div>
      )}
    </section>
  );
}

/* =========================================================
   PREMIUM LOADER
   ========================================================= */

function PremiumLoader({
  loadingText = "Loading...",
}) {
  return (
    <div
      className="
        flex
        min-h-[150px]
        flex-col
        items-center
        justify-center
        gap-4
        text-center
      "
      role="status"
      aria-live="polite"
    >
      {/* ICON */}

      <div
        className="
          relative
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-2xl
          border
          border-indigo-100
          bg-gradient-to-br
          from-indigo-50
          to-violet-50
          text-indigo-600
          shadow-[0_8px_25px_rgba(79,70,229,0.12)]
          dark:border-indigo-400/15
          dark:from-indigo-400/10
          dark:to-violet-400/10
          dark:text-indigo-300
        "
      >
        <span
          aria-hidden="true"
          className="
            absolute
            inset-0
            animate-ping
            rounded-2xl
            border
            border-indigo-400/20
          "
        />

        <Loader2
          className="relative z-10 h-5 w-5 animate-spin"
          aria-hidden="true"
        />
      </div>

      {/* TEXT */}

      <div>
        <p
          className="
            text-sm
            font-bold
            tracking-[-0.01em]
            text-slate-800
            dark:text-slate-200
          "
        >
          {loadingText}
        </p>

        <p
          className="
            mt-1
            text-xs
            text-slate-400
            dark:text-slate-500
          "
        >
          Preparing your workspace
        </p>
      </div>

      {/* PROGRESS */}

      <div
        className="
          h-1
          w-32
          overflow-hidden
          rounded-full
          bg-slate-100
          dark:bg-white/[0.06]
        "
      >
        <span
          className="
            block
            h-full
            w-1/2
            animate-[cardLoading_1.4s_ease-in-out_infinite]
            rounded-full
            bg-gradient-to-r
            from-indigo-500
            via-violet-500
            to-indigo-500
          "
        />
      </div>
    </div>
  );
}