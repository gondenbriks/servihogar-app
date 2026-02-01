import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./screens/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                primary: "var(--primary)",
                "accent-blue": "var(--accent-blue)",
                "accent-green": "var(--accent-green)",
                surface: "var(--surface)",
                border: "var(--border)",
                neon: {
                    blue: '#00f3ff',
                    cyan: '#00e5ff',
                    green: '#39ff14',
                    purple: '#bc13fe',
                    dark: '#050505',
                }
            },
            fontFamily: {
                outfit: ["var(--font-outfit)", "sans-serif"],
            },
        },
    },
    plugins: [],
};
export default config;
