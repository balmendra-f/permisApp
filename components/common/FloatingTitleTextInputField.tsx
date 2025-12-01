import React, { useRef, useState, useEffect } from "react";
import {
  Animated,
  Text,
  TextInput,
  View,
  TextInputProps,
} from "react-native";

interface FloatingTitleTextInputFieldProps extends TextInputProps {
  title: string;
  value: string;
  onChange: (text: string) => void;
  error?: string;
  touched?: boolean;
  containerClassName?: string;
}

export const FloatingTitleTextInputField: React.FC<
  FloatingTitleTextInputFieldProps
> = ({
  title,
  value,
  onChange,
  error,
  touched,
  containerClassName,
  secureTextEntry,
  keyboardType,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const position = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    if (value || isFocused) {
      Animated.timing(position, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(position, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [value, isFocused]);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const titleStyle = {
    top: position.interpolate({
      inputRange: [0, 1],
      outputRange: [18, -8],
    }),
    fontSize: position.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: position.interpolate({
      inputRange: [0, 1],
      outputRange: ["#64748b", "#4f46e5"],
    }),
    zIndex: 1,
  };

  const borderColor = error && touched
    ? "border-destructive"
    : isFocused
      ? "border-primary ring-2 ring-primary/20"
      : "border-border";

  return (
    <View className={`w-full mb-4 ${containerClassName}`}>
      <View
        className={`relative w-full bg-white rounded-xl border ${borderColor} px-4 pt-4 pb-2 h-16 justify-center`}
      >
        <Animated.Text
          style={[
            {
              position: "absolute",
              left: 16,
              fontWeight: "500",
              backgroundColor: "transparent",
            },
            titleStyle,
          ]}
        >
          {title}
        </Animated.Text>
        <TextInput
          value={value}
          onChangeText={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="text-base text-slate-900 mt-2 h-full"
          placeholder=""
          underlineColorAndroid="transparent"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          {...props}
        />
      </View>
      {error && touched && (
        <Text className="text-destructive text-sm mt-1 ml-1">{error}</Text>
      )}
    </View>
  );
};
