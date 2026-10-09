
import { useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";

import MiniBarChart from "./MiniBarChart";

const RANGE_CONFIG = {
  "Last 7 days": {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    data: [42, 58, 47, 71, 64, 82, 76],
  },

  "Last 30 days": {
    labels: [
      "01",
      "05",
      "10",
      "15",
      "20",
      "25",
      "30",
    ],
    data: [32, 48, 41, 63, 55, 74, 86],
  },

  "Last 90 days": {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
    ],
    data: [38, 52, 47, 68, 61, 79, 91],
  },
};

export default function ActivityChart() {
  const [range, setRange] =
    useState("Last 7 days");

  const currentData =
    RANGE_CONFIG[range];

  const stats = useMemo(() => {
    const values = currentData.data;

    const total = values.reduce(
      (sum, value) => sum + value,
      0
    );

    const average = Math.round(
      total / values.length
    );

    const current =
      values[values.length - 1];

    const previous =
      values[values.length - 2] ?? current;

    const change =
      previous === 0
        ? 0
        : Math.round(
            ((current - previous) /
              previous) *
              100
          );

    const peak = Math.max(...values);

    return {
      total,
      average,
      current,
      change,
      peak,
    };
  }, [currentData]);

  return (
    <section
      className="
        group
        relative
        overflow-hidden
        rounded-3xl
        border
        border-slate-200/70
        bg-white/80
        p-5
        shadow-[0_18px_60px_rgba(15,23,42,0.06)]
        backdrop-blur-xl
        transition-all
        duration-500
        hover:-translate-y-0.5
        hover:border-indigo-200/70
        hover:shadow-[0_24px_80px_rgba(79,70,229,0.10)]
        dark:border-slate-800/70
        dark:bg-slate-950/70
        dark:hover:border-indigo-900/70
        dark:hover:shadow-[0_24px_80px_rgba(79,70,229,0.12)]
        sm:p-6
      "
    >
      {/* ================================================================
          AMBIENT GLOW
          ================================================================ */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-20
          -top-24
          h-56
          w-56
          rounded-full
          bg-indigo-500/[0.08]
          blur-3xl
          transition-transform
          duration-700
          group-hover:scale-125
          dark:bg-indigo-500/[0.10]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -bottom-24
          left-1/3
          h-48
          w-48
          rounded-full
          bg-cyan-400/[0.045]
          blur-3xl
          dark:bg-cyan-500/[0.06]
        "
      />

      <div className="relative">
        {/* ================================================================
            HEADER
            ================================================================ */}

        <div
          className="
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-start
            sm:justify-between
          "
        >
          <div className="flex min-w-0 items-start gap-3">
            {/* Icon */}

            <div
              className="
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
                border-indigo-500/15
                bg-gradient-to-br
                from-indigo-500/[0.12]
                to-violet-500/[0.06]
                text-indigo-600
                shadow-sm
                transition-all
                duration-500
                group-hover:scale-105
                group-hover:rotate-1
                dark:border-indigo-400/15
                dark:text-indigo-400
              "
            >
              <Activity
                size={19}
                strokeWidth={2.2}
              />

              <span
                className="
                  absolute
                  bottom-1
                  right-1
                  h-1.5
                  w-1.5
                  animate-pulse
                  rounded-full
                  bg-emerald-500
                  shadow-[0_0_8px_rgba(16,185,129,0.7)]
                "
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3
                  className="
                    truncate
                    text-[15px]
                    font-extrabold
                    tracking-[-0.01em]
                    text-slate-900
                    dark:text-white
                  "
                >
                  Research activity
                </h3>

                <Sparkles
                  size={13}
                  className="
                    hidden
                    text-indigo-500
                    sm:block
                  "
                />
              </div>

              <p
                className="
                  mt-1
                  text-xs
                  font-medium
                  leading-5
                  text-slate-400
                  dark:text-slate-500
                "
              >
                Evidence collected across your
                research workspace
              </p>
            </div>
          </div>

          {/* Range selector */}

          <div className="relative shrink-0">
            <CalendarDays
              size={13}
              className="
                pointer-events-none
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-slate-400
              "
            />

            <ChevronDown
              size={14}
              className="
                pointer-events-none
                absolute
                right-2.5
                top-1/2
                -translate-y-1/2
                text-slate-400
              "
            />

            <select
              value={range}
              onChange={(event) =>
                setRange(event.target.value)
              }
              aria-label="Select activity range"
              className="
                w-full
                appearance-none
                rounded-xl
                border
                border-slate-200
                bg-slate-50/80
                py-2.5
                pl-9
                pr-8
                text-xs
                font-bold
                text-slate-600
                outline-none
                transition-all
                duration-300
                hover:border-indigo-200
                hover:bg-white
                focus:border-indigo-400
                focus:ring-4
                focus:ring-indigo-500/10
                dark:border-slate-800
                dark:bg-slate-900/70
                dark:text-slate-300
                dark:hover:border-indigo-800
                dark:hover:bg-slate-900
                dark:focus:border-indigo-700
                sm:w-auto
              "
            >
              {Object.keys(RANGE_CONFIG).map(
                (option) => (
                  <option
                    key={option}
                    value={option}
                  >
                    {option}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        {/* ================================================================
            QUICK METRICS
            ================================================================ */}

        <div
          className="
            mt-5
            grid
            grid-cols-2
            gap-2
            sm:grid-cols-4
          "
        >
          <Metric
            label="Collected"
            value={stats.total}
            icon={<Activity size={13} />}
          />

          <Metric
            label="Average"
            value={stats.average}
            icon={<TrendingUp size={13} />}
          />

          <Metric
            label="Peak"
            value={stats.peak}
            icon={<Zap size={13} />}
          />

          <Metric
            label="Momentum"
            value={`${stats.change >= 0 ? "+" : ""}${stats.change}%`}
            positive={stats.change >= 0}
            icon={<ArrowUpRight size={13} />}
          />
        </div>

        {/* ================================================================
            CHART AREA
            ================================================================ */}

        <div
          className="
            relative
            mt-6
            overflow-hidden
            rounded-2xl
            border
            border-slate-100
            bg-gradient-to-b
            from-slate-50/80
            to-white/40
            px-2
            pb-2
            pt-5
            dark:border-slate-800/70
            dark:from-slate-900/50
            dark:to-slate-950/20
            sm:px-4
          "
        >
          {/* Chart background lines */}

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              inset-x-4
              top-5
              bottom-10
              flex
              flex-col
              justify-between
            "
          >
            {[0, 1, 2, 3].map(
              (line) => (
                <span
                  key={line}
                  className="
                    block
                    border-t
                    border-dashed
                    border-slate-200/70
                    dark:border-slate-800/70
                  "
                />
              )
            )}
          </div>

          {/* Chart */}

          <div
            className="
              relative
              z-10
              h-[190px]
              w-full
              transition-all
              duration-500
              group-hover:scale-[1.005]
              sm:h-[220px]
            "
          >
            <MiniBarChart
              data={currentData.data}
            />
          </div>

          {/* Labels */}

          <div
            className="
              relative
              z-10
              mt-1
              grid
              grid-cols-7
              px-1
              text-center
              text-[9px]
              font-bold
              uppercase
              tracking-wider
              text-slate-400
              dark:text-slate-600
              sm:text-[10px]
            "
          >
            {currentData.labels.map(
              (label) => (
                <span
                  key={label}
                  className="
                    transition-colors
                    duration-300
                    hover:text-indigo-500
                  "
                >
                  {label}
                </span>
              )
            )}
          </div>
        </div>

        {/* ================================================================
            FOOTER INSIGHT
            ================================================================ */}

        <div
          className="
            mt-4
            flex
            flex-col
            gap-2
            rounded-2xl
            border
            border-indigo-100/80
            bg-gradient-to-r
            from-indigo-50/70
            via-violet-50/40
            to-transparent
            px-4
            py-3
            dark:border-indigo-900/40
            dark:from-indigo-950/30
            dark:via-violet-950/20
            dark:to-transparent
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div className="flex items-center gap-2">
            <span
              className="
                flex
                h-6
                w-6
                items-center
                justify-center
                rounded-lg
                bg-indigo-500/10
                text-indigo-500
                dark:bg-indigo-500/10
                dark:text-indigo-400
              "
            >
              <TrendingUp size={12} />
            </span>

            <span
              className="
                text-[11px]
                font-semibold
                text-slate-500
                dark:text-slate-400
              "
            >
              Research momentum
            </span>
          </div>

          <div
            className={`
              flex
              items-center
              gap-1.5
              text-[11px]
              font-extrabold
              ${
                stats.change >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-500 dark:text-rose-400"
              }
            `}
          >
            <ArrowUpRight
              size={13}
              className={
                stats.change < 0
                  ? "rotate-90"
                  : ""
              }
            />

            <span>
              {stats.change >= 0
                ? "Activity is accelerating"
                : "Activity is slowing"}
            </span>

            <span className="opacity-70">
              ({Math.abs(stats.change)}%)
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   METRIC COMPONENT
   ========================================================================== */

function Metric({
  label,
  value,
  icon,
  positive = true,
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-slate-100
        bg-slate-50/60
        px-3
        py-3
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:border-indigo-100
        hover:bg-white
        hover:shadow-sm
        dark:border-slate-800/70
        dark:bg-slate-900/45
        dark:hover:border-indigo-900/60
        dark:hover:bg-slate-900
      "
    >
      <div
        className="
          flex
          items-center
          justify-between
          gap-2
        "
      >
        <span
          className="
            text-[9px]
            font-extrabold
            uppercase
            tracking-[0.12em]
            text-slate-400
            dark:text-slate-600
          "
        >
          {label}
        </span>

        <span
          className={`
            ${
              positive
                ? "text-indigo-500"
                : "text-rose-500"
            }
          `}
        >
          {icon}
        </span>
      </div>

      <div
        className="
          mt-1.5
          text-lg
          font-black
          tracking-tight
          text-slate-800
          dark:text-slate-100
        "
      >
        {value}
      </div>
    </div>
  );
}
