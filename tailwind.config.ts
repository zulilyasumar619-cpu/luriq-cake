import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#F8F1E9",
        coffee: "#5C4033",
        caramel: "#8B5E3C",
        sand: "#EDE4D9",
      },
    },
  },
  plugins: [],
};
export default config;
