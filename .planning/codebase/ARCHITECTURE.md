# Architecture

## Pattern

This is a **single-page React application** using a component-based architecture with functional components.

### Architecture Type

- **SPA (Single Page Application)** - No routing library, all content on one page
- **Component-based** - UI built from reusable React components
- **Animation-driven** - Framer Motion for page transitions and interactions

## Layers

### 1. Entry Point
- `src/main.tsx` - React 19 client-side entry
- `index.html` - HTML entry with `<div id="root">`

### 2. Application Layer
- `src/App.tsx` - Main app component, manages loading state
- State management: React `useState` (local state only)

### 3. Component Layer
- `src/components/` - Reusable UI components
  - `Navbar` - Navigation
  - `MobileMenu` - Mobile navigation
  - `SkillsSection` - Skills display
  - `ContactSection` - Contact form/info
  - `LoadingScreen` - Initial loading animation

### 4. Animation Layer
- `src/animations/variants.ts` - Framer Motion animation variants
- Used for page transitions and micro-interactions

### 5. Styling Layer
- Tailwind CSS 4 via `src/index.css`
- No CSS-in-JS, pure utility classes

## Data Flow

```
User Action → React State Change → Re-render → Animation/UI Update
```

### State Management

- **Local component state** via `useState`
- **No global state** (no Redux, Zustand, Context)
- **Loading state** in `App.tsx` controls initial loading screen

## Abstractions

### Animation Abstraction
- `src/animations/variants.ts` centralizes animation configs
- Reusable variants imported by components

### Component Patterns
- Named exports for complex components (`SkillsSection`)
- Default exports for simpler components (`App`, `ContactSection`)

## Entry Points

| File | Purpose |
|------|---------|
| `index.html` | HTML entry, loads `main.tsx` |
| `src/main.tsx` | React DOM render, mounts `<App />` |
| `src/App.tsx` | Main application component |

## Build & Test Entry

- **Dev**: `npm run dev` → Vite dev server
- **Build**: `npm run build` → TypeScript compile + Vite build
- **Test**: `npm run test` → Vitest run
- **Lint**: `npm run lint` → ESLint