import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Spinner } from "../Spinner";
import { SHAPE_LINK, SIZE_ICON_ONLY, SPINNER_PX, type ButtonSize, type ButtonTheme } from "./button-theme";

interface ThemedButtonProps<Variant extends string> extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant | "link";
  size?: ButtonSize;
  loading?: boolean;
  iconOnly?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children?: ReactNode;
}

const sizeClassFor = <Variant extends string>(theme: ButtonTheme<Variant>, size: ButtonSize, isLink: boolean, iconOnly: boolean): string => {
  if (isLink) return theme.sizeLink[size];
  return iconOnly ? SIZE_ICON_ONLY[size] : theme.sizeText[size];
};

export const createButton = <Variant extends string>(theme: ButtonTheme<Variant>, defaultVariant: NoInfer<Variant>) => {
  const ThemedButton = forwardRef<HTMLButtonElement, ThemedButtonProps<Variant>>(
    (
      {
        variant = defaultVariant,
        size = "md",
        loading = false,
        iconOnly = false,
        fullWidth = false,
        leftIcon,
        rightIcon,
        disabled,
        className = "",
        children,
        type = "button",
        ...rest
      },
      ref,
    ) => {
      const isLink = variant === "link";
      const shapeClass = isLink ? SHAPE_LINK : theme.shapeBox;
      const widthClass = fullWidth ? "w-full" : "";
      return (
        <button
          ref={ref}
          type={type}
          disabled={disabled || loading}
          className={`${theme.base} ${shapeClass} ${sizeClassFor(theme, size, isLink, iconOnly)} ${theme.variants[variant]} ${widthClass} ${className}`}
          {...rest}
        >
          {loading && <Spinner size={SPINNER_PX[size]} />}
          {!loading && leftIcon}
          {children}
          {!loading && rightIcon}
        </button>
      );
    },
  );
  ThemedButton.displayName = "Button";
  return ThemedButton;
};
