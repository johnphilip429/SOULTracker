/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#5C8D89", // Soft Teal
                secondary: "#749AA8", // Calm Blue
                background: "#F7F6F2", // Off-white/Cream
                surface: "#FFFFFF",
                text: {
                    main: "#2C3333", // Dark Charcoal
                    muted: "#6B7280",
                },
                accent: "#E8B4B8", // Muted Pink/Coral (optional)
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
                '3xl': '2rem',
            }
        },
    },
    plugins: [],
}
