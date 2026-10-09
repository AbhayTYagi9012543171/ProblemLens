import {
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

/* =========================================================
   PROBLEMLENS — PREMIUM PAGE HEADER
   ========================================================= */

export default function PageHeader({
  eyebrow,
  title,
  description,
  action,

  icon = null,
  badge = null,
  meta = null,

  showStatus = false,
  showArrow = false,

  variant = "default",

  className = "",
}) {
  const variants = {
    default: {
      wrapper: `
        border-slate-200/70
        bg-white/70
        dark:border-white/[0.07]
        dark:bg-white/[0.025]
      `,
      eyebrow: `
        text-indigo-600
        dark:text-indigo-300
      `,
      icon: `
        border-indigo-100
        bg-indigo-50
        text-indigo-600
        dark:border-indigo-400/15
        dark:bg-indigo-400/10
        dark:text-indigo-300
      `,
    },

    premium: {
      wrapper: `
        border-indigo-100/70
        bg-gradient-to-br
        from-white
        via-white
        to-indigo-50/45
        dark:border-indigo-400/10
        dark:from-slate-950
        dark:via-slate-950
        dark:to-indigo-950/20
      `,
      eyebrow: `
        text-indigo-600
        dark:text-indigo-300
      `,
      icon: `
        border-indigo-100
        bg-gradient-to-br
        from-indigo-50
        to-violet-50
        text-indigo-600
        dark:border-indigo-400/15
        dark:from-indigo-400/10
        dark:to-violet-400/10
        dark:text-indigo-300
      `,
    },

    ai: {
      wrapper: `
        border-violet-200/70
        bg-gradient-to-br
        from-violet-50/40
        via-white
        to-indigo-50/40
        dark:border-violet-400/15
        dark:from-violet-950/20
        dark:via-slate-950
        dark:to-indigo-950/20
      `,
      eyebrow: `
        text-violet-600
        dark:text-violet-300
      `,
      icon: `
        border-violet-200
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

    minimal: {
      wrapper: `
        border-transparent
        bg-transparent
      `,
      eyebrow: `
        text-slate-500
        dark:text-slate-400
      `,
      icon: `
        border-slate-200
        bg-slate-100
        text-slate-500
        dark:border-white/[0.08]
        dark:bg-white/[0.05]
        dark:text-slate-300
      `,
    },
  };

  const selectedVariant =
    variants[variant] || variants.default;

  return (
    <header
      className={`
        group
        relative
        isolate
        mb-6
        overflow-hidden
        rounded-3xl
        border
        px-5
        py-5
        sm:px-6
        sm:py-6
        ${selectedVariant.wrapper}
        ${className}
      `}
    >
      {/* ===================================================
          TOP HIGHLIGHT
      =================================================== */}

      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-10
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

      {variant !== "minimal" && (
        <>
          <span
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              -right-24
              -top-28
              -z-10
              h-64
              w-64
              rounded-full
              bg-indigo-500/[0.07]
              blur-3xl
              transition-transform
              duration-700
              group-hover:scale-125
              dark:bg-indigo-400/[0.05]
            "
          />

          <span
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              -bottom-28
              left-1/3
              -z-10
              h-48
              w-48
              rounded-full
              bg-violet-500/[0.035]
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
            opacity-[0.03]
            dark:opacity-[0.018]
            [background-image:linear-gradient(rgba(99,102,241,1)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,1)_1px,transparent_1px)]
            [background-size:28px_28px]
          "
        />
      )}

      {/* ===================================================
          LAYOUT
      =================================================== */}

      <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        {/* =================================================
            LEFT CONTENT
        ================================================= */}

        <div className="min-w-0">
          <div className="flex items-start gap-3">
            {/* ICON */}

            {icon && (
              <div
                className={`
                  relative
                  mt-0.5
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-2xl
                  border
                  shadow-sm
                  transition-all
                  duration-500
                  group-hover:-translate-y-0.5
                  group-hover:scale-105
                  ${selectedVariant.icon}
                `}
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

            <div className="min-w-0">
              {/* =================================================
                  EYEBROW
              ================================================= */}

              {eyebrow && (
                <div className="mb-2.5 flex flex-wrap items-center gap-2">
                  {showStatus && (
                    <span
                      className="
                        relative
                        flex
                        h-2
                        w-2
                      "
                      aria-label="Active"
                    >
                      <span
                        aria-hidden="true"
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
                        aria-hidden="true"
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
                  )}

                  <span
                    className={`
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.16em]
                      ${selectedVariant.eyebrow}
                    `}
                  >
                    {eyebrow}
                  </span>

                  {badge && (
                    <span
                      className="
                        inline-flex
                        items-center
                        gap-1
                        rounded-full
                        border
                        border-slate-200/80
                        bg-white/70
                        px-2
                        py-1
                        text-[9px]
                        font-bold
                        uppercase
                        tracking-[0.1em]
                        text-slate-500
                        shadow-sm
                        backdrop-blur-xl
                        dark:border-white/[0.07]
                        dark:bg-white/[0.04]
                        dark:text-slate-400
                      "
                    >
                      {variant === "ai" && (
                        <Sparkles
                          className="h-2.5 w-2.5"
                          aria-hidden="true"
                        />
                      )}

                      {badge}
                    </span>
                  )}
                </div>
              )}

              {/* =================================================
                  TITLE
              ================================================= */}

              <div className="flex items-center gap-2">
                <h1
                  className="
                    font-['Manrope']
                    text-2xl
                    font-extrabold
                    leading-tight
                    tracking-[-0.035em]
                    text-slate-950
                    transition-colors
                    duration-300
                    sm:text-3xl
                    lg:text-[2rem]
                    dark:text-white
                  "
                >
                  {title}
                </h1>

                {showArrow && (
                  <ArrowUpRight
                    className="
                      hidden
                      h-5
                      w-5
                      shrink-0
                      text-slate-300
                      transition-all
                      duration-300
                      group-hover:-translate-y-0.5
                      group-hover:translate-x-0.5
                      group-hover:text-indigo-500
                      sm:block
                      dark:text-slate-600
                      dark:group-hover:text-indigo-300
                    "
                    aria-hidden="true"
                  />
                )}
              </div>

              {/* =================================================
                  DESCRIPTION
              ================================================= */}

              {description && (
                <p
                  className="
                    mt-2.5
                    max-w-2xl
                    text-sm
                    leading-6
                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  {description}
                </p>
              )}

              {/* =================================================
                  META
              ================================================= */}

              {meta && (
                <div
                  className="
                    mt-3
                    flex
                    flex-wrap
                    items-center
                    gap-x-4
                    gap-y-2
                    text-[11px]
                    font-medium
                    text-slate-400
                    dark:text-slate-500
                  "
                >
                  {meta}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* =================================================
            ACTION
        ================================================= */}

        {action && (
          <div
            className="
              relative
              shrink-0
              self-stretch
              lg:self-end
            "
          >
            <div
              className="
                flex
                w-full
                items-center
                lg:w-auto
                transition-transform
                duration-300
                group-hover:-translate-y-0.5
              "
            >
              {action}
            </div>
          </div>
        )}
      </div>

      {/* ===================================================
          BOTTOM DECORATION
      =================================================== */}

      {variant !== "minimal" && (
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            bottom-0
            left-8
            h-px
            w-20
            bg-gradient-to-r
            from-indigo-500/30
            to-transparent
          "
        />
      )}
    </header>
  );
}