/** @type {import('tailwindcss').Config} */
export default {
    darkMode: "class",
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            "colors": {
                "on-background": "#1a1c1c",
                "tertiary": "#5d5d67",
                "surface-variant": "#e2e2e2",
                "inverse-on-surface": "#f0f1f1",
                "on-error-container": "#93000a",
                "surface": "#f9f9f9",
                "tertiary-container": "#a2a1ac",
                "inverse-surface": "#2f3131",
                "surface-container-high": "#e8e8e8",
                "on-secondary": "#ffffff",
                "on-primary-fixed-variant": "#00522e",
                "on-primary-container": "#004224",
                "surface-container-highest": "#e2e2e2",
                "on-tertiary-fixed": "#1a1b23",
                "on-tertiary-container": "#373841",
                "surface-container": "#eeeeee",
                "surface-bright": "#f9f9f9",
                "on-secondary-container": "#655c7d",
                "primary": "#006d3e",
                "tertiary-fixed": "#e3e1ed",
                "on-tertiary": "#ffffff",
                "background": "#f9f9f9",
                "secondary-container": "#e3d7fe",
                "surface-dim": "#dadada",
                "on-secondary-fixed-variant": "#4a4261",
                "secondary-fixed": "#e8ddff",
                "primary-fixed": "#7afbae",
                "on-surface": "#1a1c1c",
                "surface-container-lowest": "#ffffff",
                "error-container": "#ffdad6",
                "primary-fixed-dim": "#5cde94",
                "on-primary": "#ffffff",
                "on-error": "#ffffff",
                "tertiary-fixed-dim": "#c7c5d1",
                "on-tertiary-fixed-variant": "#46464f",
                "on-surface-variant": "#3d4a40",
                "inverse-primary": "#5cde94",
                "secondary-fixed-dim": "#ccc1e7",
                "on-secondary-fixed": "#1e1734",
                "outline-variant": "#bccabd",
                "on-primary-fixed": "#00210f",
                "surface-container-low": "#f3f3f3",
                "outline": "#6d7a6f",
                "surface-tint": "#006d3e",
                "primary-container": "#2eb872",
                "secondary": "#625a7a",
                "error": "#ba1a1a"
            },
            "borderRadius": {
                "DEFAULT": "0.25rem",
                "lg": "0.5rem",
                "xl": "0.75rem",
                "full": "9999px"
            },
            "spacing": {
                "unit": "8px",
                "margin-mobile": "16px",
                "container-max-width": "1280px",
                "gutter": "24px",
                "margin-desktop": "40px"
            },
            "fontFamily": {
                "label-md": ["Inter", "sans-serif"],
                "headline-md": ["Inter", "sans-serif"],
                "body-lg": ["Inter", "sans-serif"],
                "label-sm": ["Inter", "sans-serif"],
                "display-lg-mobile": ["Inter", "sans-serif"],
                "headline-sm": ["Inter", "sans-serif"],
                "body-sm": ["Inter", "sans-serif"],
                "display-lg": ["Inter", "sans-serif"],
                "body-md": ["Inter", "sans-serif"]
            },
            "fontSize": {
                "label-md": ["14px", { "lineHeight": "20px", "letterSpacing": "0.01em", "fontWeight": "500" }],
                "headline-md": ["24px", { "lineHeight": "32px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
                "body-lg": ["18px", { "lineHeight": "28px", "fontWeight": "400" }],
                "label-sm": ["12px", { "lineHeight": "16px", "fontWeight": "600" }],
                "display-lg-mobile": ["36px", { "lineHeight": "44px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
                "headline-sm": ["20px", { "lineHeight": "28px", "fontWeight": "600" }],
                "body-sm": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
                "display-lg": ["48px", { "lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
                "body-md": ["16px", { "lineHeight": "24px", "fontWeight": "400" }]
            }
        }
    },
    plugins: []
}
