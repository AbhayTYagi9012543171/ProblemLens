import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Activity,
  ArrowUp,
  Command,
  Cpu,
  Fingerprint,
  Gauge,
  Layers3,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  Outlet,
  useLocation,
} from "react-router-dom";

import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";

/* ==========================================================================
   PROBLEMLENS — PREMIUM INTELLIGENCE APPLICATION SHELL
   ========================================================================== */

const DESKTOP_BREAKPOINT = 1024;
const MAX_PARTICLES = 58;
const PARTICLE_DISTANCE = 125;

/* ==========================================================================
   LIVE CLOCK
   ========================================================================== */

function LiveClock() {
  const [time, setTime] = useState(
    () => new Date()
  );

  useEffect(() => {
    const interval = window.setInterval(
      () => {
        setTime(new Date());
      },
      1000
    );

    return () =>
      window.clearInterval(interval);
  }, []);

  return (
    <span>
      {time.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })}
    </span>
  );
}

/* ==========================================================================
   INTERACTIVE PARTICLE ENGINE
   ========================================================================== */

function InteractiveCanvasBackground() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const dimensionsRef = useRef({
    width: 0,
    height: 0,
    dpr: 1,
  });

  const [motionEnabled, setMotionEnabled] =
    useState(true);

  useEffect(() => {
    const mediaQuery =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      );

    const updateMotion = () => {
      setMotionEnabled(
        !mediaQuery.matches
      );
    };

    updateMotion();

    mediaQuery.addEventListener?.(
      "change",
      updateMotion
    );

    return () => {
      mediaQuery.removeEventListener?.(
        "change",
        updateMotion
      );
    };
  }, []);

  useEffect(() => {
    if (!motionEnabled) {
      return undefined;
    }

    const canvas = canvasRef.current;

    if (!canvas) {
      return undefined;
    }

    const ctx = canvas.getContext("2d", {
      alpha: true,
      desynchronized: true,
    });

    if (!ctx) {
      return undefined;
    }

    let destroyed = false;
    let lastFrame = 0;

    const createParticles = (
      width,
      height
    ) => {
      const area =
        width * height;

      const count = Math.min(
        MAX_PARTICLES,
        Math.max(
          18,
          Math.floor(
            area / 32000
          )
        )
      );

      particlesRef.current =
        Array.from(
          { length: count },
          () => ({
            x:
              Math.random() *
              width,

            y:
              Math.random() *
              height,

            radius:
              Math.random() *
                1.35 +
              0.35,

            vx:
              (Math.random() -
                0.5) *
              0.14,

            vy:
              (Math.random() -
                0.5) *
              0.14,

            alpha:
              Math.random() *
                0.24 +
              0.035,

            pulse:
              Math.random() *
              Math.PI *
              2,

            pulseSpeed:
              Math.random() *
                0.01 +
              0.003,
          })
        );
    };

    const resizeCanvas = () => {
      const width =
        window.innerWidth;

      const height =
        window.innerHeight;

      const dpr = Math.min(
        window.devicePixelRatio ||
          1,
        1.5
      );

      dimensionsRef.current = {
        width,
        height,
        dpr,
      };

      canvas.width =
        Math.floor(
          width * dpr
        );

      canvas.height =
        Math.floor(
          height * dpr
        );

      canvas.style.width =
        `${width}px`;

      canvas.style.height =
        `${height}px`;

      ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
      );

      createParticles(
        width,
        height
      );
    };

    resizeCanvas();

    const render = (timestamp) => {
      if (destroyed) {
        return;
      }

      /*
       * Keep the canvas around 30 FPS.
       * This prevents the visual engine from
       * consuming excessive CPU.
       */
      if (
        timestamp - lastFrame <
        32
      ) {
        animationRef.current =
          requestAnimationFrame(
            render
          );

        return;
      }

      lastFrame = timestamp;

      const {
        width,
        height,
      } = dimensionsRef.current;

      ctx.clearRect(
        0,
        0,
        width,
        height
      );

      const particles =
        particlesRef.current;

      for (
        let i = 0;
        i < particles.length;
        i += 1
      ) {
        const particle =
          particles[i];

        particle.x +=
          particle.vx;

        particle.y +=
          particle.vy;

        particle.pulse +=
          particle.pulseSpeed;

        if (
          particle.x < -20 ||
          particle.x >
            width + 20
        ) {
          particle.vx *= -1;
        }

        if (
          particle.y < -20 ||
          particle.y >
            height + 20
        ) {
          particle.vy *= -1;
        }

        const pulse =
          0.75 +
          Math.sin(
            particle.pulse
          ) *
            0.25;

        const alpha =
          particle.alpha *
          pulse;

        ctx.beginPath();

        ctx.arc(
          particle.x,
          particle.y,
          particle.radius,
          0,
          Math.PI * 2
        );

        ctx.fillStyle =
          `rgba(129,140,248,${alpha})`;

        ctx.fill();

        for (
          let j = i + 1;
          j < particles.length;
          j += 1
        ) {
          const other =
            particles[j];

          const dx =
            particle.x -
            other.x;

          const dy =
            particle.y -
            other.y;

          const distance =
            Math.sqrt(
              dx * dx +
                dy * dy
            );

          if (
            distance <
            PARTICLE_DISTANCE
          ) {
            const opacity =
              Math.max(
                0,
                0.06 -
                  distance /
                    2400
              );

            ctx.beginPath();

            ctx.moveTo(
              particle.x,
              particle.y
            );

            ctx.lineTo(
              other.x,
              other.y
            );

            ctx.strokeStyle =
              `rgba(99,102,241,${opacity})`;

            ctx.lineWidth = 0.4;

            ctx.stroke();
          }
        }
      }

      animationRef.current =
        requestAnimationFrame(
          render
        );
    };

    animationRef.current =
      requestAnimationFrame(
        render
      );

    window.addEventListener(
      "resize",
      resizeCanvas,
      { passive: true }
    );

    return () => {
      destroyed = true;

      if (
        animationRef.current
      ) {
        cancelAnimationFrame(
          animationRef.current
        );
      }

      window.removeEventListener(
        "resize",
        resizeCanvas
      );
    };
  }, [motionEnabled]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="
        pointer-events-none
        fixed
        inset-0
        -z-20
        h-full
        w-full
        select-none
        opacity-55
        dark:opacity-30
      "
    />
  );
}

/* ==========================================================================
   CURSOR AURA
   ========================================================================== */

function CursorAura({
  position,
}) {
  return (
    <>
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          fixed
          z-[-5]
          hidden
          h-72
          w-72
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-indigo-500/[0.035]
          blur-3xl
          transition-[left,top]
          duration-700
          ease-out
          lg:block
        "
        style={{
          left: position.x,
          top: position.y,
        }}
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          fixed
          z-[-5]
          hidden
          h-28
          w-28
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-cyan-400/[0.035]
          blur-2xl
          transition-[left,top]
          duration-300
          ease-out
          lg:block
        "
        style={{
          left: position.x,
          top: position.y,
        }}
      />
    </>
  );
}

/* ==========================================================================
   SCROLL PROGRESS
   ========================================================================== */

function ScrollProgress() {
  const [progress, setProgress] =
    useState(0);

  useEffect(() => {
    let frame = null;

    const calculateProgress =
      () => {
        const scrollHeight =
          document.documentElement
            .scrollHeight;

        const viewportHeight =
          window.innerHeight;

        const scrollableHeight =
          scrollHeight -
          viewportHeight;

        if (
          scrollableHeight <=
          0
        ) {
          setProgress(0);
          return;
        }

        const value =
          (window.scrollY /
            scrollableHeight) *
          100;

        setProgress(
          Math.max(
            0,
            Math.min(100, value)
          )
        );
      };

    const handleScroll = () => {
      if (frame) {
        return;
      }

      frame =
        requestAnimationFrame(
          () => {
            calculateProgress();
            frame = null;
          }
        );
    };

    calculateProgress();

    window.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );

    window.addEventListener(
      "resize",
      calculateProgress,
      { passive: true }
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );

      window.removeEventListener(
        "resize",
        calculateProgress
      );

      if (frame) {
        cancelAnimationFrame(
          frame
        );
      }
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="
        pointer-events-none
        fixed
        inset-x-0
        top-0
        z-[10000]
        h-[2px]
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
          shadow-[0_0_18px_rgba(99,102,241,0.85)]
          transition-[width]
          duration-100
        "
        style={{
          width: `${progress}%`,
        }}
      />
    </div>
  );
}

/* ==========================================================================
   SYSTEM TELEMETRY
   ========================================================================== */

function SystemTelemetry() {
  const [latency, setLatency] =
    useState(24);

  const [requests, setRequests] =
    useState(1248);

  useEffect(() => {
    const interval =
      window.setInterval(() => {
        setLatency(
          Math.floor(
            Math.random() * 12
          ) + 18
        );

        setRequests(
          (current) =>
            current +
            Math.floor(
              Math.random() * 3
            )
        );
      }, 3000);

    return () =>
      window.clearInterval(
        interval
      );
  }, []);

  return (
    <div
      className="
        hidden
        items-center
        gap-2
        rounded-full
        border
        border-slate-200/80
        bg-white/55
        px-3
        py-1.5
        text-[10px]
        font-bold
        text-slate-500
        shadow-sm
        backdrop-blur-xl
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:border-indigo-300/40
        hover:text-indigo-500
        dark:border-slate-800
        dark:bg-slate-900/40
        dark:text-slate-500
        dark:hover:border-indigo-700/40
        dark:hover:text-indigo-400
        md:flex
      "
    >
      <Gauge
        size={11}
        className="text-indigo-500"
      />

      <span>
        {latency}ms
      </span>

      <span
        className="
          h-3
          w-px
          bg-slate-200
          dark:bg-slate-700
        "
      />

      <span>
        {requests.toLocaleString()}
        {" "}
        ops
      </span>
    </div>
  );
}

/* ==========================================================================
   SYSTEM STATUS
   ========================================================================== */

function SystemStatus() {
  return (
    <div
      className="
        inline-flex
        items-center
        gap-2
        rounded-full
        border
        border-emerald-500/20
        bg-emerald-500/[0.055]
        px-3
        py-1.5
        text-[10px]
        font-bold
        text-emerald-600
        shadow-[0_8px_30px_rgba(16,185,129,0.06)]
        backdrop-blur-xl
        dark:border-emerald-500/15
        dark:bg-emerald-500/[0.045]
        dark:text-emerald-400
      "
    >
      <span className="relative flex h-2 w-2">
        <span
          className="
            absolute
            inset-0
            animate-ping
            rounded-full
            bg-emerald-400
            opacity-60
          "
        />

        <span
          className="
            relative
            h-2
            w-2
            rounded-full
            bg-emerald-500
            shadow-[0_0_10px_rgba(16,185,129,0.8)]
          "
        />
      </span>

      <span>
        All Systems Operational
      </span>
    </div>
  );
}

/* ==========================================================================
   BACK TO TOP
   ========================================================================== */

function BackToTop() {
  const [visible, setVisible] =
    useState(false);

  useEffect(() => {
    const handleScroll =
      () => {
        setVisible(
          window.scrollY > 500
        );
      };

    window.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );

    handleScroll();

    return () =>
      window.removeEventListener(
        "scroll",
        handleScroll
      );
  }, []);

  const handleClick = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={handleClick}
      className={`
        fixed
        bottom-6
        right-5
        z-[90]
        flex
        h-11
        w-11
        items-center
        justify-center
        rounded-2xl
        border
        border-slate-200/80
        bg-white/80
        text-slate-500
        shadow-[0_15px_45px_rgba(15,23,42,0.12)]
        backdrop-blur-xl
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-indigo-400/40
        hover:bg-indigo-50
        hover:text-indigo-600
        dark:border-slate-700/70
        dark:bg-slate-900/80
        dark:text-slate-400
        dark:hover:border-indigo-500/40
        dark:hover:bg-indigo-500/10
        dark:hover:text-indigo-400
        ${
          visible
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        }
      `}
    >
      <ArrowUp size={17} />
    </button>
  );
}

/* ==========================================================================
   MAIN APP LAYOUT
   ========================================================================== */

export default function AppLayout() {
  const location =
    useLocation();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [isNavigating, setIsNavigating] =
    useState(false);

  const [isScrolled, setIsScrolled] =
    useState(false);

  const [mousePosition, setMousePosition] =
    useState({
      x: 0,
      y: 0,
    });

  const mouseFrameRef =
    useRef(null);

  const targetMouseRef =
    useRef({
      x: 0,
      y: 0,
    });

  /* ------------------------------------------------------------------------
     ROUTE KEY
     ------------------------------------------------------------------------ */

  const routeKey = useMemo(
    () => location.pathname,
    [location.pathname]
  );

  /* ------------------------------------------------------------------------
     MOBILE MENU
     ------------------------------------------------------------------------ */

  const handleMenuClick =
    useCallback(() => {
      setMobileOpen(true);
    }, []);

  const handleCloseSidebar =
    useCallback(() => {
      setMobileOpen(false);
    }, []);

  /* ------------------------------------------------------------------------
     MOUSE PARALLAX
     ------------------------------------------------------------------------ */

  const handleMouseMove =
    useCallback((event) => {
      if (
        window.innerWidth <
        DESKTOP_BREAKPOINT
      ) {
        return;
      }

      targetMouseRef.current = {
        x: event.clientX,
        y: event.clientY,
      };

      if (mouseFrameRef.current) {
        return;
      }

      mouseFrameRef.current =
        requestAnimationFrame(
          () => {
            setMousePosition({
              ...targetMouseRef.current,
            });

            mouseFrameRef.current =
              null;
          }
        );
    }, []);

  /* ------------------------------------------------------------------------
     ROUTE CHANGE
     ------------------------------------------------------------------------ */

  useEffect(() => {
    setMobileOpen(false);
    setIsNavigating(true);

    const timer =
      window.setTimeout(() => {
        setIsNavigating(false);
      }, 600);

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });

    return () =>
      window.clearTimeout(
        timer
      );
  }, [routeKey]);

  /* ------------------------------------------------------------------------
     SCROLL STATE
     ------------------------------------------------------------------------ */

  useEffect(() => {
    let frame = null;

    const handleScroll = () => {
      if (frame) {
        return;
      }

      frame =
        requestAnimationFrame(
          () => {
            setIsScrolled(
              window.scrollY > 10
            );

            frame = null;
          }
        );
    };

    window.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );

    handleScroll();

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );

      if (frame) {
        cancelAnimationFrame(frame);
      }
    };
  }, []);

  /* ------------------------------------------------------------------------
     ESCAPE KEY
     ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!mobileOpen) {
      return undefined;
    }

    const handleKeyDown = (
      event
    ) => {
      if (
        event.key === "Escape"
      ) {
        setMobileOpen(false);
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [mobileOpen]);

  /* ------------------------------------------------------------------------
     MOBILE BODY LOCK
     ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!mobileOpen) {
      document.body.style.overflow =
        "";

      document.body.style.paddingRight =
        "";

      return undefined;
    }

    const previousOverflow =
      document.body.style.overflow;

    const previousPadding =
      document.body.style.paddingRight;

    const scrollbarWidth =
      window.innerWidth -
      document.documentElement
        .clientWidth;

    document.body.style.overflow =
      "hidden";

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight =
        `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow =
        previousOverflow;

      document.body.style.paddingRight =
        previousPadding;
    };
  }, [mobileOpen]);

  /* ------------------------------------------------------------------------
     MOUSE RAF CLEANUP
     ------------------------------------------------------------------------ */

  useEffect(() => {
    return () => {
      if (
        mouseFrameRef.current
      ) {
        cancelAnimationFrame(
          mouseFrameRef.current
        );
      }
    };
  }, []);

  /* ------------------------------------------------------------------------
     PARALLAX
     ------------------------------------------------------------------------ */

  const parallax = useMemo(() => {
    if (
      typeof window ===
      "undefined"
    ) {
      return {
        x: 0,
        y: 0,
      };
    }

    return {
      x:
        (
          mousePosition.x /
            window.innerWidth -
          0.5
        ) * 28,

      y:
        (
          mousePosition.y /
            window.innerHeight -
          0.5
        ) * 28,
    };
  }, [mousePosition]);

  return (
    <div
      onMouseMove={
        handleMouseMove
      }
      className="
        relative
        min-h-screen
        overflow-x-clip
        bg-[#f7f8fc]
        font-sans
        text-slate-900
        antialiased
        selection:bg-indigo-500
        selection:text-white
        dark:bg-[#050811]
        dark:text-slate-100
      "
    >
      {/* ====================================================================
          VISUAL ENGINE
      ==================================================================== */}

      <InteractiveCanvasBackground />

      <CursorAura
        position={mousePosition}
      />

      <ScrollProgress />

      {/* ====================================================================
          PREMIUM AURORA SYSTEM
      ==================================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          fixed
          inset-0
          -z-10
          overflow-hidden
          select-none
        "
      >
        {/* Primary Aurora */}

        <div
          className="
            absolute
            left-1/2
            top-[-360px]
            h-[760px]
            w-[1200px]
            -translate-x-1/2
            rounded-full
            bg-gradient-to-br
            from-indigo-500/[0.10]
            via-violet-500/[0.075]
            to-cyan-400/[0.055]
            blur-[160px]
            transition-transform
            duration-[1500ms]
            ease-out
            dark:from-indigo-600/[0.14]
            dark:via-violet-600/[0.09]
            dark:to-cyan-500/[0.06]
          "
          style={{
            transform: `
              translate3d(
                calc(-50% + ${parallax.x}px),
                ${parallax.y}px,
                0
              )
            `,
          }}
        />

        {/* Left Aurora */}

        <div
          className="
            absolute
            -left-[320px]
            top-[24%]
            h-[620px]
            w-[620px]
            rounded-full
            bg-gradient-to-br
            from-violet-400/[0.095]
            via-fuchsia-400/[0.05]
            to-transparent
            blur-[150px]
            transition-transform
            duration-[1800ms]
            ease-out
            dark:from-violet-800/[0.17]
            dark:via-fuchsia-800/[0.065]
          "
          style={{
            transform: `
              translate3d(
                ${-parallax.x * 0.65}px,
                ${-parallax.y * 0.65}px,
                0
              )
            `,
          }}
        />

        {/* Right Aurora */}

        <div
          className="
            absolute
            -bottom-[360px]
            -right-[300px]
            h-[740px]
            w-[740px]
            rounded-full
            bg-gradient-to-tr
            from-blue-500/[0.075]
            via-indigo-500/[0.05]
            to-emerald-400/[0.03]
            blur-[170px]
            dark:from-blue-900/[0.15]
            dark:via-indigo-900/[0.08]
          "
        />

        {/* Fine Grid */}

        <div
          className="
            absolute
            inset-0
            opacity-[0.018]
            dark:opacity-[0.028]
          "
          style={{
            backgroundImage: `
              linear-gradient(
                rgba(99,102,241,0.8) 1px,
                transparent 1px
              ),
              linear-gradient(
                90deg,
                rgba(99,102,241,0.8) 1px,
                transparent 1px
              )
            `,
            backgroundSize:
              "52px 52px",
          }}
        />

        {/* Vignette */}

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-b
            from-white/20
            via-transparent
            to-white/10
            dark:from-black/10
            dark:to-black/20
          "
        />
      </div>

      {/* ====================================================================
          ACCESSIBILITY
      ==================================================================== */}

      <a
        href="#main-content"
        className="
          sr-only
          focus:not-sr-only
          focus:fixed
          focus:left-5
          focus:top-5
          focus:z-[10001]
          focus:flex
          focus:items-center
          focus:gap-2
          focus:rounded-2xl
          focus:bg-indigo-600
          focus:px-5
          focus:py-3
          focus:text-xs
          focus:font-extrabold
          focus:text-white
          focus:shadow-2xl
          focus:shadow-indigo-500/30
          focus:outline-none
          focus:ring-4
          focus:ring-indigo-500/30
        "
      >
        <Layers3 size={14} />

        Skip to main workspace
      </a>

      {/* ====================================================================
          ROUTE TRANSITION
      ==================================================================== */}

      <div
        aria-hidden="true"
        className={`
          fixed
          left-0
          right-0
          top-[2px]
          z-[9999]
          h-[2px]
          origin-left
          bg-gradient-to-r
          from-transparent
          via-indigo-400
          to-transparent
          shadow-[0_0_20px_rgba(99,102,241,0.9)]
          transition-all
          duration-500
          ${
            isNavigating
              ? "scale-x-100 opacity-100"
              : "scale-x-0 opacity-0"
          }
        `}
      />

      {/* ====================================================================
          MOBILE OVERLAY
      ==================================================================== */}

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={
            handleCloseSidebar
          }
          className="
            fixed
            inset-0
            z-40
            cursor-default
            bg-slate-950/60
            backdrop-blur-md
            lg:hidden
          "
        />
      )}

      {/* ====================================================================
          APPLICATION SHELL
      ==================================================================== */}

      <div className="relative flex min-h-screen">
        {/* Sidebar */}

        <Sidebar
          mobileOpen={mobileOpen}
          onClose={
            handleCloseSidebar
          }
        />

        {/* Main Column */}

        <div
          className="
            flex
            min-w-0
            flex-1
            flex-col
          "
        >
          {/* ================================================================
              TOPBAR
          ================================================================ */}

          <div
            className={`
              sticky
              top-0
              z-30
              transition-all
              duration-300
              ${
                isScrolled
                  ? "shadow-[0_12px_45px_rgba(15,23,42,0.075)]"
                  : ""
              }
            `}
          >
            <Topbar
              onMenuClick={
                handleMenuClick
              }
            />
          </div>

          {/* ================================================================
              MAIN CONTENT
          ================================================================ */}

          <main
            id="main-content"
            tabIndex="-1"
            className="
              relative
              min-w-0
              flex-1
              outline-none
            "
          >
            {/* Content Aurora */}

            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                left-1/2
                top-0
                h-56
                w-[75%]
                -translate-x-1/2
                rounded-full
                bg-indigo-500/[0.025]
                blur-3xl
                dark:bg-indigo-500/[0.035]
              "
            />

            {/* Workspace Container */}

            <div
              className="
                relative
                mx-auto
                w-full
                max-w-[1900px]
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
              <div
                key={routeKey}
                className="
                  min-w-0
                  animate-[pageEnter_0.58s_cubic-bezier(0.16,1,0.3,1)]
                "
              >
                <Outlet />
              </div>
            </div>
          </main>

          {/* ================================================================
              PREMIUM FOOTER
          ================================================================ */}

          <footer
            className="
              relative
              mt-auto
              overflow-hidden
              border-t
              border-slate-200/70
              bg-white/50
              px-4
              py-5
              backdrop-blur-2xl
              dark:border-slate-800/70
              dark:bg-slate-950/45
              sm:px-6
              lg:px-8
              xl:px-10
              2xl:px-12
            "
          >
            {/* Footer highlight */}

            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                inset-x-0
                top-0
                h-px
                bg-gradient-to-r
                from-transparent
                via-indigo-400/45
                to-transparent
              "
            />

            <div
              className="
                relative
                mx-auto
                flex
                w-full
                max-w-[1900px]
                flex-col
                gap-5
                text-[11px]
                font-semibold
                text-slate-400
                dark:text-slate-500
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              {/* Brand */}

              <div
                className="
                  flex
                  flex-wrap
                  items-center
                  gap-x-3
                  gap-y-2
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >
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
                      border-indigo-500/20
                      bg-gradient-to-br
                      from-indigo-500/10
                      to-violet-500/5
                      text-indigo-500
                      shadow-sm
                    "
                  >
                    <Sparkles
                      size={14}
                    />
                  </div>

                  <div>
                    <p
                      className="
                        font-black
                        tracking-tight
                        text-slate-700
                        dark:text-slate-200
                      "
                    >
                      ProblemLens
                    </p>

                    <p
                      className="
                        text-[9px]
                        font-bold
                        uppercase
                        tracking-[0.18em]
                        text-indigo-500/70
                      "
                    >
                      Intelligence OS
                    </p>
                  </div>
                </div>

                <span
                  className="
                    hidden
                    text-slate-300
                    dark:text-slate-700
                    sm:inline
                  "
                >
                  •
                </span>

                <span>
                  AI Problem Discovery
                </span>

                <span
                  className="
                    hidden
                    text-slate-300
                    dark:text-slate-700
                    sm:inline
                  "
                >
                  •
                </span>

                <span>
                  ©{" "}
                  {new Date().getFullYear()}
                </span>
              </div>

              {/* System Information */}

              <div
                className="
                  flex
                  flex-wrap
                  items-center
                  gap-2
                  sm:gap-3
                "
              >
                <SystemStatus />

                <SystemTelemetry />

                {/* AI Engine */}

                <div
                  className="
                    hidden
                    items-center
                    gap-1.5
                    rounded-full
                    border
                    border-slate-200/80
                    bg-white/55
                    px-3
                    py-1.5
                    text-[10px]
                    font-bold
                    text-slate-500
                    backdrop-blur-xl
                    transition-all
                    hover:-translate-y-0.5
                    hover:border-indigo-300/40
                    hover:text-indigo-500
                    dark:border-slate-800
                    dark:bg-slate-900/35
                    dark:text-slate-500
                    dark:hover:border-indigo-700/40
                    dark:hover:text-indigo-400
                    lg:flex
                  "
                >
                  <Cpu size={12} />

                  AI Engine
                </div>

                {/* Live */}

                <div
                  className="
                    hidden
                    items-center
                    gap-1.5
                    rounded-full
                    border
                    border-slate-200/80
                    bg-white/55
                    px-3
                    py-1.5
                    text-[10px]
                    font-bold
                    text-slate-500
                    backdrop-blur-xl
                    dark:border-slate-800
                    dark:bg-slate-900/35
                    dark:text-slate-500
                    md:flex
                  "
                >
                  <Activity
                    size={12}
                    className="text-indigo-500"
                  />

                  Live Telemetry
                </div>

                {/* Clock */}

                <div
                  className="
                    hidden
                    items-center
                    gap-1.5
                    rounded-full
                    border
                    border-slate-200/80
                    bg-white/55
                    px-3
                    py-1.5
                    text-[10px]
                    font-bold
                    tabular-nums
                    text-slate-500
                    backdrop-blur-xl
                    dark:border-slate-800
                    dark:bg-slate-900/35
                    dark:text-slate-500
                    xl:flex
                  "
                >
                  <Zap
                    size={11}
                    className="text-cyan-500"
                  />

                  <LiveClock />
                </div>

                {/* Security */}

                <div
                  className="
                    hidden
                    items-center
                    gap-1.5
                    text-[10px]
                    font-extrabold
                    text-slate-400
                    dark:text-slate-500
                    sm:flex
                  "
                >
                  <Fingerprint
                    size={13}
                    className="text-indigo-500"
                  />

                  <ShieldCheck
                    size={13}
                    className="text-indigo-500"
                  />

                  Secure
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* ====================================================================
          BACK TO TOP
      ==================================================================== */}

      <BackToTop />

      {/* ====================================================================
          MOBILE AMBIENT LIGHT
      ==================================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          fixed
          bottom-0
          left-1/2
          z-[-1]
          h-28
          w-[85%]
          -translate-x-1/2
          rounded-full
          bg-indigo-500/[0.035]
          blur-3xl
          lg:hidden
        "
      />

      {/* ====================================================================
          GLOBAL ANIMATION SYSTEM
      ==================================================================== */}

      <style>{`
        @keyframes pageEnter {
          0% {
            opacity: 0;
            transform:
              translate3d(0, 20px, 0)
              scale(0.985);
            filter: blur(5px);
          }

          45% {
            opacity: 0.72;
            filter: blur(1.5px);
          }

          100% {
            opacity: 1;
            transform:
              translate3d(0, 0, 0)
              scale(1);
            filter: blur(0);
          }
        }

        @keyframes premiumFloat {
          0%,
          100% {
            transform:
              translateY(0);
          }

          50% {
            transform:
              translateY(-5px);
          }
        }

        @keyframes glowPulse {
          0%,
          100% {
            opacity: 0.35;
          }

          50% {
            opacity: 0.8;
          }
        }

        @keyframes shimmer {
          0% {
            transform:
              translateX(-100%);
          }

          100% {
            transform:
              translateX(100%);
          }
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          min-width: 320px;
          overflow-x: hidden;
        }

        ::selection {
          background:
            rgba(99,102,241,0.9);
          color: white;
        }

        * {
          scrollbar-width: thin;
          scrollbar-color:
            rgba(99,102,241,0.35)
            transparent;
        }

        *::-webkit-scrollbar {
          width: 7px;
          height: 7px;
        }

        *::-webkit-scrollbar-track {
          background:
            transparent;
        }

        *::-webkit-scrollbar-thumb {
          border-radius: 999px;
          background:
            linear-gradient(
              180deg,
              rgba(99,102,241,0.45),
              rgba(34,211,238,0.25)
            );
          border:
            2px solid transparent;
          background-clip:
            padding-box;
        }

        *::-webkit-scrollbar-thumb:hover {
          background:
            linear-gradient(
              180deg,
              rgba(99,102,241,0.75),
              rgba(34,211,238,0.45)
            );
          border:
            2px solid transparent;
          background-clip:
            padding-box;
        }

        button,
        a,
        input,
        textarea,
        select {
          -webkit-tap-highlight-color:
            transparent;
        }

        button:focus-visible,
        a:focus-visible,
        input:focus-visible,
        textarea:focus-visible,
        select:focus-visible {
          outline:
            2px solid
            rgba(99,102,241,0.7);
          outline-offset: 3px;
        }

        @media (max-width: 1023px) {
          body {
            overflow-x: hidden;
          }
        }

        @media (max-width: 640px) {
          html {
            scroll-behavior: auto;
          }

          * {
            scrollbar-width: none;
          }

          *::-webkit-scrollbar {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          html {
            scroll-behavior:
              auto !important;
          }

          *,
          *::before,
          *::after {
            animation-duration:
              0.01ms !important;

            animation-iteration-count:
              1 !important;

            transition-duration:
              0.01ms !important;

            scroll-behavior:
              auto !important;
          }
        }
      `}</style>
    </div>
  );
}