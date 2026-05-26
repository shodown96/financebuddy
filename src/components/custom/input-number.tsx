import * as React from "react";

import { cn, formatNumber } from "@/lib/utils";

export interface InputProps extends React.ComponentProps<"input"> {
  label?: string;
  actualType?: string;
  labelStyle?: string;
  supportingText?: string;
  supportingTextStyle?: string;
  touched?: boolean;
  error?: any;
  containerClass?: string;
  description?: string;
  leftIcon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  rightIcon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
}

function NumberInput({
  className = "",
  containerClass = "",
  label,
  id,
  labelStyle = "",
  type,
  value,
  error,
  touched,
  description,
  leftIcon: LetfIcon,
  rightIcon: RightIcon,
  onChange,
  ...props
}: InputProps) {
  const [displayValue, setDisplayValue] = React.useState(value || "");
  const effectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanInput = e.target.value.replace(/[^0-9.-]/g, "");
    // TODO: support decimals
    onChange?.({
      ...e,
      target: {
        ...e.target,
        id: id as string,
        value: cleanInput,
      },
    });
    setDisplayValue(formatNumber(cleanInput)); // Update formatted value
  };

  React.useEffect(() => {
    const cleanInput = `${value}`.replace(/[^0-9.-]/g, "");
    setDisplayValue(formatNumber(cleanInput)); // Update formatted value
  }, [value]);

  return (
    <div className={cn(containerClass, "max-h-18")}>
      {label && (
        <p
          className={cn(
            "text-[13px] font-medium w-full text-left mb-1",
            labelStyle,
          )}
        >
          {label}
        </p>
      )}
      <div
        className={cn(
          "flex gap-2 items-center border border-input shadow-xs transition-all rounded-md px-4 py-2.5 group",
          "focus-within:outline-none focus-within:ring-0 focus-within:ring-primary focus-within:border-primary",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          touched && error
            ? "outline-error! ring-[0.5px] ring-error border-error!"
            : "",
        )}
      >
        {LetfIcon ? (
          <LetfIcon
            className={cn(
              "text-muted-foreground transition-all",
              touched && error ? "text-error!" : "",
              value?.toString().length
                ? "group-focus-within: text-primary"
                : "",
            )}
          />
        ) : null}
        <input
          id={id}
          type="text"
          data-slot="input"
          className={cn(
            "w-full text-base md:text-sm outline-none",
            "file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 bg-transparent disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 ",
            className,
          )}
          onChange={effectChange}
          value={displayValue}
          {...props}
        />
      </div>
      {/* {description ? (
        <div className="text-xs text-gray-600">{description}</div>
      ) : null} */}
      <input type="hidden" id={id} value={value} />
      {touched && error && (
        <label className={"text-xs text-error "}>
          {error?.message || typeof error === "string" ? error : null}
        </label>
      )}
    </div>
  );
}

export { NumberInput };
