import {
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState } from "react";
import InputField from "./InputField";

/* =========================================================
   PROBLEMLENS — PREMIUM PASSWORD FIELD
   ========================================================= */

export default function PasswordField({
  label = "Password",

  value = "",
  onChange,

  error,

  placeholder = "Enter your password",

  autoComplete = "current-password",

  required = false,
  disabled = false,
  loading = false,

  showStrength = false,

  minLength = 8,

  hint,

  className = "",

  name,
  id,
}) {
  const [visible, setVisible] = useState(false);

  /* =======================================================
     PASSWORD STRENGTH
  ======================================================= */

  const strength = useMemo(() => {
    const password = String(value || "");

    if (!password) {
      return {
        score: 0,
        label: "Enter password",
        percent: 0,
      };
    }

    let score = 0;

    if (password.length >= minLength) {
      score += 1;
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    }

    if (/\d/.test(password)) {
      score += 1;
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1;
    }

    const levels = {
      0: {
        label: "Very weak",
        percent: 10,
      },
      1: {
        label: "Weak",
        percent: 25,
      },
      2: {
        label: "Fair",
        percent: 45,
      },
      3: {
        label: "Good",
        percent: 65,
      },
      4: {
        label: "Strong",
        percent: 82,
      },
      5: {
        label: "Excellent",
        percent: 100,
      },
    };

    return {
      score,
      ...levels[score],
    };
  }, [value, minLength]);

  const requirements = [
    {
      label: `${minLength}+ characters`,
      valid: String(value).length >= minLength,
    },
    {
      label: "Uppercase letter",
      valid: /[A-Z]/.test(value),
    },
    {
      label: "Lowercase letter",
      valid: /[a-z]/.test(value),
    },
    {
      label: "Number",
      valid: /\d/.test(value),
    },
    {
      label: "Special character",
      valid: /[^A-Za-z0-9]/.test(value),
    },
  ];

  return (
    <div
      className={`
        w-full
        ${className}
      `}
    >
      {/* =================================================
          INPUT
      ================================================= */}

      <div className="relative">
        <InputField
          id={id}
          name={name}
          label={label}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          icon={LockKeyhole}
          error={error}
          hint={hint}
          required={required}
          disabled={disabled}
          loading={loading}
          className="w-full"
          inputClassName="
            pr-12
          "
        />

        {/* =================================================
            VISIBILITY BUTTON
        ================================================= */}

        {!loading && (
          <button
            type="button"
            onClick={() =>
              setVisible((current) => !current)
            }
            disabled={disabled}
            aria-label={
              visible
                ? "Hide password"
                : "Show password"
            }
            aria-pressed={visible}
            className="
              absolute
              right-2.5
              top-[35px]
              z-20
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              text-slate-400
              transition-all
              duration-200
              hover:bg-slate-100
              hover:text-slate-700
              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-indigo-500/30
              active:scale-95
              disabled:pointer-events-none
              disabled:opacity-50
              dark:text-slate-500
              dark:hover:bg-white/[0.06]
              dark:hover:text-slate-200
            "
          >
            <span
              className="
                transition-transform
                duration-200
              "
            >
              {visible ? (
                <EyeOff size={17} />
              ) : (
                <Eye size={17} />
              )}
            </span>
          </button>
        )}
      </div>

      {/* =================================================
          STRENGTH
      ================================================= */}

      {showStrength && value && (
        <div
          className="
            mt-3
            rounded-2xl
            border
            border-slate-200/70
            bg-slate-50/70
            p-3
            dark:border-white/[0.07]
            dark:bg-white/[0.025]
          "
        >
          {/* Strength header */}

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck
                size={14}
                className="
                  text-indigo-500
                  dark:text-indigo-300
                "
              />

              <span
                className="
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.1em]
                  text-slate-500
                  dark:text-slate-400
                "
              >
                Password strength
              </span>
            </div>

            <span
              className="
                text-xs
                font-semibold
                text-slate-600
                dark:text-slate-300
              "
            >
              {strength.label}
            </span>
          </div>

          {/* Progress */}

          <div
            className="
              mt-2.5
              h-1.5
              overflow-hidden
              rounded-full
              bg-slate-200
              dark:bg-white/[0.08]
            "
          >
            <div
              className="
                h-full
                rounded-full
                bg-gradient-to-r
                from-indigo-500
                via-violet-500
                to-emerald-500
                transition-all
                duration-500
                ease-out
              "
              style={{
                width: `${strength.percent}%`,
              }}
            />
          </div>

          {/* Requirements */}

          <div
            className="
              mt-3
              grid
              grid-cols-1
              gap-1.5
              sm:grid-cols-2
            "
          >
            {requirements.map((requirement) => (
              <div
                key={requirement.label}
                className={`
                  flex
                  items-center
                  gap-1.5
                  text-[10px]
                  font-medium
                  transition-colors
                  ${
                    requirement.valid
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-slate-400 dark:text-slate-500"
                  }
                `}
              >
                <span
                  className={`
                    flex
                    h-4
                    w-4
                    items-center
                    justify-center
                    rounded-full
                    transition-all
                    ${
                      requirement.valid
                        ? "bg-emerald-100 dark:bg-emerald-400/10"
                        : "bg-slate-100 dark:bg-white/[0.05]"
                    }
                  `}
                >
                  {requirement.valid && (
                    <Check
                      size={10}
                      strokeWidth={3}
                    />
                  )}
                </span>

                {requirement.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================================================
          SECURE MESSAGE
      ================================================= */}

      {showStrength &&
        value &&
        strength.score >= 4 &&
        !error && (
          <div
            className="
              mt-2
              flex
              items-center
              gap-1.5
              text-[11px]
              font-medium
              text-emerald-600
              dark:text-emerald-400
            "
          >
            <ShieldCheck size={13} />

            <span>
              This password meets the recommended
              security requirements.
            </span>
          </div>
        )}
    </div>
  );
}