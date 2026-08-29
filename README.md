# Brainwing Interactive Project Map

Production-oriented React + Three.js + GSAP + Tailwind starter for Brainwing.in.

## Run

```bash
npm install
npm run dev
```

Open the local Vite URL.

## Stack

- React + Vite
- Tailwind CSS
- Three.js / React Three Fiber
- GLSL shaders
- GSAP + ScrollTrigger
- Zustand
- Lucide React

## Architecture

Earth → India → City → Project.

The city layer is data-driven, so new cities/projects can be added in `src/data`.

## Assets

The starter is intentionally asset-light. The Earth is rendered procedurally with GLSL and the map is a clean vector-style presentation, so the project runs without downloading proprietary map imagery.

When Brainwing's real project images are ready, place them under:

`public/assets/projects/<city>/`

Then update the project records in `src/data/projects.js`.

## Production notes

For a production deployment, connect the city layer to a licensed/custom map source when exact road/building geometry is required. Keep API keys in environment variables.
