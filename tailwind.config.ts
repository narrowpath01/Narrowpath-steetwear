// tailwind.config.ts
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
        street: {
          yellow: "#FFB82B",
          orange: "#FF5126",
          pink: "#FC0A7E",
          purple: "#7E34F6",
          blue: "#1B84FF",
        }
      },
    },
  },
  plugins: [],
};
export default config;