import React from "react";
import { TextInput, TextInputProps, View, Text } from "react-native";

interface InputProps extends TextInputProps {
  className?: string;
  error?: string;
}

export default function Input({ className, error, ...props }: InputProps) {
  return (
    <View className="mb-4">
      <TextInput
        className={`bg-neutral-800 rounded-xl p-4 text-white text-base ${className}`}
        placeholderTextColor="#666"
        {...props}
      />
      {error && <Text className="text-red-400 text-sm mt-1">{error}</Text>}
    </View>
  );
}
