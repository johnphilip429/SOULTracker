# SoulTrack Aligned

A minimalist, privacy-focused "lifestyle anchor" app helping you stay aligned with your core values (Faith, Fitness, Career, Personal Growth).

## Features

- **Daily Anchors (Habits)**: Track daily habits with gentle streaks.
- **Morning & Evening Check-ins**: Guided prompts to start and end your day intentionally.
- **Faith Mode**: Optional Bible verses and spiritual prompts.
- **Goals Tracking**: Define and focus on key life goals.
- **Analytics**: Visualize your consistency and alignment score.
- **Offline First**: All data lives in your browser's LocalStorage. No accounts, no tracking.
- **Mobile First Design**: Optimized for phone usage with "App-like" feel.

## Tech Stack
- React (Vite)
- Tailwind CSS
- Zustand (State Management + Persistence)
- Framer Motion (Animations)
- Recharts (Analytics)

## Setup & Running

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Dev Server**
   ```bash
   npm run dev
   ```
   Open http://localhost:5173 to view the app.

3. **Build for Production**
   ```bash
   npm run build
   ```
   The output moves to `dist/`.

## Deployment (Netlify / GitHub Pages)

### Netlify (Recommended)
1. Drag and drop the `dist` folder into Netlify Drop.
2. OR connect your GitHub repo and set:
   - Build Command: `npm run build`
   - Publish Directory: `dist`

### GitHub Pages
1. Install gh-pages: `npm install -D gh-pages`
2. Add to `package.json`: `"homepage": "https://<user>.github.io/<repo>"`
3. Add script: `"deploy": "gh-pages -d dist"`
4. Run `npm run deploy`

## License
MIT
