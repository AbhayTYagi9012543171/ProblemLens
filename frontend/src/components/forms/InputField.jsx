import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { useId, useState } from "react";

/* =========================================================
   PROBLEMLENS — PREMIUM INPUT FIELD
   ========================================================= */

export default function InputField({
  label,
  icon: Icon,

  error,
  hint,

  success = false,
  warning = false,

  required = false,
  loading = false,

  showPasswordToggle = false,

  trailingIcon: TrailingIcon,
  onTrailingIconClick,

  showValidationIcon = false,

  maxLength,
  showCounter = false,

  size = "md",

  containerClassName = "",
  inputClassName = "",
  className = "",

  id: providedId,

  disabled = false,
  readOnly = false,

  ...props
}) {
  const generatedId = useId();

  const inputId =
    providedId || `problemlens-input-${generatedId}`;

  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;

  const [showPassword, setShowPassword] =
    useState(false);

  const isPassword =
    props.type === "password";

  const shouldShowPasswordToggle =
    showPasswordToggle && isPassword;

  const inputType =
    shouldShowPasswordToggle
      ? showPassword
        ? "text"
        : "password"
      : props.type;

  /* =======================================================
     SIZE CONFIG
  ======================================================= */

  const sizes = {
    sm: {
      input:
        "h-10 rounded-xl px-3.5 text-sm",
      icon:
        "left-3.5",
      iconSize: 16,
      iconPadding:
        "pl-10",
      rightPadding:
        "pr-10",
    },

    md: {
      input:
        "h-12 rounded-2xl px-4 text-sm",
      icon:
        "left-4",
      iconSize: 17,
      iconPadding:
        "pl-11",
      rightPadding:
        "pr-11",
    },

    lg: {
      input:
        "h-14 rounded-2xl px-4.5 text-base",
      icon:
        "left-4.5",
      iconSize: 18,
      iconPadding:
        "pl-12",
      rightPadding:
        "pr-12",
    },
  };

  const sizeConfig =
    sizes[size] || sizes.md;

  /* =======================================================
     STATE
  ======================================================= */

  const hasError = Boolean(error);
  const hasSuccess =
    success && !hasError;

  const hasWarning =
    warning &&
    !hasError &&
    !hasSuccess;

  const describedBy = hasError
    ? errorId
    : hint
      ? hintId
      : undefined;

  /* =======================================================
     BORDER / FOCUS
  ======================================================= */

  let stateClasses = `
    border-slate-200/80
    bg-white/90
    text-slate-900
    placeholder:text-slate-400
    hover:border-slate-300
    focus:border-indigo-500
    focus:ring-4
    focus:ring-indigo-500/10
    dark:border-white/[0.08]
    dark:bg-white/[0.035]
    dark:text-white
    dark:placeholder:text-slate-500
    dark:hover:border-white/[0.14]
    dark:focus:border-indigo-400
    dark:focus:ring-indigo-400/10
  `;

  if (hasError) {
    stateClasses = `
      border-rose-300
      bg-rose-50/30
      text-slate-900
      placeholder:text-slate-400
      hover:border-rose-400
      focus:border-rose-500
      focus:ring-4
      focus:ring-rose-500/10
      dark:border-rose-400/30
      dark:bg-rose-400/[0.035]
      dark:text-white
      dark:focus:border-rose-400
      dark:focus:ring-rose-400/10
    `;
  }

  if (hasSuccess) {
    stateClasses = `
      border-emerald-300
      bg-emerald-50/30
      text-slate-900
      placeholder:text-slate-400
      hover:border-emerald-400
      focus:border-emerald-500
      focus:ring-4
      focus:ring-emerald-500/10
      dark:border-emerald-400/30
      dark:bg-emerald-400/[0.035]
      dark:text-white
      dark:focus:border-emerald-400
      dark:focus:ring-emerald-400/10
    `;
  }

  if (hasWarning) {
    stateClasses = `
      border-amber-300
      bg-amber-50/30
      text-slate-900
      placeholder:text-slate-400
      hover:border-amber-400
      focus:border-amber-500
      focus:ring-4
      focus:ring-amber-500/10
      dark:border-amber-400/30
      dark:bg-amber-400/[0.035]
      dark:text-white
      dark:focus:border-amber-400
      dark:focus:ring-amber-400/10
    `;
  }

  /* =======================================================
     ICON COLOR
  ======================================================= */

  const iconColor = hasError
    ? "text-rose-400"
    : hasSuccess
      ? "text-emerald-500"
      : hasWarning
        ? "text-amber-500"
        : "text-slate-400 group-focus-within:text-indigo-500 dark:text-slate-500 dark:group-focus-within:text-indigo-300";

  return (
    <div
      className={`
        group
        w-full
        ${className}
      `}
    >
      {/* =================================================
          LABEL ROW
      ================================================= */}

      {label && (
        <div className="mb-2 flex items-center justify-between gap-3">
          <label
            htmlFor={inputId}
            className="
              block
              text-xs
              font-bold
              tracking-[0.01em]
              text-slate-700
              dark:text-slate-300
            "
          >
            {label}

            {required && (
              <span
                className="
                  ml-1
                  text-rose-500
                  dark:text-rose-400
                "
                aria-hidden="true"
              >
                *
              </span>
            )}
          </label>

          {showCounter && maxLength && (
            <span
              className="
                text-[10px]
                font-medium
                text-slate-400
                dark:text-slate-500
              "
            >
              {(props.value || "").length}/{maxLength}
            </span>
          )}
        </div>
      )}

      {/* =================================================
          INPUT CONTAINER
      ================================================= */}

      <div
        className={`
          relative
          ${containerClassName}
        `}
      >
        {/* Ambient focus glow */}

        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -inset-1
            -z-10
            rounded-[1.15rem]
            bg-indigo-500/[0.08]
            opacity-0
            blur-lg
            transition-opacity
            duration-300
            group-focus-within:opacity-100
          "
        />

        {/* Leading icon */}

        {Icon && (
          <Icon
            size={sizeConfig.iconSize}
            strokeWidth={2}
            className={`
              pointer-events-none
              absolute
              top-1/2
              z-10
              -translate-y-1/2
              transition-colors
              duration-200
              ${sizeConfig.icon}
              ${iconColor}
            `}
            aria-hidden="true"
          />
        )}

        {/* =================================================
            INPUT
        ================================================= */}

        <input
          id={inputId}
          type={inputType}
          disabled={disabled || loading}
          readOnly={readOnly}
          maxLength={maxLength}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
          aria-required={required || undefined}
          className={`
            block
            w-full
            border
            outline-none
            shadow-sm
            backdrop-blur-xl
            transition-all
            duration-200
            ${sizeConfig.input}

            ${
              Icon
                ? sizeConfig.iconPadding
                : ""
            }

            ${
              shouldShowPasswordToggle ||
              TrailingIcon ||
              loading ||
              (showValidationIcon &&
                (hasError || hasSuccess))
                ? sizeConfig.rightPadding
                : ""
            }

            ${stateClasses}

            ${
              disabled || loading
                ? `
                  cursor-not-allowed
                  bg-slate-100/80
                  opacity-60
                  dark:bg-white/[0.025]
                `
                : ""
            }

            ${
              readOnly
                ? `
                  cursor-default
                  bg-slate-50/80
                  dark:bg-white/[0.02]
                `
                : ""
            }

            ${inputClassName}
          `}
          {...props}
        />

        {/* =================================================
            RIGHT SIDE CONTROLS
        ================================================= */}

        <div
          className="
            absolute
            right-2.5
            top-1/2
            z-10
            flex
            -translate-y-1/2
            items-center
            gap-1
          "
        >
          {/* Loading */}

          {loading && (
            <Loader2
              size={17}
              className="
                animate-spin
                text-indigo-500
                dark:text-indigo-300
              "
              aria-label="Loading"
            />
          )}

          {/* Validation */}

          {!loading &&
            showValidationIcon &&
            hasSuccess && (
              <CheckCircle2
                size={17}
                className="
                  text-emerald-500
                  animate-[inputValidation_0.3s_ease-out]
                "
                aria-hidden="true"
              />
            )}

          {!loading &&
            showValidationIcon &&
            hasError && (
              <AlertCircle
                size={17}
                className="
                  text-rose-500
                  animate-[inputValidation_0.3s_ease-out]
                "
                aria-hidden="true"
              />
            )}

          {/* Password */}

          {!loading &&
            shouldShowPasswordToggle && (
              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (current) => !current
                  )
                }
                tabIndex={-1}
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  text-slate-400
                  transition-all
                  hover:bg-slate-100
                  hover:text-slate-700
                  focus:outline-none
                  dark:text-slate-500
                  dark:hover:bg-white/[0.06]
                  dark:hover:text-slate-300
                "
              >
                {showPassword ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </button>
            )}

          {/* Custom trailing icon */}

          {!loading &&
            !shouldShowPasswordToggle &&
            TrailingIcon && (
              <button
                type="button"
                onClick={onTrailingIconClick}
                disabled={!onTrailingIconClick}
                tabIndex={
                  onTrailingIconClick
                    ? 0
                    : -1
                }
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  text-slate-400
                  transition-all
                  hover:bg-slate-100
                  hover:text-slate-700
                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-indigo-500/30
                  disabled:cursor-default
                  dark:text-slate-500
                  dark:hover:bg-white/[0.06]
                  dark:hover:text-slate-300
                "
                aria-label={
                  onTrailingIconClick
                    ? "Input action"
                    : undefined
                }
              >
                <TrailingIcon size={16} />
              </button>
            )}
        </div>
      </div>

      {/* =================================================
          MESSAGE ROW
      ================================================= */}

      {(error || hint) && (
        <div className="mt-1.5 min-h-[18px]">
          {error ? (
            <p
              id={errorId}
              role="alert"
              className="
                flex
                items-start
                gap-1.5
                text-xs
                font-medium
                leading-5
                text-rose-600
                dark:text-rose-400
              "
            >
              <AlertCircle
                size={13}
                className="mt-0.5 shrink-0"
                aria-hidden="true"
              />

              <span>{error}</span>
            </p>
          ) : (
            <p
              id={hintId}
              className="
                text-xs
                leading-5
                text-slate-400
                dark:text-slate-500
              "
            >
              {hint}
            </p>
          )}
        </div>
      )}
    </div>
  );
}