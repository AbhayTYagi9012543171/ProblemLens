import {
  ArrowRight,
  Check,
  Loader2,
  Sparkles,
} from "lucide-react";

const VARIANTS = {
  primary: {
    base: `
      bg-slate-950 text-white
      border border-slate-950
      shadow-[0_8px_24px_rgba(15,23,42,0.12)]
      hover:bg-slate-800
      hover:border-slate-800
      hover:shadow-[0_14px_34px_rgba(15,23,42,0.18)]
      dark:bg-white dark:text-slate-950
      dark:border-white
      dark:hover:bg-slate-100
    `,
    glow: "bg-white/20",
    ring: "focus-visible:ring-slate-500/40",
  },

  secondary: {
    base: `
      bg-white text-slate-700
      border border-slate-200
      shadow-[0_4px_14px_rgba(15,23,42,0.05)]
      hover:bg-slate-50
      hover:border-slate-300
      hover:text-slate-950
      hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)]
      dark:bg-white/[0.06]
      dark:text-slate-200
      dark:border-white/10
      dark:hover:bg-white/[0.1]
      dark:hover:border-white/15
    `,
    glow: "bg-slate-900/5 dark:bg-white/10",
    ring: "focus-visible:ring-slate-400/40",
  },

  ghost: {
    base: `
      bg-transparent text-slate-600
      border border-transparent
      hover:bg-slate-100
      hover:text-slate-950
      dark:text-slate-300
      dark:hover:bg-white/[0.07]
      dark:hover:text-white
    `,
    glow: "bg-slate-900/5 dark:bg-white/10",
    ring: "focus-visible:ring-slate-400/30",
  },

  outline: {
    base: `
      bg-transparent text-indigo-700
      border border-indigo-200
      hover:bg-indigo-50
      hover:border-indigo-300
      dark:text-indigo-300
      dark:border-indigo-400/25
      dark:hover:bg-indigo-400/10
    `,
    glow: "bg-indigo-500/10",
    ring: "focus-visible:ring-indigo-500/40",
  },

  danger: {
    base: `
      bg-rose-600 text-white
      border border-rose-600
      shadow-[0_8px_24px_rgba(225,29,72,0.16)]
      hover:bg-rose-700
      hover:border-rose-700
      hover:shadow-[0_14px_34px_rgba(225,29,72,0.24)]
      dark:bg-rose-500
      dark:border-rose-500
      dark:hover:bg-rose-600
    `,
    glow: "bg-white/20",
    ring: "focus-visible:ring-rose-500/40",
  },

  success: {
    base: `
      bg-emerald-600 text-white
      border border-emerald-600
      shadow-[0_8px_24px_rgba(5,150,105,0.15)]
      hover:bg-emerald-700
      hover:border-emerald-700
      hover:shadow-[0_14px_34px_rgba(5,150,105,0.23)]
      dark:bg-emerald-500
      dark:border-emerald-500
      dark:hover:bg-emerald-600
    `,
    glow: "bg-white/20",
    ring: "focus-visible:ring-emerald-500/40",
  },

  premium: {
    base: `
      bg-gradient-to-r
      from-indigo-600
      via-violet-600
      to-fuchsia-600
      text-white
      border border-white/10
      shadow-[0_10px_32px_rgba(99,102,241,0.25)]
      hover:shadow-[0_16px_44px_rgba(99,102,241,0.34)]
    `,
    glow: "bg-white/25",
    ring: "focus-visible:ring-indigo-500/50",
  },

  ai: {
    base: `
      bg-gradient-to-r
      from-violet-600
      via-indigo-600
      to-sky-600
      text-white
      border border-white/10
      shadow-[0_10px_34px_rgba(79,70,229,0.25)]
      hover:shadow-[0_18px_48px_rgba(79,70,229,0.36)]
    `,
    glow: "bg-white/25",
    ring: "focus-visible:ring-violet-500/50",
  },

  subtle: {
    base: `
      bg-slate-50 text-slate-700
      border border-slate-100
      hover:bg-slate-100
      hover:text-slate-950
      dark:bg-white/[0.04]
      dark:text-slate-300
      dark:border-white/[0.06]
      dark:hover:bg-white/[0.08]
      dark:hover:text-white
    `,
    glow: "bg-white/10",
    ring: "focus-visible:ring-slate-400/30",
  },
};

const SIZES = {
  xs: {
    root: "h-8 rounded-lg px-3 text-[11px]",
    icon: "h-3.5 w-3.5",
    gap: "gap-1.5",
  },

  sm: {
    root: "h-9 rounded-lg px-3.5 text-xs",
    icon: "h-4 w-4",
    gap: "gap-1.5",
  },

  md: {
    root: "h-11 rounded-xl px-5 text-sm",
    icon: "h-4 w-4",
    gap: "gap-2",
  },

  lg: {
    root: "h-12 rounded-xl px-6 text-sm",
    icon: "h-[18px] w-[18px]",
    gap: "gap-2",
  },

  xl: {
    root: "h-14 rounded-2xl px-7 text-base",
    icon: "h-5 w-5",
    gap: "gap-2.5",
  },
};

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Button({
  children,

  variant = "primary",
  size = "md",

  loading = false,
  success = false,

  disabled = false,

  fullWidth = false,
  iconOnly = false,

  leftIcon = null,
  rightIcon = null,

  loadingText = "Processing...",
  successText = "Completed",

  shimmer = true,
  glow = true,
  lift = true,

  className = "",

  type = "button",

  ...props
}) {
  const selectedVariant =
    VARIANTS[variant] || VARIANTS.primary;

  const selectedSize =
    SIZES[size] || SIZES.md;

  const isDisabled = disabled || loading;

  const displayIcon = success
    ? <Check className={selectedSize.icon} />
    : loading
      ? <Loader2 className={cn(selectedSize.icon, "animate-spin")} />
      : leftIcon;

  const displayContent = success
    ? successText
    : loading
      ? loadingText
      : children;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      aria-disabled={isDisabled || undefined}
      className={cn(
        "group relative isolate inline-flex shrink-0",
        "items-center justify-center",
        "overflow-hidden",
        "font-semibold tracking-[-0.012em]",
        "select-none whitespace-nowrap",
        "outline-none",
        "border",
        "transition-all duration-200 ease-out",

        "focus-visible:ring-2",
        "focus-visible:ring-offset-2",
        "dark:focus-visible:ring-offset-slate-950",

        "active:scale-[0.97]",

        "disabled:pointer-events-none",
        "disabled:cursor-not-allowed",
        "disabled:opacity-55",

        selectedSize.root,
        selectedSize.gap,

        selectedVariant.base,
        selectedVariant.ring,

        fullWidth && "w-full",
        iconOnly && "!aspect-square !px-0",

        lift &&
          !isDisabled &&
          "hover:-translate-y-[1px]",

        className
      )}
      {...props}
    >
      {/* ------------------------------------------------ */}
      {/* TOP GLASS HIGHLIGHT */}
      {/* ------------------------------------------------ */}

      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-3
          top-0
          z-20
          h-px
          rounded-full
          bg-white/70
          opacity-50
          transition-opacity
          duration-300
          group-hover:opacity-100
        "
      />

      {/* ------------------------------------------------ */}
      {/* INNER LIGHT */}
      {/* ------------------------------------------------ */}

      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          -z-10
          bg-gradient-to-b
          from-white/[0.10]
          to-transparent
          opacity-0
          transition-opacity
          duration-300
          group-hover:opacity-100
        "
      />

      {/* ------------------------------------------------ */}
      {/* HOVER GLOW */}
      {/* ------------------------------------------------ */}

      {glow && (
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute",
            "-inset-1 -z-20",
            "rounded-[inherit]",
            "blur-xl",
            "opacity-0",
            "transition-opacity duration-500",
            "group-hover:opacity-100",
            selectedVariant.glow
          )}
        />
      )}

      {/* ------------------------------------------------ */}
      {/* SHIMMER */}
      {/* ------------------------------------------------ */}

      {shimmer && !isDisabled && (
        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-y-0
            -left-[120%]
            z-10
            w-1/2
            skew-x-[-20deg]
            bg-gradient-to-r
            from-transparent
            via-white/20
            to-transparent
            opacity-0
            transition-all
            duration-700
            group-hover:left-[140%]
            group-hover:opacity-100
          "
        />
      )}

      {/* ------------------------------------------------ */}
      {/* CONTENT */}
      {/* ------------------------------------------------ */}

      <span
        className={cn(
          "relative z-20 inline-flex items-center justify-center",
          selectedSize.gap,
          "transition-all duration-200"
        )}
      >
        {/* LEFT / LOADING / SUCCESS ICON */}
        {displayIcon && (
          <span
            aria-hidden="true"
            className={cn(
              "relative inline-flex shrink-0 items-center justify-center",
              "transition-all duration-200",

              !loading &&
                !success &&
                "group-hover:scale-110",

              !loading &&
                !success &&
                leftIcon &&
                "group-hover:-translate-x-0.5"
            )}
          >
            {displayIcon}
          </span>
        )}

        {/* LABEL */}
        {!iconOnly && (
          <span
            className="
              relative
              truncate
              transition-transform
              duration-200
            "
          >
            {displayContent}
          </span>
        )}

        {/* RIGHT ICON */}
        {!loading &&
          !success &&
          !iconOnly &&
          rightIcon && (
            <span
              aria-hidden="true"
              className="
                relative
                inline-flex
                shrink-0
                items-center
                justify-center
                transition-transform
                duration-200
                group-hover:translate-x-1
              "
            >
              {rightIcon}
            </span>
          )}
      </span>

      {/* ------------------------------------------------ */}
      {/* SUCCESS CHECK ANIMATION */}
      {/* ------------------------------------------------ */}

      {success && (
        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            rounded-[inherit]
            ring-2
            ring-emerald-300/40
            animate-pulse
          "
        />
      )}
    </button>
  );
}