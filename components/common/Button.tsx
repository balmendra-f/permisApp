import { FC } from "react";
import { Pressable, Text, ActivityIndicator, View } from "react-native";

interface ButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg";
  className?: string;
  textClassName?: string;
}

const Button: FC<ButtonProps> = ({
  label,
  onPress,
  disabled = false,
  loading = false,
  variant = "primary",
  size = "default",
  className,
  textClassName,
}) => {
  const baseStyles = "rounded-xl flex-row justify-center items-center";

  const variants = {
    primary: "bg-primary active:opacity-90",
    secondary: "bg-secondary active:opacity-80",
    outline: "border border-input bg-transparent active:bg-accent",
    ghost: "bg-transparent active:bg-accent",
    destructive: "bg-destructive active:opacity-90",
  };

  const sizes = {
    default: "h-12 px-4 py-2",
    sm: "h-9 px-3",
    lg: "h-14 px-8",
  };

  const textVariants = {
    primary: "text-primary-foreground font-semibold",
    secondary: "text-secondary-foreground font-medium",
    outline: "text-foreground font-medium",
    ghost: "text-foreground font-medium",
    destructive: "text-destructive-foreground font-bold",
  };

  const textSizes = {
    default: "text-base",
    sm: "text-sm",
    lg: "text-lg",
  };

  const currentVariant = variants[variant];
  const currentSize = sizes[size];
  const currentTextVariant = textVariants[variant];
  const currentTextSize = textSizes[size];

  return (
    <Pressable
      className={`${baseStyles} ${currentVariant} ${currentSize} ${disabled || loading ? "opacity-50" : ""} ${className}`}
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        { opacity: pressed && !disabled && !loading ? 0.8 : (disabled || loading ? 0.5 : 1) }
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? '#4f46e5' : '#fff'} className="mr-2" />
      ) : null}
      <Text className={`${currentTextVariant} ${currentTextSize} ${textClassName}`}>
        {label}
      </Text>
    </Pressable>
  );
};

export default Button;
