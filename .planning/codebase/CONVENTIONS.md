# Coding Conventions

## Code Style

### TypeScript

- Use explicit types for function parameters and return values where beneficial
- Use `interface` for object shapes, `type` for unions/aliases
- Enable `strict: true` in tsconfig (TypeScript ~6.0.2)

### React Patterns

- **Functional components** with hooks (no class components)
- **Named exports** for complex/reusable components: `export function SkillsSection()`
- **Default exports** for single-use components: `export default App`
- **Hooks usage**: `useState`, `useEffect` as needed

### File Organization

- One component per file
- Co-located tests: `Component.tsx` + `Component.test.tsx`
- Group related code in directories (`src/components/`)

## Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Components | PascalCase | `Navbar.tsx`, `ContactSection.tsx` |
| Functions | camelCase | `onComplete`, `handleClick` |
| Constants | PascalCase (if component-like) or SCREAMING_SNAKE | `VARIANTS`, `AnimationConfig` |
| File names | kebab-case | `variants.ts`, `setup.ts` |
| CSS classes | Tailwind utilities | `className="flex justify-center"` |

## Error Handling

- **No try/catch** in this simple codebase (no API calls)
- **Component error boundaries** - not implemented (may be needed for production)
- **TypeScript** catches type errors at compile time

## Patterns

### State Management
```typescript
const [state, setState] = useState(initialValue)
```

### Animation Variants
```typescript
// In src/animations/variants.ts
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
}
```

### Component Props
```typescript
interface Props {
  onComplete?: () => void
  className?: string
}

export function Component({ onComplete, className }: Props) { ... }
```

### Conditional Rendering
```typescript
{condition && <Component />}
```

## ESLint Rules

Configured in `eslint.config.js`:
- **react-refresh** - Validate components are safe for HMR
- **react-hooks** - Enforce rules of hooks
- **no-unused-vars** - Catch unused variables

## Import Order

1. React/framework imports
2. External library imports (framer-motion)
3. Internal imports (components, utils)
4. CSS imports

Example:
```typescript
import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import './index.css'
import LoadingScreen from './components/LoadingScreen'
import Navbar from './components/Navbar'
```

## Tailwind CSS Usage

- Use utility classes in `className` props
- Custom styles in `src/index.css` only for:
  - Tailwind directives (`@tailwind base`, etc.)
  - Global overrides if needed
- No custom CSS files per component