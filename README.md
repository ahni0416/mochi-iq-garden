# Mochi’s IQ Garden

A mobile-friendly browser game built with React and Vite. Player progress is saved in the current browser using `localStorage`. No account, backend, or API key is required.

## Install

Requires Node.js and npm.

```sh
npm ci
```

## Run locally

```sh
npm run dev
```

Open the localhost URL printed by Vite. On macOS, you can also open `start-game.command`.

## Build and preview

```sh
npm run build
npm run preview
```

Vite writes the production site to `dist/`.

## Deploy to Vercel

1. Push the project to a GitHub repository.
2. Import that repository in Vercel.
3. Use the Vite framework preset, build command `npm run build`, and output directory `dist`.
4. Deploy. No environment variables are needed.

The app uses a single page with in-app state navigation, so it does not need route rewrite configuration.
