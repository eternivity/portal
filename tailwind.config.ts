import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          50: "#EEEDFE",
          100: "#CECBF6",
          200: "#AFA9EC",
          400: "#7F77DD",
          600: "#534AB7",
          800: "#3C3489",
          900: "#26215C"
        },
        teal: {
          50: "#E1F5EE",
          400: "#1D9E75",
          600: "#0F6E56"
        },
        amber: {
          50: "#FAEEDA",
          400: "#EF9F27",
          600: "#854F0B"
        },
        coral: {
          50: "#FAECE7",
          400: "#D85A30",
          600: "#D85A30"
        },
        gray: {
          50: "#F1EFE8",
          200: "#DAD8D1",
          400: "#888780",
          600: "#5F5E5A"
        },
        blue: {
          200: "#85B7EB"
        },
        pink: {
          200: "#ED93B1"
        },
        "bg-page": "#F4F3F0",
        "bg-surface": "#FFFFFF",
        "bg-secondary": "#F7F6F3",
        border: "rgba(0,0,0,0.10)",
        "text-primary": "#1A1A1A",
        "text-secondary": "#6B6A66",
        "text-hint": "#9E9D99"
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "DM Sans", "sans-serif"]
      },
      borderWidth: {
        DEFAULT: "0.5px",
        0.5: "0.5px"
      },
      borderRadius: {
        xl: "12px",
        lg: "8px",
        full: "999px"
      },
      fontSize: {
        label: ["11px", { lineHeight: "1.6", letterSpacing: "0.06em" }],
        body: ["14px", { lineHeight: "1.6" }]
      },
      boxShadow: {
        none: "none"
      }
    }
  },
  plugins: []
};

export default config;
