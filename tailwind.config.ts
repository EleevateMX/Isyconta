import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta oficial Isyconta: azul royal (tronco/CTA) → navy (titulares)
        // + verde hoja como acento. Tomada del logo de la palmera.
        brand: {
          50: "#eff2fe",
          100: "#dde3fd",
          200: "#c2cbfb",
          300: "#9aa8f7",
          400: "#6f80f1",
          500: "#4d5ce8",
          600: "#3340d6", // CTA / royal (tronco ≈ #2323c7)
          700: "#2932b0",
          800: "#242c8a",
          900: "#1f2a6b", // navy de titulares y wordmark
          950: "#151b42",
        },
        accent: {
          50: "#eafbe8",
          400: "#4cbf3c",
          500: "#2fa82d", // verde de las hojas
          600: "#23901f",
          700: "#1c7a1a",
        },
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-syne)", "var(--font-dm-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
