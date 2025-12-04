import React, { FC } from "react";
import { Pressable, Text } from "react-native";

interface ButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
  className?: string;
  textClassName?: string;
}

const Button: FC<ButtonProps> = ({
  label,
  onPress,
  disabled = false,
  variant = "primary",
  className,
  textClassName,
}) => {
  const baseStyle = "p-4 rounded-xl items-center mb-4";
  let variantStyle = "bg-indigo-700";

  if (variant === "secondary") {
    variantStyle = "bg-neutral-800 border border-neutral-700";
  } else if (variant === "danger") {
    variantStyle = "bg-red-600";
  }

  return (
    <Pressable
      className={`${baseStyle} ${variantStyle} ${className || ""} ${
        disabled ? "opacity-50" : ""
      }`}
      onPress={onPress}
      disabled={disabled}
    >
      <Text
        className={`text-white text-base font-semibold ${textClassName || ""}`}
      >
        {label}
      </Text>
    </Pressable>
  );
};

export default Button;
