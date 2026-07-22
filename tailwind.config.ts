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
        page: "#FFFFFF",
        soft: "#F7F8FA",
        ink: "#1A1D23",
        muted: "#6B7280",
        accent: {
          DEFAULT: "#6B4EFF",
          dark: "#5638E0",
        },
        teal: {
          DEFAULT: "#0FB5A6",
          dark: "#0C9A8D",
        },
        border: "#E8EAED",
        sidebar: {
          DEFAULT: "#0D0F14",
          muted: "#C7CDD6",
          nav: "#AEB6C2",
          subtle: "#6E7686",
          footer: "#5C6473",
        },
        status: {
          applied: "#6B4EFF",
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
        serif: ["var(--font-instrument-serif)", "Georgia", "serif"],
      },
      boxShadow: {
        accent: "0 4px 14px rgba(107, 78, 255, 0.28)",
        soft: "0 1px 2px rgba(26, 29, 35, 0.04), 0 8px 24px rgba(26, 29, 35, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
