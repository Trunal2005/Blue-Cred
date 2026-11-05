import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#ffffff",
        foreground: "#1a1a1a",
        primary: {
          DEFAULT: "#1f7a4d", // Forest green
          light: "#e6f5ec",   // Light green
          dark: "#145334",
        },
        forest: {
          DEFAULT: "#1f7a4d",
          dark: "#145334",
        },
        mint: "#e6f5ec",
        dark: "#1a1a1a",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
