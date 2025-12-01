import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "nativewind";
import { useEffect, useState } from "react";

const THEME_KEY = "theme_preference";

export const useThemeConfig = () => {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_KEY);
        if (savedTheme === "dark" || savedTheme === "light") {
          setColorScheme(savedTheme);
        } else {
          setColorScheme("system");
        }
      } catch (e) {
        console.error("Failed to load theme preference", e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadTheme();
  }, []);

  const setTheme = async (theme: "light" | "dark" | "system") => {
    try {
      await AsyncStorage.setItem(THEME_KEY, theme);
      setColorScheme(theme);
    } catch (e) {
      console.error("Failed to save theme preference", e);
    }
  };

  return { theme: colorScheme, setTheme, isLoaded };
};
