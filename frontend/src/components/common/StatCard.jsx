import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  Sparkles,
} from "lucide-react";
import Card from "./Card";

/* =========================================================
   PROBLEMLENS — PREMIUM STAT CARD
   ========================================================= */

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,

  color = "indigo",

  trend,
  trendDirection = "up",
  trendLabel = null,

  subtitle = null,
  footer = null,

  loading = false,
  highlighted = false,
  premium = false,

  onClick = null,

  className = "",
}) {
  const themes = {
    indigo: {
      icon: `
        border-indigo-100
        bg-indigo-50
        text-indigo-600
        shadow-indigo-500/10
        dark:border-indigo-400/15
        dark:bg-indigo-400/10
        dark:text-indigo-300
      `,
      glow: "bg-indigo-500/[0.08]",
      accent: "bg-indigo-500",
      ring: "ring-indigo-500/10",
      text: "text-indigo-600 dark:text-indigo-300",
    },

    emerald: {
      icon: `
        border-emerald-100
        bg-emerald-50
        text-emerald-600
        shadow-emerald-500/10
        dark:border-emerald-400/15
        dark:bg-emerald-400/10
        dark:text-emerald-300
      `,
      glow: "bg-emerald-500/[0.08]",
      accent: "bg-emerald-500",
      ring: "ring-emerald-500/10",
      text: "text-emerald-600 dark:text-emerald-300",
    },

    amber: {
      icon: `
        border-amber-100
        bg-amber-50
        text-amber-600
        shadow-amber-500/10
        dark:border-amber-400/15
        dark:bg-amber-400/10
        dark:text-amber-300
      `,
      glow: "bg-amber-500/[0.08]",
      accent: "bg-amber-500",
      ring: "ring-amber-500/10",
      text: "text-amber-600 dark:text-amber-300",
    },

    sky: {
      icon: `
        border-sky-100
        bg-sky-50
        text-sky-600
        shadow-sky-500/10
        dark:border-sky-400/15
        dark:bg-sky-400/10
        dark:text-sky-300
      `,
      glow: "bg-sky-500/[0.08]",
      accent: "bg-sky-500",
      ring: "ring-sky-500/10",
      text: "text-sky-600 dark:text-sky-300",
    },

    rose: {
      icon: `
        border-rose-100
        bg-rose-50
        text-rose-600
        shadow-rose-500/10
        dark:border-rose-400/15
        dark:bg-rose-400/10
        dark:text-rose-300
      `,
      glow: "bg-rose-500/[0.08]",
      accent: "bg-rose-500",
      ring: "ring-rose-500/10",
      text: "text-rose-600 dark:text-rose-300",
    },

    violet: {
      icon: `
        border-violet-100
        bg-violet-50
        text-violet-600
        shadow-violet-500/10
        dark:border-violet-400/15
        dark:bg-violet-400/10
        dark:text-violet-300
      `,
      glow: "bg-violet-500/[0.08]",
      accent: "bg-violet-500",
      ring: "ring-violet-500/10",
      text: "text-violet-600 dark:text-violet-300",
    },
  };

  const theme = themes[color] || themes.indigo;

  const isDown =
    trendDirection === "down" ||
    trendDirection === "negative";

  const isNeutral =
    trendDirection === "neutral" ||
    trendDirection === "flat";

  const TrendIcon = isNeutral
    ? Minus
    : isDown
      ? ArrowDownRight
      : ArrowUpRight;

  const trendColor = isNeutral
    ? "text-slate-400 dark:text-slate-500"
    : isDown
      ? "text-rose-600 dark:text-rose-300"
      : "text-emerald-600 dark:text-emerald-300";

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <Card
        className={`
          relative
          overflow-hidden
          ${className}
        `}
      >
        <div className="animate-pulse">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="h-3 w-24 rounded-full bg-slate-200 dark:bg-white/[0.08]" />

              <div className="mt-4 h-9 w-28 rounded-xl bg-slate-200 dark:bg-white/[0.08]" />

              <div className="mt-3 h-3 w-36 rounded-full bg-slate-100 dark:bg-white/[0.05]" />
            </div>

            <div className="h-12 w-12 rounded-2xl bg-slate-200 dark:bg-white/[0.08]" />
          </div>

          <div className="mt-6 h-3 w-20 rounded-full bg-slate-100 dark:bg-white/[0.05]" />
        </div>
      </Card>
    );
  }

  /* =======================================================
     MAIN CARD
  ======================================================= */

  return (
    <Card
      variant={premium ? "premium" : "default"}
      clickable={Boolean(onClick)}
      onClick={onClick}
      spotlight
      className={`
        group
        relative
        overflow-hidden
        ${highlighted ? "ring-1 ring-indigo-500/20" : ""}
        ${className}
      `}
    >
      {/* =================================================
          AMBIENT COLOR GLOW
      ================================================= */}

      <span
        aria-hidden="true"
        className={`
          pointer-events-none
          absolute
          -right-16
          -top-16
          h-36
          w-36
          rounded-full
          ${theme.glow}
          blur-3xl
          opacity-70
          transition-all
          duration-700
          group-hover:scale-150
          group-hover:opacity-100
        `}
      />

      {/* =================================================
          TOP ACCENT
      ================================================= */}

      {highlighted && (
        <span
          aria-hidden="true"
          className={`
            absolute
            inset-x-6
            top-0
            h-px
            ${theme.accent}
            opacity-70
          `}
        />
      )}

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          {/* LEFT */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p
                className="
                  truncate
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.12em]
                  text-slate-400
                  dark:text-slate-500
                "
              >
                {title}
              </p>

              {premium && (
                <Sparkles
                  className="
                    h-3
                    w-3
                    shrink-0
                    text-indigo-500
                    opacity-70
                    transition-transform
                    duration-500
                    group-hover:rotate-12
                    group-hover:scale-110
                    dark:text-indigo-300
                  "
                  aria-hidden="true"
                />
              )}
            </div>

            {/* VALUE */}

            <div className="mt-3 flex items-baseline gap-2">
              <p
                className="
                  font-['Manrope']
                  text-3xl
                  font-extrabold
                  leading-none
                  tracking-[-0.045em]
                  text-slate-950
                  transition-transform
                  duration-300
                  group-hover:-translate-y-0.5
                  sm:text-[2rem]
                  dark:text-white
                "
              >
                {value}
              </p>

              {subtitle && (
                <span
                  className="
                    text-xs
                    font-semibold
                    text-slate-400
                    dark:text-slate-500
                  "
                >
                  {subtitle}
                </span>
              )}
            </div>

            {/* DESCRIPTION */}

            {description && (
              <p
                className="
                  mt-2
                  max-w-[230px]
                  text-xs
                  leading-5
                  text-slate-400
                  dark:text-slate-500
                "
              >
                {description}
              </p>
            )}
          </div>

          {/* =================================================
              ICON
          ================================================= */}

          {Icon && (
            <div
              className={`
                relative
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                overflow-hidden
                rounded-2xl
                border
                shadow-sm
                transition-all
                duration-500
                group-hover:-translate-y-1
                group-hover:scale-105
                group-hover:shadow-lg
                ${theme.icon}
              `}
            >
              {/* Inner highlight */}
              <span
                aria-hidden="true"
                className="
                  absolute
                  inset-0
                  bg-gradient-to-br
                  from-white/80
                  via-transparent
                  to-transparent
                  dark:from-white/[0.08]
                "
              />

              {/* Icon glow */}
              <span
                aria-hidden="true"
                className={`
                  absolute
                  inset-2
                  rounded-xl
                  ${theme.glow}
                  opacity-0
                  blur-md
                  transition-opacity
                  duration-500
                  group-hover:opacity-100
                `}
              />

              <Icon
                size={20}
                strokeWidth={2}
                className="relative z-10"
              />
            </div>
          )}
        </div>

        {/* =================================================
            TREND
        ================================================= */}

        {trend && (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span
              className={`
                inline-flex
                items-center
                gap-1
                rounded-full
                border
                border-slate-200/70
                bg-slate-50/80
                px-2
                py-1
                text-[10px]
                font-bold
                backdrop-blur-sm
                dark:border-white/[0.06]
                dark:bg-white/[0.035]
                ${trendColor}
              `}
            >
              <TrendIcon
                size={12}
                strokeWidth={2.5}
                aria-hidden="true"
              />

              {trend}
            </span>

            {trendLabel && (
              <span
                className="
                  text-[10px]
                  font-medium
                  text-slate-400
                  dark:text-slate-500
                "
              >
                {trendLabel}
              </span>
            )}
          </div>
        )}

        {/* =================================================
            FOOTER
        ================================================= */}

        {footer && (
          <div
            className="
              mt-5
              border-t
              border-slate-100/80
              pt-4
              dark:border-white/[0.06]
            "
          >
            {footer}
          </div>
        )}
      </div>

      {/* =================================================
          BOTTOM ACCENT
      ================================================= */}

      <span
        aria-hidden="true"
        className={`
          pointer-events-none
          absolute
          bottom-0
          left-6
          h-px
          w-12
          ${theme.accent}
          opacity-0
          transition-all
          duration-500
          group-hover:w-24
          group-hover:opacity-50
        `}
      />
    </Card>
  );
}