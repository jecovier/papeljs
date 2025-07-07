/** @type {import('tailwindcss').Config} */
import colors from "tailwindcss/colors";

export default {
  content: ["src/**/*.{html,js,ts}"],
  theme: {
    extend: {
      colors: {
        primary: colors.purple,
        accent: colors.orange,
        gray: colors.zinc,
      },
      screens: {
        xs: "420px",
      },
    },
  },
  plugins: [],
};
