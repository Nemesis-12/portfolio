# Technology Stack

## Languages & Runtime

- **TypeScript** (~6.0.2) - Primary language for application code
- **JavaScript** - Used in ESLint config and build tooling
- **CSS** - Tailwind CSS 4 for styling
- **Runtime**: Node.js (development), Browser (production)

## Core Frameworks

- **React** 19.2.6 - UI framework
- **React DOM** 19.2.6 - React rendering for DOM
- **Vite** 8.0.12 - Build tool and dev server

## Styling & Animation

- **Tailwind CSS** 4.3.0 - Utility-first CSS framework
- **@tailwindcss/vite** 4.3.0 - Tailwind Vite plugin
- **Framer Motion** 12.38.0 - Animation library for React

## Development & Testing

- **Vitest** 4.1.5 - Unit testing framework (Vite-native)
- **@testing-library/react** 16.3.2 - React component testing
- **@testing-library/jest-dom** 6.9.1 - Jest matchers for DOM
- **@testing-library/user-event** 14.6.1 - Simulate user events
- **jsdom** 29.1.1 - DOM implementation for Node.js
- **ESLint** 10.3.0 - Linting
- **eslint-plugin-react-hooks** 7.1.1 - React hooks linting
- **eslint-plugin-react-refresh** 0.5.2 - Hot reload safe linting

## Build Configuration

- **@vitejs/plugin-react** 6.0.1 - React Fast Refresh
- **@types/node** 24.12.3 - Node.js types
- **@types/react** 19.2.14 - React types
- **@types/react-dom** 19.2.3 - React DOM types

## Other Dependencies

- **dotenv** 17.4.2 - Environment variable loading
- **typescript** ~6.0.2 - TypeScript compiler
- **typescript-eslint** 8.59.2 - TypeScript ESLint support

## Configuration Files

- `tsconfig.json` - Base TypeScript config
- `tsconfig.app.json` - App-specific TypeScript config
- `tsconfig.node.json` - Node-specific TypeScript config
- `vite.config.ts` - Vite configuration with Vitest setup
- `eslint.config.js` - ESLint configuration
- `package.json` - Project dependencies and scripts
- `index.html` - Entry HTML file

## Available Scripts

```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest",
  "typecheck": "tsc -b"
}
```