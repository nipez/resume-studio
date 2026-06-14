import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        page: "#F5F6F8",
        ink: "#0E1116",
        muted: "#5A6573",
        accent: {
          DEFAULT: "#2F6BFF",
          dark: "#1E54E6",
        },
        border: "#E6E8EC",
        sidebar: {
          DEFAULT: "#0D0F14",
          muted: "#C7CDD6",
          nav: "#AEB6C2",
          subtle: "#6E7686",
          footer: "#5C6473",
        },
        status: {
          applied: "#1E54E6",
          response: "#0C7C8C",
          interview: "#9A6212",
          offer: "#0E7C4B",
          rejected: "#B23B3B",
          ghosted: "#8A92A0",
        },
      },
      fontFamily: {
        sans: ["var(--font-instrument-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        accent: "0 4px 14px rgba(47, 107, 255, 0.32)",
      },
    },
  },
  plugins: [],
};

export default config;
