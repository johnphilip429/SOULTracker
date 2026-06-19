/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // ── Snowy Mountain design tokens ──
                snow: {
                    page:      '#060D1A',
                    surface:   '#0D1A2E',
                    card:      '#101E32',
                    primary:   '#EEF2FF',
                    secondary: '#8BACC8',
                    muted:     '#4D6882',
                    gold:      '#F0C060',
                },
                category: {
                    gaming: '#A855F7',
                    office: '#3B82F6',
                    faith:  '#F59E0B',
                    gym:    '#14B8A6',
                },
                // ── Legacy aliases → dark equivalents (keeps other pages rendering) ──
                primary:    '#8BACC8',
                secondary:  '#4D6882',
                background: '#060D1A',
                surface:    '#0D1A2E',
                text: {
                    main:  '#EEF2FF',
                    muted: '#4D6882',
                },
                accent: '#F0C060',
            },
            fontFamily: {
                sans:    ['Manrope', 'sans-serif'],
                serif:   ['Georgia', 'serif'],
                display: ['Georgia', 'serif'],
            },
            borderRadius: {
                'xl':  '1rem',
                '2xl': '1.5rem',
                '3xl': '2rem',
            },
            boxShadow: {
                soft: "0 4px 24px rgba(0,0,0,0.4)",
                lift: "0 8px 32px rgba(0,0,0,0.5)",
            },
        },
    },
    plugins: [],
}
