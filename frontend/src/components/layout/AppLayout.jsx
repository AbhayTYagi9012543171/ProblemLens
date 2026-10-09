
import {
  Activity,
  ArrowUp,
  CheckCircle2,
  Command,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Outlet,
  useLocation,
} from "react-router-dom";

import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";

/* =========================================================
   APP LAYOUT
   Premium application shell for ProblemLens
========================================================= */

export default function AppLayout() {
  const location = useLocation();

  /* -------------------------------------------------------
     STATE
  ------------------------------------------------------- */

  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [showTopButton, setShowTopButton] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  /* -------------------------------------------------------
     ROUTE KEY
  ------------------------------------------------------- */

  const routeKey = useMemo(
    () => location.pathname,
    [location.pathname]
  );

  /* -------------------------------------------------------
     CURRENT YEAR
  ------------------------------------------------------- */

  const currentYear = new Date().getFullYear();

  /* =======================================================
     MOBILE NAVIGATION
  ======================================================= */

  const handleMenuClick = useCallback(() => {
    setMobileOpen(true);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setMobileOpen(false);
  }, []);

  /* =======================================================
     ROUTE CHANGE EFFECT
  ======================================================= */

  useEffect(() => {
    setMobileOpen(false);
    setIsNavigating(true);

    const timer = window.setTimeout(() => {
      setIsNavigating(false);
    }, 560);

    return () => {
      window.clearTimeout(timer);
    };
  }, [routeKey]);

  /* =======================================================
     MOBILE BODY LOCK
  ======================================================= */

  useEffect(() => {
    if (!mobileOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight =
      document.body.style.paddingRight;

    const scrollbarWidth =
      window.innerWidth -
      document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight =
        `${scrollbarWidth}px`;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      document.body.style.paddingRight =
        previousPaddingRight;

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [mobileOpen]);

  /* =======================================================
     SCROLL RESTORATION
  ======================================================= */

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [routeKey]);

  /* =======================================================
     SCROLL ENGINE
  ======================================================= */

  useEffect(() => {
    let ticking = false;

    const calculateScrollState = () => {
      const scrollTop = window.scrollY;

      const scrollableHeight =
        document.documentElement.scrollHeight -
        window.innerHeight;

      const progress =
        scrollableHeight <= 0
          ? 0
          : (scrollTop / scrollableHeight) * 100;

      setScrollProgress(
        Math.min(
          100,
          Math.max(0, progress)
        )
      );

      setShowTopButton(
        scrollTop > 520
      );

      setIsScrolled(
        scrollTop > 18
      );

      ticking = false;
    };

    const handleScroll = () => {
      if (ticking) return;

      ticking = true;

      window.requestAnimationFrame(
        calculateScrollState
      );
    };

    calculateScrollState();

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );

    window.addEventListener(
      "resize",
      calculateScrollState
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );

      window.removeEventListener(
        "resize",
        calculateScrollState
      );
    };
  }, [routeKey]);

  /* =======================================================
     BACK TO TOP
  ======================================================= */

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className={[
        "relative min-h-screen overflow-x-hidden",
        "bg-[#f5f7fb]",
        "font-sans text-slate-900",
        "antialiased",
        "selection:bg-indigo-500/20",
        "selection:text-indigo-900",
        "dark:bg-[#050914]",
        "dark:text-slate-100",
        "dark:selection:text-indigo-100",
      ].join(" ")}
    >
      {/* ===================================================
          SKIP NAVIGATION
      =================================================== */}

      <a
        href="#main-content"
        className="
          sr-only
          focus:not-sr-only
          focus:fixed
          focus:left-4
          focus:top-4
          focus:z-[10000]
          focus:rounded-xl
          focus:bg-indigo-600
          focus:px-4
          focus:py-2.5
          focus:text-sm
          focus:font-semibold
          focus:text-white
          focus:shadow-2xl
          focus:outline-none
          focus:ring-2
          focus:ring-indigo-300
        "
      >
        Skip to main content
      </a>

      {/* ===================================================
          GLOBAL PROGRESS BAR
      =================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          fixed
          inset-x-0
          top-0
          z-[10000]
          h-[3px]
          bg-transparent
        "
      >
        <div
          className="
            h-full
            origin-left
            bg-gradient-to-r
            from-indigo-500
            via-violet-500
            to-cyan-400
            shadow-[0_0_18px_rgba(99,102,241,0.65)]
            transition-[width]
            duration-100
            ease-out
          "
          style={{
            width: `${scrollProgress}%`,
          }}
        />
      </div>

      {/* ===================================================
          PREMIUM AMBIENT BACKGROUND
      =================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          fixed
          inset-0
          -z-10
          overflow-hidden
        "
      >
        {/* Indigo glow */}
        <div
          className="
            absolute
            -left-48
            -top-48
            h-[620px]
            w-[620px]
            animate-[appGlow_10s_ease-in-out_infinite]
            rounded-full
            bg-indigo-500/[0.07]
            blur-[125px]
            dark:bg-indigo-500/[0.11]
          "
        />

        {/* Violet glow */}
        <div
          className="
            absolute
            -bottom-56
            -right-48
            h-[720px]
            w-[720px]
            animate-[appGlow_13s_ease-in-out_infinite_reverse]
            rounded-full
            bg-violet-500/[0.06]
            blur-[140px]
            dark:bg-violet-500/[0.085]
          "
        />

        {/* Cyan glow */}
        <div
          className="
            absolute
            left-[45%]
            top-[20%]
            h-[360px]
            w-[360px]
            animate-[appGlow_16s_ease-in-out_infinite]
            rounded-full
            bg-cyan-400/[0.025]
            blur-[120px]
            dark:bg-cyan-400/[0.035]
          "
        />

        {/* Fine grid */}
        <div
          className="
            absolute
            inset-0
            opacity-[0.018]
            dark:opacity-[0.012]
          "
          style={{
            backgroundImage:
              "linear-gradient(rgba(99,102,241,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)",
            backgroundSize:
              "52px 52px",
          }}
        />

        {/* Top light */}
        <div
          className="
            absolute
            inset-x-0
            top-0
            h-72
            bg-gradient-to-b
            from-white/70
            via-white/10
            to-transparent
            dark:from-slate-950/35
            dark:via-slate-950/10
            dark:to-transparent
          "
        />
      </div>

      {/* ===================================================
          MOBILE BACKDROP
      =================================================== */}

      <div
        className={[
          "fixed inset-0 z-40 lg:hidden",
          "transition-all duration-300",
          mobileOpen
            ? "pointer-events-auto bg-slate-950/60 opacity-100 backdrop-blur-sm"
            : "pointer-events-none opacity-0",
        ].join(" ")}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          tabIndex={mobileOpen ? 0 : -1}
          aria-label="Close navigation menu"
          onClick={handleCloseSidebar}
          className="
            h-full
            w-full
            cursor-default
            outline-none
          "
        />
      </div>

      {/* ===================================================
          APPLICATION SHELL
      =================================================== */}

      <div className="relative flex min-h-screen">
        {/* Sidebar */}
        <Sidebar
          mobileOpen={mobileOpen}
          onClose={handleCloseSidebar}
        />

        {/* =================================================
            MAIN APPLICATION AREA
        ================================================= */}

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Topbar */}
          <div
            className={[
              "sticky top-0 z-30",
              "transition-all duration-300",
              isScrolled
                ? "shadow-[0_10px_35px_rgba(15,23,42,0.05)]"
                : "",
            ].join(" ")}
          >
            <Topbar
              onMenuClick={handleMenuClick}
            />
          </div>

          {/* Route transition indicator */}
          <div
            aria-hidden="true"
            className={[
              "pointer-events-none fixed left-0 right-0 top-0 z-[9998] h-px",
              "bg-gradient-to-r from-transparent via-indigo-500 to-transparent",
              "transition-opacity duration-300",
              isNavigating
                ? "opacity-100"
                : "opacity-0",
            ].join(" ")}
          />

          {/* =================================================
              MAIN CONTENT
          ================================================= */}

          <main
            id="main-content"
            className="
              relative
              min-w-0
              flex-1
            "
          >
            {/* Content ambient glow */}
            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                left-1/2
                top-0
                h-44
                w-[70%]
                -translate-x-1/2
                rounded-full
                bg-indigo-500/[0.018]
                blur-3xl
                dark:bg-indigo-500/[0.03]
              "
            />

            {/* Main content container */}
            <div
              className="
                relative
                mx-auto
                w-full
                max-w-[1680px]
                px-3
                py-4
                sm:px-6
                sm:py-6
                lg:px-8
                lg:py-8
                xl:px-10
                2xl:px-12
              "
            >
              {/* Route page animation */}
              <div
                key={routeKey}
                className={[
                  "min-w-0",
                  "text-[15px]",
                  "leading-6",
                  "text-slate-700",
                  "dark:text-slate-200",
                  isNavigating
                    ? "animate-[appPageIn_0.56s_cubic-bezier(0.22,1,0.36,1)]"
                    : "",
                ].join(" ")}
              >
                <Outlet />
              </div>
            </div>
          </main>

          {/* =================================================
              PREMIUM FOOTER
          ================================================= */}

          <footer
            className="
              relative
              overflow-hidden
              border-t
              border-slate-200/70
              bg-white/55
              backdrop-blur-xl
              dark:border-white/[0.055]
              dark:bg-slate-950/35
            "
          >
            {/* Top gradient line */}
            <div
              aria-hidden="true"
              className="
                absolute
                inset-x-0
                top-0
                h-px
                bg-gradient-to-r
                from-transparent
                via-indigo-500/30
                to-transparent
              "
            />

            {/* Footer ambient glow */}
            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                -right-20
                -top-24
                h-40
                w-40
                rounded-full
                bg-indigo-500/[0.035]
                blur-3xl
              "
            />

            <div
              className="
                relative
                mx-auto
                flex
                w-full
                max-w-[1680px]
                flex-col
                gap-3
                px-4
                py-4
                sm:flex-row
                sm:items-center
                sm:justify-between
                sm:px-6
                lg:px-8
                xl:px-10
              "
            >
              {/* Brand */}
              <div className="flex items-center gap-2.5">
                <div
                  className="
                    relative
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-xl
                    border
                    border-indigo-100
                    bg-gradient-to-br
                    from-indigo-50
                    to-violet-50
                    text-indigo-600
                    shadow-sm
                    dark:border-indigo-400/10
                    dark:from-indigo-500/10
                    dark:to-violet-500/10
                    dark:text-indigo-300
                  "
                >
                  <span className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent dark:from-white/[0.06]" />

                  <Sparkles
                    size={13}
                    className="relative"
                  />
                </div>

                <div>
                  <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                    ProblemLens
                  </p>

                  <p className="text-[9px] text-slate-400 dark:text-slate-500">
                    © {currentYear} · Intelligence Workspace
                  </p>
                </div>
              </div>

              {/* Product status */}
              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-[10px]
                  font-medium
                  text-slate-400
                  dark:text-slate-500
                "
              >
                <span
                  className="
                    flex
                    h-6
                    w-6
                    items-center
                    justify-center
                    rounded-lg
                    bg-emerald-50
                    text-emerald-500
                    dark:bg-emerald-500/10
                    dark:text-emerald-400
                  "
                >
                  <Activity size={12} />
                </span>

                <span className="hidden sm:inline">
                  AI Problem Discovery &amp; Opportunity Intelligence
                </span>

                <span className="h-1 w-1 rounded-full bg-emerald-400" />

                <span className="flex items-center gap-1 text-emerald-500 dark:text-emerald-400">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </span>

                  <Zap
                    size={9}
                    fill="currentColor"
                  />

                  Live
                </span>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* ===================================================
          BACK TO TOP
      =================================================== */}

      <button
        type="button"
        aria-label="Back to top"
        onClick={scrollToTop}
        className={[
          "fixed bottom-5 right-5 z-30",
          "flex h-11 w-11 items-center justify-center",
          "rounded-2xl",
          "border border-white/70",
          "bg-white/80",
          "text-slate-500",
          "shadow-xl shadow-slate-300/20",
          "backdrop-blur-xl",
          "transition-all duration-300",
          "hover:-translate-y-1",
          "hover:border-indigo-200",
          "hover:bg-white",
          "hover:text-indigo-600",
          "focus:outline-none",
          "focus:ring-2",
          "focus:ring-indigo-400/30",
          "dark:border-white/[0.08]",
          "dark:bg-slate-900/80",
          "dark:text-slate-400",
          "dark:hover:border-indigo-500/30",
          "dark:hover:bg-slate-900",
          "dark:hover:text-indigo-300",
          showTopButton
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-3 scale-90 opacity-0",
        ].join(" ")}
      >
        <ArrowUp size={17} />
      </button>

      {/* ===================================================
          QUICK ACTION HINT
      =================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          fixed
          bottom-5
          left-1/2
          z-20
          hidden
          -translate-x-1/2
          items-center
          gap-2
          rounded-2xl
          border
          border-slate-200/70
          bg-white/75
          px-3
          py-2
          text-[9px]
          font-semibold
          text-slate-400
          shadow-lg
          backdrop-blur-xl
          lg:flex
          dark:border-white/[0.07]
          dark:bg-slate-900/65
          dark:text-slate-500
        "
      >
        <Command size={10} />

        <span>
          Quick actions
        </span>

        <span
          className="
            rounded-md
            border
            border-slate-200
            bg-slate-50
            px-1.5
            py-0.5
            text-[8px]
            dark:border-slate-700
            dark:bg-slate-800
          "
        >
          ⌘K
        </span>
      </div>

      {/* ===================================================
          GLOBAL ANIMATIONS
      =================================================== */}

      <style>{`
        @keyframes appPageIn {
          0% {
            opacity: 0;
            transform: translateY(10px) scale(0.995);
            filter: blur(2px);
          }

          55% {
            opacity: 0.92;
            filter: blur(0.4px);
          }

          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        @keyframes appGlow {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }

          50% {
            transform: translate3d(12px, -10px, 0) scale(1.06);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            scroll-behavior: auto !important;
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        @media (max-width: 640px) {
          #main-content {
            min-height: calc(100vh - 64px);
          }
        }
      `}</style>
    </div>
  );
}
