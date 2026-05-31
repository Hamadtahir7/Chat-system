/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg:       "#0f1117",
        surface:  "#161b22",
        sidebar:  "#13161d",
        card:     "#1c2128",
        input:    "#21262d",
        border:   "#30363d",
        blue:     "#2563A8",
        "blue-hover": "#1d4f8a",
        "blue-light": "#3b82f6",
        sent:     "#2563A8",
        recv:     "#21262d",
        primary:  "#e6edf3",
        muted:    "#8b949e",
        online:   "#3fb950",
        offline:  "#484f58",
      },
      fontFamily: {
        sans: ["'DM Sans'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
