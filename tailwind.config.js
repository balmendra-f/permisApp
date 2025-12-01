/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4f46e5", // Indigo 600
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#f1f5f9", // Slate 100
          foreground: "#0f172a", // Slate 900
        },
        destructive: {
          DEFAULT: "#ef4444", // Red 500
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#f1f5f9", // Slate 100
          foreground: "#64748b", // Slate 500
        },
        accent: {
          DEFAULT: "#f1f5f9", // Slate 100
          foreground: "#0f172a", // Slate 900
        },
        popover: {
          DEFAULT: "#ffffff",
          foreground: "#0f172a",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#0f172a",
        },
        background: "#f8fafc", // Slate 50
        border: "#e2e8f0", // Slate 200
        input: "#e2e8f0", // Slate 200
        ring: "#4f46e5", // Indigo 600
      },
    },
  },
  plugins: [],
}
