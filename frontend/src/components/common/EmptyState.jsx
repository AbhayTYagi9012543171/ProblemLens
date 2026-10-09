import {
  ArrowRight,
  Inbox,
  Plus,
  Sparkles,
} from "lucide-react";

/* =========================================================
   PROBLEMLENS — PREMIUM EMPTY STATE
   ========================================================= */

export default function EmptyState({
  title = "Nothing here yet",
  description = "Create your first record to get started.",
  action = null,

  icon = null,
  badge = null,

  variant = "default",
  size = "md",

  animated = true,
  glow = true,

  compact = false,

  className = "",
}) {
  const variants = {
    default: {
      wrapper: `
        border-slate-200/80
        bg-gradient-to-br
        from-white
        via-slate-50/70
        to-indigo-50/30
        dark:border-white/[0.08]
        dark:from-slate-900
        dark:via-slate-900
        dark:to-indigo-950/20
      `,
      icon: `
        border-slate-200/80
        bg-white
        text-slate-500
        shadow-[0_10px_30px_rgba(15,23,42,0.07)]
        dark:border-white/[0.08]
        dark:bg-white/[0.05]
        dark:text-slate-300
      `,
      accent: "bg-slate-400/10",
      badge: `
        border-slate-200
        bg-white/80
        text-slate-500
        dark:border-white/[0.08]
        dark:bg-white/[0.04]
        dark:text-slate-400
      `,
    },

    premium: {
      wrapper: `
        border-indigo-100/80
        bg-gradient-to-br
        from-white
        via-indigo-50/30
        to-violet-50/60
        dark:border-indigo-400/10
        dark:from-slate-900
        dark:via-indigo-950/15
        dark:to-violet-950/20
      `,
      icon: `
        border-indigo-100
        bg-gradient-to-br
        from-indigo-50
        to-violet-50
        text-indigo-600
        shadow-[0_12px_35px_rgba(79,70,229,0.12)]
        dark:border-indigo-400/15
        dark:from-indigo-400/10
        dark:to-violet-400/10
        dark:text-indigo-300
      `,
      accent: "bg-indigo-500/10",
      badge: `
        border-indigo-200/70
        bg-white/70
        text-indigo-600
        dark:border-indigo-400/15
        dark:bg-indigo-400/10
        dark:text-indigo-300
      `,
    },

    ai: {
      wrapper: `
        border-violet-200/70
        bg-gradient-to-br
        from-violet-50/70
        via-white
        to-indigo-50/60
        dark:border-violet-400/15
        dark:from-violet-950/25
        dark:via-slate-900
        dark:to-indigo-950/25
      `,
      icon: `
        border-violet-200/80
        bg-gradient-to-br
        from-violet-50
        to-indigo-50
        text-violet-600
        shadow-[0_12px_40px_rgba(124,58,237,0.13)]
        dark:border-violet-400/15
        dark:from-violet-400/10
        dark:to-indigo-400/10
        dark:text-violet-300
      `,
      accent: "bg-violet-500/10",
      badge: `
        border-violet-200/70
        bg-white/70
        text-violet-600
        dark:border-violet-400/15
        dark:bg-violet-400/10
        dark:text-violet-300
      `,
    },

    subtle: {
      wrapper: `
        border-slate-200/60
        bg-slate-50/60
        dark:border-white/[0.06]
        dark:bg-white/[0.025]
      `,
      icon: `
        border-slate-200/70
        bg-white/80
        text-slate-400
        dark:border-white/[0.07]
        dark:bg-white/[0.04]
        dark:text-slate-400
      `,
      accent: "bg-slate-400/5",
      badge: `
        border-slate-200/70
        bg-white/70
        text-slate-500
        dark:border-white/[0.06]
        dark:bg-white/[0.03]
        dark:text-slate-400
      `,
    },
  };

  const selectedVariant =
    variants[variant] || variants.default;

  const sizes = {
    sm: {
      wrapper: "min-h-[180px] py-8",
      icon: "h-11 w-11 rounded-xl",
      iconSize: 20,
      title: "text-sm",
      description: "text-xs",
    },

    md: {
      wrapper: "min-h-[250px] py-12",
      icon: "h-14 w-14 rounded-2xl",
      iconSize: 25,
      title: "text-base",
      description: "text-xs",
    },

    lg: {
      wrapper: "min-h-[330px] py-16",
      icon: "h-16 w-16 rounded-3xl",
      iconSize: 29,
      title: "text-lg",
      description: "text-sm",
    },
  };

  const selectedSize =
    sizes[size] || sizes.md;

  const defaultIcon =
    variant === "ai" ? (
      <Sparkles
        className="h-6 w-6"
        aria-hidden="true"
      />
    ) : (
      <Inbox
        className="h-6 w-6"
        aria-hidden="true"
      />
    );

  return (
    <div
      className={[
        "group relative isolate overflow-hidden",
        "flex w-full flex-col items-center justify-center",
        "rounded-3xl border border-dashed",
        "px-5 text-center sm:px-8",
        "transition-all duration-500",
        selectedSize.wrapper,
        selectedVariant.wrapper,
        className,
      ].join(" ")}
    >
      {/* ===================================================
          TOP HIGHLIGHT
      =================================================== */}

      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-16
          top-0
          h-px
          bg-gradient-to-r
          from-transparent
          via-white
          to-transparent
          opacity-80
          dark:via-white/20
        "
      />

      {/* ===================================================
          AMBIENT GLOW
      =================================================== */}

      {glow && (
        <>
          <span
            aria-hidden="true"
            className={`
              pointer-events-none
              absolute
              -top-24
              left-1/2
              -z-10
              h-52
              w-52
              -translate-x-1/2
              rounded-full
              blur-3xl
              transition-transform
              duration-700
              group-hover:scale-125
              ${selectedVariant.accent}
            `}
          />

          <span
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              -bottom-24
              -right-20
              -z-10
              h-40
              w-40
              rounded-full
              bg-indigo-500/[0.035]
              blur-3xl
            "
          />
        </>
      )}

      {/* ===================================================
          SUBTLE GRID
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
            dark:opacity-[0.02]
            [background-image:linear-gradient(rgba(99,102,241,1)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,1)_1px,transparent_1px)]
            [background-size:24px_24px]
          "
        />
      )}

      {/* ===================================================
          BADGE
      =================================================== */}

      {badge && (
        <div
          className={`
            relative
            z-10
            mb-4
            inline-flex
            items-center
            gap-1.5
            rounded-full
            border
            px-2.5
            py-1
            text-[9px]
            font-bold
            uppercase
            tracking-[0.14em]
            backdrop-blur-xl
            ${selectedVariant.badge}
          `}
        >
          <span
            className="
              h-1.5
              w-1.5
              rounded-full
              bg-current
              opacity-70
            "
          />

          {badge}
        </div>
      )}

      {/* ===================================================
          ICON
      =================================================== */}

      <div
        className={`
          relative
          z-10
          flex
          items-center
          justify-center
          border
          ${selectedSize.icon}
          ${selectedVariant.icon}
          transition-all
          duration-500
          ${
            animated
              ? `
                group-hover:-translate-y-1
                group-hover:scale-105
                group-hover:rotate-1
              `
              : ""
          }
        `}
      >
        {/* Outer pulse */}

        {animated && (
          <span
            aria-hidden="true"
            className="
              absolute
              inset-0
              rounded-[inherit]
              border
              border-indigo-400/10
              opacity-0
              transition-opacity
              duration-500
              group-hover:animate-ping
              group-hover:opacity-100
            "
          />
        )}

        {/* Inner shine */}

        <span
          aria-hidden="true"
          className="
            absolute
            inset-0
            rounded-[inherit]
            bg-gradient-to-br
            from-white/70
            to-transparent
            dark:from-white/[0.06]
          "
        />

        <span className="relative z-10">
          {icon || defaultIcon}
        </span>
      </div>

      {/* ===================================================
          CONTENT
      =================================================== */}

      <div className="relative z-10 mt-5 max-w-xl">
        <h3
          className={`
            font-bold
            tracking-[-0.025em]
            text-slate-900
            dark:text-white
            ${selectedSize.title}
          `}
        >
          {title}
        </h3>

        <p
          className={`
            mx-auto
            mt-2
            max-w-md
            leading-6
            text-slate-500
            dark:text-slate-400
            ${selectedSize.description}
          `}
        >
          {description}
        </p>
      </div>

      {/* ===================================================
          ACTION
      =================================================== */}

      {action && (
        <div
          className={`
            relative
            z-10
            mt-6
            ${
              compact
                ? "w-full sm:w-auto"
                : ""
            }
          `}
        >
          <div
            className="
              inline-flex
              items-center
              transition-transform
              duration-300
              group-hover:translate-y-[-1px]
            "
          >
            {action}

            {!compact && (
              <ArrowRight
                className="
                  ml-2
                  h-3.5
                  w-3.5
                  text-slate-400
                  transition-all
                  duration-300
                  group-hover:translate-x-0.5
                  dark:text-slate-500
                "
                aria-hidden="true"
              />
            )}
          </div>
        </div>
      )}

      {/* ===================================================
          FOOTER DECORATION
      =================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          bottom-5
          left-1/2
          h-px
          w-16
          -translate-x-1/2
          bg-gradient-to-r
          from-transparent
          via-slate-300
          to-transparent
          opacity-50
          dark:via-white/10
        "
      />
    </div>
  );
}