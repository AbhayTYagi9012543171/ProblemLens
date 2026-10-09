import {
  CheckCircle2,
  Command,
  Info,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useRef } from "react";

/* =========================================================
   PROBLEMLENS — PREMIUM MODAL SYSTEM
   ========================================================= */

const sizes = {
  xs: "max-w-sm",
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  "2xl": "max-w-6xl",
  full: "max-w-[calc(100vw-2rem)]",
};

const variants = {
  default: {
    panel: `
      border-slate-200/80
      bg-white
      shadow-[0_30px_100px_rgba(15,23,42,0.20)]
      dark:border-white/[0.08]
      dark:bg-slate-950
      dark:shadow-[0_35px_120px_rgba(0,0,0,0.55)]
    `,
    icon: `
      border-slate-200
      bg-slate-50
      text-slate-600
      dark:border-white/[0.08]
      dark:bg-white/[0.05]
      dark:text-slate-300
    `,
  },

  premium: {
    panel: `
      border-indigo-100/80
      bg-gradient-to-br
      from-white
      via-white
      to-indigo-50/50
      shadow-[0_30px_110px_rgba(79,70,229,0.16)]
      dark:border-indigo-400/10
      dark:from-slate-950
      dark:via-slate-950
      dark:to-indigo-950/25
      dark:shadow-[0_35px_120px_rgba(0,0,0,0.55)]
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
    panel: `
      border-violet-200/70
      bg-gradient-to-br
      from-violet-50/40
      via-white
      to-indigo-50/40
      shadow-[0_30px_110px_rgba(124,58,237,0.16)]
      dark:border-violet-400/15
      dark:from-violet-950/25
      dark:via-slate-950
      dark:to-indigo-950/25
      dark:shadow-[0_35px_120px_rgba(0,0,0,0.55)]
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

  danger: {
    panel: `
      border-rose-200/70
      bg-gradient-to-br
      from-white
      to-rose-50/40
      shadow-[0_30px_100px_rgba(225,29,72,0.12)]
      dark:border-rose-400/15
      dark:from-slate-950
      dark:to-rose-950/20
    `,
    icon: `
      border-rose-200
      bg-rose-50
      text-rose-600
      dark:border-rose-400/15
      dark:bg-rose-400/10
      dark:text-rose-300
    `,
  },

  success: {
    panel: `
      border-emerald-200/70
      bg-gradient-to-br
      from-white
      to-emerald-50/40
      shadow-[0_30px_100px_rgba(16,185,129,0.11)]
      dark:border-emerald-400/15
      dark:from-slate-950
      dark:to-emerald-950/20
    `,
    icon: `
      border-emerald-200
      bg-emerald-50
      text-emerald-600
      dark:border-emerald-400/15
      dark:bg-emerald-400/10
      dark:text-emerald-300
    `,
  },
};

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Modal({
  open,
  onClose,

  title,
  description,
  children,

  size = "md",
  variant = "default",

  icon = null,
  badge = null,

  footer = null,

  showClose = true,
  closeOnOverlay = true,
  closeOnEscape = true,

  preventScroll = true,

  loading = false,
  loadingText = "Please wait...",

  showCommandHint = false,

  className = "",
  contentClassName = "",

  ...props
}) {
  const dialogRef = useRef(null);
  const previousActiveElement = useRef(null);

  const selectedSize =
    sizes[size] || sizes.md;

  const selectedVariant =
    variants[variant] || variants.default;

  /* =======================================================
     BODY SCROLL LOCK
     ======================================================= */

  useEffect(() => {
    if (!open || !preventScroll) return;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [open, preventScroll]);

  /* =======================================================
     ESCAPE + FOCUS
     ======================================================= */

  useEffect(() => {
    if (!open) return;

    previousActiveElement.current =
      document.activeElement;

    const timer = window.setTimeout(() => {
      dialogRef.current?.focus();
    }, 50);

    const handleKeyDown = (event) => {
      if (
        closeOnEscape &&
        event.key === "Escape"
      ) {
        onClose?.();
      }

      /* Simple focus trap */

      if (event.key === "Tab") {
        const dialog =
          dialogRef.current;

        if (!dialog) return;

        const focusable = dialog.querySelectorAll(
          `
            button:not([disabled]),
            [href],
            input:not([disabled]),
            select:not([disabled]),
            textarea:not([disabled]),
            [tabindex]:not([tabindex="-1"])
          `
        );

        if (!focusable.length) return;

        const first =
          focusable[0];

        const last =
          focusable[focusable.length - 1];

        if (
          event.shiftKey &&
          document.activeElement === first
        ) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          document.activeElement === last
        ) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.clearTimeout(timer);

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      previousActiveElement.current?.focus?.();
    };
  }, [
    open,
    closeOnEscape,
    onClose,
  ]);

  if (!open) return null;

  const handleOverlayClick = (event) => {
    if (!closeOnOverlay) return;

    if (
      event.target === event.currentTarget
    ) {
      onClose?.();
    }
  };

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        p-3
        sm:p-4
      "
      onMouseDown={handleOverlayClick}
    >
      {/* ===================================================
          BACKDROP
      =================================================== */}

      <div
        aria-hidden="true"
        className="
          absolute
          inset-0
          bg-slate-950/55
          backdrop-blur-md
          animate-[modalBackdropIn_250ms_ease-out]
          dark:bg-black/70
        "
      />

      {/* ===================================================
          AMBIENT LIGHT
      =================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          h-[500px]
          w-[500px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-indigo-500/[0.07]
          blur-[100px]
          dark:bg-indigo-500/[0.06]
        "
      />

      {/* ===================================================
          DIALOG
      =================================================== */}

      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={
          title
            ? "problemlens-modal-title"
            : undefined
        }
        aria-describedby={
          description
            ? "problemlens-modal-description"
            : undefined
        }
        className={cn(
          "relative z-10 flex w-full flex-col",
          selectedSize,

          "max-h-[calc(100vh-1.5rem)]",
          "overflow-hidden",

          "rounded-[1.5rem] sm:rounded-[1.75rem]",

          "border",

          selectedVariant.panel,

          "outline-none",

          "animate-[modalPanelIn_320ms_cubic-bezier(.22,1,.36,1)]",

          className
        )}
        onMouseDown={(event) =>
          event.stopPropagation()
        }
        {...props}
      >
        {/* =================================================
            TOP HIGHLIGHT
        ================================================= */}

        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-x-8
            top-0
            z-30
            h-px
            bg-gradient-to-r
            from-transparent
            via-white
            to-transparent
            opacity-90
            dark:via-white/25
          "
        />

        {/* =================================================
            AMBIENT GLOW
        ================================================= */}

        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -right-24
            -top-24
            -z-10
            h-64
            w-64
            rounded-full
            bg-indigo-500/[0.08]
            blur-3xl
            dark:bg-indigo-400/[0.06]
          "
        />

        {/* =================================================
            GRID
        ================================================= */}

        {(variant === "premium" ||
          variant === "ai") && (
          <span
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              inset-0
              -z-10
              opacity-[0.025]
              [background-image:linear-gradient(rgba(99,102,241,1)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,1)_1px,transparent_1px)]
              [background-size:28px_28px]
              dark:opacity-[0.018]
            "
          />
        )}

        {/* =================================================
            HEADER
        ================================================= */}

        {(title ||
          description ||
          icon ||
          badge ||
          showClose) && (
          <div
            className="
              relative
              shrink-0
              border-b
              border-slate-100/80
              bg-white/55
              px-5
              py-4
              backdrop-blur-xl
              sm:px-6
              sm:py-5
              dark:border-white/[0.06]
              dark:bg-white/[0.025]
            "
          >
            <div className="flex items-start gap-3">
              {/* ICON */}

              {icon && (
                <div
                  className={cn(
                    `
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
                      shadow-sm
                    `,
                    selectedVariant.icon
                  )}
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

              {/* TEXT */}

              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  {title && (
                    <h2
                      id="problemlens-modal-title"
                      className="
                        text-base
                        font-bold
                        tracking-[-0.025em]
                        text-slate-950
                        sm:text-lg
                        dark:text-white
                      "
                    >
                      {title}
                    </h2>
                  )}

                  {badge && (
                    <div>
                      {badge}
                    </div>
                  )}
                </div>

                {description && (
                  <p
                    id="problemlens-modal-description"
                    className="
                      mt-1
                      max-w-2xl
                      text-xs
                      leading-5
                      text-slate-500
                      sm:text-sm
                      dark:text-slate-400
                    "
                  >
                    {description}
                  </p>
                )}
              </div>

              {/* CLOSE */}

              {showClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="
                    group/close
                    relative
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-transparent
                    text-slate-400
                    transition-all
                    duration-200
                    hover:border-slate-200
                    hover:bg-slate-100
                    hover:text-slate-700
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-indigo-500/50
                    dark:hover:border-white/[0.08]
                    dark:hover:bg-white/[0.06]
                    dark:hover:text-white
                  "
                  aria-label="Close modal"
                >
                  <X
                    className="
                      h-4
                      w-4
                      transition-transform
                      duration-200
                      group-hover/close:rotate-90
                    "
                  />
                </button>
              )}
            </div>

            {/* AI indicator */}

            {variant === "ai" && (
              <div
                className="
                  pointer-events-none
                  absolute
                  bottom-0
                  right-6
                  flex
                  translate-y-1/2
                  items-center
                  gap-1.5
                  rounded-full
                  border
                  border-violet-200/70
                  bg-white/90
                  px-2.5
                  py-1
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.13em]
                  text-violet-600
                  shadow-sm
                  backdrop-blur-xl
                  dark:border-violet-400/15
                  dark:bg-violet-950/80
                  dark:text-violet-300
                "
              >
                <Sparkles className="h-3 w-3" />
                AI
              </div>
            )}
          </div>
        )}

        {/* =================================================
            CONTENT
        ================================================= */}

        <div
          className={cn(
            `
              min-h-0
              flex-1
              overflow-y-auto
              overscroll-contain
              px-5
              py-5
              sm:px-6
              sm:py-6
            `,
            `
              [scrollbar-width:thin]
              [scrollbar-color:rgba(148,163,184,.35)_transparent]
            `,
            contentClassName
          )}
        >
          {loading ? (
            <ModalLoading
              text={loadingText}
              variant={variant}
            />
          ) : (
            children
          )}
        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        {footer && (
          <div
            className="
              relative
              shrink-0
              border-t
              border-slate-100/80
              bg-slate-50/45
              px-5
              py-4
              backdrop-blur-xl
              sm:px-6
              dark:border-white/[0.06]
              dark:bg-white/[0.025]
            "
          >
            {footer}
          </div>
        )}

        {/* =================================================
            COMMAND HINT
        ================================================= */}

        {showCommandHint && (
          <div
            className="
              pointer-events-none
              absolute
              bottom-3
              left-1/2
              hidden
              -translate-x-1/2
              items-center
              gap-1.5
              rounded-lg
              border
              border-slate-200/70
              bg-white/70
              px-2
              py-1
              text-[9px]
              font-medium
              text-slate-400
              backdrop-blur-md
              sm:flex
              dark:border-white/[0.06]
              dark:bg-white/[0.04]
              dark:text-slate-500
            "
          >
            <Command className="h-3 w-3" />
            ESC to close
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   MODAL LOADING
   ========================================================= */

function ModalLoading({
  text = "Please wait...",
  variant = "default",
}) {
  const isAI = variant === "ai";

  return (
    <div
      className="
        flex
        min-h-[180px]
        flex-col
        items-center
        justify-center
        text-center
      "
      role="status"
      aria-live="polite"
    >
      <div
        className={cn(
          `
            relative
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-2xl
            border
            shadow-sm
          `,
          isAI
            ? `
              border-violet-200
              bg-violet-50
              text-violet-600
              dark:border-violet-400/15
              dark:bg-violet-400/10
              dark:text-violet-300
            `
            : `
              border-indigo-100
              bg-indigo-50
              text-indigo-600
              dark:border-indigo-400/15
              dark:bg-indigo-400/10
              dark:text-indigo-300
            `
        )}
      >
        <span
          className="
            absolute
            inset-0
            animate-ping
            rounded-2xl
            border
            border-indigo-400/20
          "
        />

        {isAI ? (
          <Sparkles
            className="
              relative
              z-10
              h-5
              w-5
              animate-pulse
            "
          />
        ) : (
          <Loader2
            className="
              relative
              z-10
              h-5
              w-5
              animate-spin
            "
          />
        )}
      </div>

      <p
        className="
          mt-4
          text-sm
          font-semibold
          text-slate-800
          dark:text-slate-200
        "
      >
        {text}
      </p>

      <p
        className="
          mt-1
          text-xs
          text-slate-400
          dark:text-slate-500
        "
      >
        Processing securely...
      </p>

      <div
        className="
          mt-4
          h-1
          w-28
          overflow-hidden
          rounded-full
          bg-slate-100
          dark:bg-white/[0.06]
        "
      >
        <div
          className="
            h-full
            w-1/2
            rounded-full
            bg-gradient-to-r
            from-indigo-500
            via-violet-500
            to-indigo-500
            animate-[modalProgress_1.4s_ease-in-out_infinite]
          "
        />
      </div>
    </div>
  );
}