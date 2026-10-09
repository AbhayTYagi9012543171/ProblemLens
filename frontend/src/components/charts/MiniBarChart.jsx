
import { useMemo, useState } from "react";
import {
  BarChart3,
  MousePointer2,
  TrendingUp,
} from "lucide-react";

export default function MiniBarChart({
  data = [],
}) {
  const [activeIndex, setActiveIndex] =
    useState(null);

  const safeData = useMemo(
    () =>
      Array.isArray(data)
        ? data.map((value) => {
            const numericValue =
              Number(value);

            return Number.isFinite(
              numericValue
            )
              ? Math.max(
                  0,
                  numericValue
                )
              : 0;
          })
        : [],
    [data]
  );

  const max = Math.max(
    ...safeData,
    1
  );

  const min = Math.min(
    ...safeData,
    0
  );

  const total = safeData.reduce(
    (sum, value) =>
      sum + value,
    0
  );

  const average =
    safeData.length > 0
      ? total / safeData.length
      : 0;

  const peakIndex =
    safeData.length > 0
      ? safeData.indexOf(max)
      : -1;

  const getHeight = (value) => {
    if (max <= 0) return 8;

    return Math.max(
      (value / max) * 100,
      value > 0 ? 9 : 5
    );
  };

  if (!safeData.length) {
    return (
      <div
        className="
          flex
          h-full
          min-h-[180px]
          w-full
          items-center
          justify-center
          rounded-2xl
          border
          border-dashed
          border-slate-200
          bg-slate-50/60
          dark:border-slate-800
          dark:bg-slate-900/30
        "
      >
        <div
          className="
            flex
            flex-col
            items-center
            gap-2
            text-center
          "
        >
          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              bg-slate-100
              text-slate-400
              dark:bg-slate-800
              dark:text-slate-600
            "
          >
            <BarChart3
              size={18}
            />
          </div>

          <p
            className="
              text-xs
              font-semibold
              text-slate-400
              dark:text-slate-500
            "
          >
            No activity data available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="
        relative
        h-full
        min-h-[180px]
        w-full
        select-none
      "
    >
      {/* ================================================================
          CHART HEADER
          ================================================================ */}

      <div
        className="
          absolute
          left-1
          top-0
          z-20
          flex
          items-center
          gap-1.5
          text-[9px]
          font-extrabold
          uppercase
          tracking-[0.12em]
          text-slate-400
          dark:text-slate-600
        "
      >
        <TrendingUp
          size={11}
          className="text-indigo-500"
        />

        <span>
          Activity volume
        </span>
      </div>

      {/* ================================================================
          GRID
          ================================================================ */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-0
          bottom-1
          top-7
          flex
          flex-col
          justify-between
        "
      >
        {[0, 1, 2, 3, 4].map(
          (line) => (
            <div
              key={line}
              className="
                flex
                items-center
                gap-2
              "
            >
              <span
                className="
                  h-px
                  flex-1
                  border-t
                  border-dashed
                  border-slate-200/80
                  dark:border-slate-800/80
                "
              />
            </div>
          )
        )}
      </div>

      {/* ================================================================
          BARS
          ================================================================ */}

      <div
        className="
          absolute
          inset-x-0
          bottom-1
          top-7
          flex
          items-end
          gap-1.5
          px-0.5
          sm:gap-2
        "
      >
        {safeData.map(
          (value, index) => {
            const height =
              getHeight(value);

            const isActive =
              activeIndex === index;

            const isPeak =
              index === peakIndex;

            const isAboveAverage =
              value >= average;

            return (
              <div
                key={`${value}-${index}`}
                className="
                  group
                  relative
                  flex
                  h-full
                  min-w-0
                  flex-1
                  items-end
                "
                onMouseEnter={() =>
                  setActiveIndex(index)
                }
                onMouseLeave={() =>
                  setActiveIndex(null)
                }
                onFocus={() =>
                  setActiveIndex(index)
                }
                onBlur={() =>
                  setActiveIndex(null)
                }
                tabIndex={0}
                role="button"
                aria-label={`Activity ${value}`}
              >
                {/* ======================================================
                    TOOLTIP
                    ====================================================== */}

                <div
                  className={`
                    pointer-events-none
                    absolute
                    bottom-full
                    left-1/2
                    z-50
                    mb-3
                    -translate-x-1/2
                    transition-all
                    duration-200
                    ${
                      isActive
                        ? "translate-y-0 scale-100 opacity-100"
                        : "translate-y-1 scale-95 opacity-0"
                    }
                  `}
                >
                  <div
                    className="
                      relative
                      min-w-[74px]
                      rounded-xl
                      border
                      border-slate-700/60
                      bg-slate-950
                      px-3
                      py-2
                      text-center
                      shadow-2xl
                      shadow-slate-950/20
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        justify-center
                        gap-1.5
                      "
                    >
                      <MousePointer2
                        size={10}
                        className="
                          text-indigo-400
                        "
                      />

                      <span
                        className="
                          text-sm
                          font-black
                          text-white
                        "
                      >
                        {value}
                      </span>
                    </div>

                    <p
                      className="
                        mt-0.5
                        text-[8px]
                        font-semibold
                        uppercase
                        tracking-wider
                        text-slate-500
                      "
                    >
                      activity
                    </p>

                    <span
                      className="
                        absolute
                        left-1/2
                        top-full
                        h-2
                        w-2
                        -translate-x-1/2
                        -translate-y-1/2
                        rotate-45
                        border-r
                        border-b
                        border-slate-700/60
                        bg-slate-950
                      "
                    />
                  </div>
                </div>

                {/* ======================================================
                    PEAK INDICATOR
                    ====================================================== */}

                {isPeak && (
                  <div
                    className="
                      absolute
                      bottom-[calc(var(--bar-height)+8px)]
                      left-1/2
                      z-20
                      -translate-x-1/2
                      opacity-0
                      transition-opacity
                      duration-300
                      group-hover:opacity-100
                    "
                  >
                    <div
                      className="
                        h-1.5
                        w-1.5
                        animate-pulse
                        rounded-full
                        bg-indigo-500
                        shadow-[0_0_10px_rgba(99,102,241,0.8)]
                      "
                    />
                  </div>
                )}

                {/* ======================================================
                    BAR GLOW
                    ====================================================== */}

                <div
                  aria-hidden="true"
                  className={`
                    absolute
                    bottom-0
                    left-1/2
                    w-[78%]
                    -translate-x-1/2
                    rounded-t-2xl
                    bg-indigo-500/20
                    blur-xl
                    transition-all
                    duration-500
                    ${
                      isActive
                        ? "opacity-100"
                        : "opacity-0"
                    }
                  `}
                  style={{
                    height: `${height}%`,
                  }}
                />

                {/* ======================================================
                    MAIN BAR
                    ====================================================== */}

                <div
                  className={`
                    relative
                    w-full
                    overflow-hidden
                    rounded-t-[10px]
                    border
                    border-indigo-400/10
                    bg-gradient-to-t
                    from-indigo-600
                    via-indigo-500
                    to-violet-400
                    shadow-[0_8px_24px_rgba(79,70,229,0.10)]
                    transition-all
                    duration-500
                    ease-[cubic-bezier(0.16,1,0.3,1)]
                    ${
                      isActive
                        ? "scale-x-[1.04] brightness-110 shadow-[0_14px_34px_rgba(79,70,229,0.25)]"
                        : "scale-x-100"
                    }
                    ${
                      isAboveAverage
                        ? "opacity-100"
                        : "opacity-75"
                    }
                  `}
                  style={{
                    height: `${height}%`,
                    "--bar-height": `${height}%`,
                    animationDelay: `${
                      index * 45
                    }ms`,
                  }}
                  title={`${value} activity`}
                >
                  {/* Gloss */}

                  <div
                    aria-hidden="true"
                    className="
                      absolute
                      inset-x-0
                      top-0
                      h-1/3
                      bg-gradient-to-b
                      from-white/30
                      to-transparent
                      opacity-70
                    "
                  />

                  {/* Inner highlight */}

                  <div
                    aria-hidden="true"
                    className="
                      absolute
                      bottom-0
                      left-0
                      top-0
                      w-px
                      bg-white/20
                    "
                  />

                  {/* Bottom depth */}

                  <div
                    aria-hidden="true"
                    className="
                      absolute
                      bottom-0
                      left-0
                      right-0
                      h-1
                      bg-indigo-950/20
                    "
                  />

                  {/* Active shimmer */}

                  <div
                    aria-hidden="true"
                    className={`
                      absolute
                      -left-full
                      top-0
                      h-full
                      w-1/2
                      skew-x-[-18deg]
                      bg-white/20
                      transition-all
                      duration-700
                      ${
                        isActive
                          ? "left-[140%]"
                          : ""
                      }
                    `}
                  />
                </div>
              </div>
            );
          }
        )}
      </div>

      {/* ================================================================
          BASELINE
          ================================================================ */}

      <div
        aria-hidden="true"
        className="
          absolute
          bottom-0
          left-0
          right-0
          h-px
          bg-slate-200
          dark:bg-slate-800
        "
      />

      {/* ================================================================
          ACCESSIBILITY / RANGE HINT
          ================================================================ */}

      <div
        className="
          absolute
          bottom-[-1px]
          left-0
          flex
          translate-y-full
          items-center
          gap-2
          pt-2
          text-[8px]
          font-semibold
          text-slate-400
          dark:text-slate-600
        "
      >
        <span>
          {min}
        </span>

        <span
          className="
            h-px
            w-6
            bg-slate-200
            dark:bg-slate-800
          "
        />

        <span>
          {max}
        </span>
      </div>
    </div>
  );
}
