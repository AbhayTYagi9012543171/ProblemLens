import {
  AlertCircle,
  CheckCircle2,
  Info,
  Sparkles,
  TriangleAlert,
  X,
  XCircle,
} from "lucide-react";

/* =========================================================
   PROBLEMLENS — PREMIUM STATUS
   ========================================================= */

export default function Status({
  children,

  type = "info",

  title = null,
  icon = null,

  dismissible = false,
  onDismiss = null,

  compact = false,
  animated = true,
  showIcon = true,

  className = "",
}) {
  const variants = {
    info: {
      wrapper: `
        border-sky-200/70
        bg-sky-50/80
        text-sky-900
        dark:border-sky-400/15
        dark:bg-sky-400/[0.06]
        dark:text-sky-100
      `,
      icon: `
        border-sky-200
        bg-sky-100
        text-sky-600
        dark:border-sky-400/15
        dark:bg-sky-400/10
        dark:text-sky-300
      `,
      accent: "bg-sky-500",
      Icon: Info,
    },

    success: {
      wrapper: `
        border-emerald-200/70
        bg-emerald-50/80
        text-emerald-900
        dark:border-emerald-400/15
        dark:bg-emerald-400/[0.06]
        dark:text-emerald-100
      `,
      icon: `
        border-emerald-200
        bg-emerald-100
        text-emerald-600
        dark:border-emerald-400/15
        dark:bg-emerald-400/10
        dark:text-emerald-300
      `,
      accent: "bg-emerald-500",
      Icon: CheckCircle2,
    },

    warning: {
      wrapper: `
        border-amber-200/70
        bg-amber-50/80
        text-amber-900
        dark:border-amber-400/15
        dark:bg-amber-400/[0.06]
        dark:text-amber-100
      `,
      icon: `
        border-amber-200
        bg-amber-100
        text-amber-600
        dark:border-amber-400/15
        dark:bg-amber-400/10
        dark:text-amber-300
      `,
      accent: "bg-amber-500",
      Icon: TriangleAlert,
    },

    danger: {
      wrapper: `
        border-rose-200/70
        bg-rose-50/80
        text-rose-900
        dark:border-rose-400/15
        dark:bg-rose-400/[0.06]
        dark:text-rose-100
      `,
      icon: `
        border-rose-200
        bg-rose-100
        text-rose-600
        dark:border-rose-400/15
        dark:bg-rose-400/10
        dark:text-rose-300
      `,
      accent: "bg-rose-500",
      Icon: XCircle,
    },

    error: {
      wrapper: `
        border-rose-200/70
        bg-rose-50/80
        text-rose-900
        dark:border-rose-400/15
        dark:bg-rose-400/[0.06]
        dark:text-rose-100
      `,
      icon: `
        border-rose-200
        bg-rose-100
        text-rose-600
        dark:border-rose-400/15
        dark:bg-rose-400/10
        dark:text-rose-300
      `,
      accent: "bg-rose-500",
      Icon: AlertCircle,
    },

    ai: {
      wrapper: `
        border-violet-200/70
        bg-gradient-to-br
        from-violet-50/90
        via-white/80
        to-indigo-50/80
        text-violet-950
        dark:border-violet-400/15
        dark:from-violet-400/[0.08]
        dark:via-indigo-400/[0.04]
        dark:to-indigo-400/[0.06]
        dark:text-violet-100
      `,
      icon: `
        border-violet-200
        bg-violet-100
        text-violet-600
        dark:border-violet-400/15
        dark:bg-violet-400/10
        dark:text-violet-300
      `,
      accent: "bg-violet-500",
      Icon: Sparkles,
    },

    neutral: {
      wrapper: `
        border-slate-200/80
        bg-slate-50/80
        text-slate-800
        dark:border-white/[0.08]
        dark:bg-white/[0.035]
        dark:text-slate-200
      `,
      icon: `
        border-slate-200
        bg-slate-100
        text-slate-600
        dark:border-white/[0.08]
        dark:bg-white/[0.05]
        dark:text-slate-300
      `,
      accent: "bg-slate-500",
      Icon: Info,
    },
  };

  const variant = variants[type] || variants.info;
  const StatusIcon = icon || variant.Icon;

  return (
    <div
      role={
        type === "danger" ||
        type === "error"
          ? "alert"
          : "status"
      }
      className={`
        group
        relative
        isolate
        overflow-hidden
        rounded-2xl
        border
        shadow-sm
        backdrop-blur-xl
        transition-all
        duration-300
        hover:shadow-md
        ${variant.wrapper}
        ${compact ? "px-3 py-2.5" : "p-4"}
        ${className}
      `}
    >
      {/* =================================================
          AMBIENT GLOW
      ================================================= */}

      <span
        aria-hidden="true"
        className={`
          pointer-events-none
          absolute
          -right-10
          -top-10
          -z-10
          h-24
          w-24
          rounded-full
          ${variant.accent}
          opacity-[0.06]
          blur-2xl
          transition-transform
          duration-700
          group-hover:scale-150
        `}
      />

      {/* =================================================
          TOP HIGHLIGHT
      ================================================= */}

      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-6
          top-0
          h-px
          bg-gradient-to-r
          from-transparent
          via-white/80
          to-transparent
          dark:via-white/10
        "
      />

      <div className="flex items-start gap-3">
        {/* =================================================
            ICON
        ================================================= */}

        {showIcon && StatusIcon && (
          <div
            className={`
              relative
              flex
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              shadow-sm
              ${variant.icon}
              ${compact ? "h-8 w-8" : "h-10 w-10"}
              ${
                animated
                  ? "transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-105"
                  : ""
              }
            `}
          >
            <span
              aria-hidden="true"
              className="
                absolute
                inset-0
                rounded-xl
                bg-gradient-to-br
                from-white/70
                to-transparent
                dark:from-white/[0.06]
              "
            />

            <StatusIcon
              className="relative z-10"
              size={compact ? 15 : 18}
              strokeWidth={2.2}
            />

            {/* AI shimmer */}
            {type === "ai" && animated && (
              <span
                aria-hidden="true"
                className="
                  absolute
                  inset-0
                  -translate-x-full
                  bg-gradient-to-r
                  from-transparent
                  via-white/30
                  to-transparent
                  transition-transform
                  duration-1000
                  group-hover:translate-x-full
                "
              />
            )}
          </div>
        )}

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="min-w-0 flex-1">
          {title && (
            <div
              className={`
                font-semibold
                ${compact ? "text-xs" : "text-sm"}
              `}
            >
              {title}
            </div>
          )}

          <div
            className={`
              leading-6
              ${
                title
                  ? "mt-0.5"
                  : ""
              }
              ${
                compact
                  ? "text-xs"
                  : "text-sm"
              }
            `}
          >
            {children}
          </div>
        </div>

        {/* =================================================
            DISMISS
        ================================================= */}

        {dismissible && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss notification"
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-xl
              text-current
              opacity-40
              transition-all
              duration-200
              hover:bg-black/5
              hover:opacity-100
              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-current
              focus-visible:ring-offset-2
              dark:hover:bg-white/[0.06]
              dark:focus-visible:ring-offset-slate-950
            "
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* =================================================
          LEFT ACCENT
      ================================================= */}

      <span
        aria-hidden="true"
        className={`
          absolute
          bottom-3
          left-0
          top-3
          w-0.5
          rounded-r-full
          ${variant.accent}
          opacity-60
        `}
      />
    </div>
  );
}