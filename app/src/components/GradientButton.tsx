"use client";

import React from "react";
import Link from "next/link";

interface GradientButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "hud";
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
}

export function GradientButton({
  children,
  variant = "primary",
  href,
  onClick,
  disabled = false,
  className = "",
  type = "button",
}: GradientButtonProps) {
  const baseClass =
    variant === "hud"
      ? "btn-hud"
      : variant === "primary"
      ? "btn-primary"
      : "btn-secondary";
  const combinedClass = `${baseClass} ${className}`;

  if (href && !disabled) {
    return (
      <Link href={href} className={combinedClass}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedClass}
    >
      {children}
    </button>
  );
}
