import {
  CheckCircle2,
  CircleAlert,
  Info,
  Sparkles,
  XCircle,
} from "lucide-react";

/**
 * ProblemLens Premium Badge
 *
 * Features:
 * - Multiple visual variants
 * - Size variants
 * - Optional icon
 * - Optional status dot
 * - Optional pulse animation
 * - Dark mode
 * - Hover interaction
 * - Custom className support
 * - Accessible defaults
 */

const variants = {
  success: {
    wrapper:
      "bg-emerald-50/90 text-emerald-700 ring-emerald-600/15 hover:bg-emerald-100/90 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20 dark:hover:bg-emerald-400/15",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
  },

  warning: {
    wrapper:
      "bg-amber-50/90 text-amber-700 ring-amber-600/15 hover:bg-amber-100/90 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20 dark:hover:bg-amber-400/15",
    dot: "bg-amber-500",
    icon: CircleAlert,
  },

  danger: {
    wrapper:
      "bg-rose-50/90 text-rose-700 ring-rose-600/15 hover:bg-rose-100/90 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/20 dark:hover:bg-rose-400/15",
    dot: "bg-rose-500",
    icon: XCircle,
  },

  info: {
    wrapper:
      "bg-sky-50/90 text-sky-700 ring-sky-600/15 hover:bg-sky-100/90 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-400/20 dark:hover:bg-sky-400/15",
    dot: "bg-sky-500",
    icon: Info,
  },

  neutral: {
    wrapper:
      "bg-slate-100/90 text-slate-600 ring-slate-500/15 hover:bg-slate-200/90 dark:bg-white/[0.06] dark:text-slate-300 dark:ring-white/10 dark:hover:bg-white/[0.09]",
    dot: "bg-slate-400",
    icon: null,
  },

  purple: {
    wrapper:
      "bg-indigo-50/90 text-indigo-700 ring-indigo-600/15 hover:bg-indigo-100/90 dark:bg-indigo-400/10 dark:text-indigo-300 dark:ring-indigo-400/20 dark:hover:bg-indigo-400/15",
    dot: "bg-indigo-500",
    icon: Sparkles,
  },

  premium: {
    wrapper:
      "bg-gradient-to-r from-indigo-50 via-violet-50 to-fuchsia-50 text-indigo-700 ring-indigo-500/15 hover:shadow-sm dark:from-indigo-400/10 dark:via-violet-400/10 dark:to-fuchsia-400/10 dark:text-indigo-300 dark:ring-indigo-400/20",
    dot: "bg-indigo-500",
    icon: Sparkles,
  },

  active: {
    wrapper:
      "bg-indigo-50/90 text-indigo-700 ring-indigo-600/15 hover:bg-indigo-100 dark:bg-indigo-400/10 dark:text-indigo-300 dark:ring-indigo-400/20",
    dot: "bg-indigo-500",
    icon: null,
  },

  processing: {
    wrapper:
      "bg-violet-50/90 text-violet-700 ring-violet-600/15 hover:bg-violet-100 dark:bg-violet-400/10 dark:text-violet-300 dark:ring-violet-400/20",
    dot: "bg-violet-500",
    icon: Sparkles,
  },
};

const sizes = {
  xs: {
    wrapper: "px-2 py-0.5 text-[10px]",
    icon: "h-3 w-3",
    dot: "h-1.5 w-1.5",
    gap: "gap-1",
  },

  sm: {
    wrapper: "px-2.5 py-1 text-[11px]",
    icon: "h-3 w-3",
    dot: "h-1.5 w-1.5",
    gap: "gap-1.5",
  },

  md: {
    wrapper: "px-3 py-1.5 text-xs",
    icon: "h-3.5 w-3.5",
    dot: "h-1.5 w-1.5",
    gap: "gap-1.5",
  },

  lg: {
    wrapper: "px-3.5 py-2 text-sm",
    icon: "h-4 w-4",
    dot: "h-2 w-2",
    gap: "gap-2",
  },
};

export default function Badge({
  children,
  variant = "neutral",
  size = "sm",
  icon: CustomIcon,
  showDot = false,
  pulse = false,
  interactive = true,
  className = "",
  title,
  ...props
}) {
  const selectedVariant = variants[variant] || variants.neutral;
  const selectedSize = sizes[size] || sizes.sm;

  const VariantIcon = CustomIcon || selectedVariant.icon;

  return (
    <span
      title={title}
      className={[
        "group relative inline-flex w-fit shrink-0 items-center",
        "rounded-full font-semibold tracking-[-0.01em]",
        "ring-1 ring-inset",
        "backdrop-blur-md",
        "transition-all duration-200 ease-out",
        selectedSize.gap,
        selectedSize.wrapper,
        selectedVariant.wrapper,

        interactive
          ? [
              "cursor-default",
              "hover:-translate-y-[1px]",
              "hover:shadow-[0_4px_14px_rgba(15,23,42,0.08)]",
              "active:translate-y-0",
            ].join(" ")
          : "",

        className,
      ].join(" ")}
      {...props}
    >
      {/* Premium highlight */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-2 top-0 h-px rounded-full bg-white/70 opacity-60 dark:bg-white/10"
      />

      {/* Status dot */}
      {showDot && (
        <span
          aria-hidden="true"
          className={[
            "relative shrink-0 rounded-full",
            selectedSize.dot,
            selectedVariant.dot,
            pulse ? "animate-pulse" : "",
          ].join(" ")}
        >
          {pulse && (
            <span
              className={[
                "absolute inset-0 rounded-full opacity-40",
                selectedVariant.dot,
                "animate-ping",
              ].join(" ")}
            />
          )}
        </span>
      )}

      {/* Icon */}
      {VariantIcon && (
        <VariantIcon
          aria-hidden="true"
          className={[
            "shrink-0 transition-transform duration-200",
            selectedSize.icon,
            interactive
              ? "group-hover:scale-110 group-hover:rotate-[-3deg]"
              : "",
          ].join(" ")}
        />
      )}

      {/* Label */}
      <span className="relative truncate">{children}</span>
    </span>
  );
}