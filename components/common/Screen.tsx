import { FC, ReactNode } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ScreenProps {
  children: ReactNode;
  tabbed?: boolean;
  className?: string;
  safeArea?: boolean;
}

const Screen: FC<ScreenProps> = ({ children, tabbed, className = "", safeArea = true }) => {
  const insets = useSafeAreaInsets();
  const shouldSetBottomInset = Platform.OS !== "android" && !tabbed;

  const paddingTop = safeArea ? Math.max(insets.top, 16) : 0;
  const paddingBottom = safeArea && shouldSetBottomInset ? Math.max(insets.bottom, 16) : 0;

  return (
    <View
      className={`flex-1 bg-background ${className}`}
      style={{
        paddingTop,
        paddingBottom,
      }}
    >
      <KeyboardAvoidingView
        enabled={Platform.OS === "ios"}
        behavior="padding"
        style={{ flex: 1 }}
      >
        {children}
      </KeyboardAvoidingView>
    </View>
  );
};

export default Screen;
