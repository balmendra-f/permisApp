/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#4f46e5'; // Indigo 600
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#0f172a', // Slate 900
    background: '#f8fafc', // Slate 50
    tint: tintColorLight,
    icon: '#64748b', // Slate 500
    tabIconDefault: '#94a3b8', // Slate 400
    tabIconSelected: tintColorLight,
    border: '#e2e8f0', // Slate 200
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    border: '#333',
  },
};
