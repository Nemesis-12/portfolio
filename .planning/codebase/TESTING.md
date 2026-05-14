# Testing

## Test Framework

- **Vitest** 4.1.5 - Vite-native testing framework
- **@testing-library/react** 16.3.2 - React component testing
- **@testing-library/jest-dom** 6.9.1 - DOM matchers (toBeInTheDocument, etc.)
- **@testing-library/user-event** 14.6.1 - Simulate user interactions

## Test Files

### Location
- Co-located with source files in `src/`
- Test file suffix: `.test.ts` or `.test.tsx`

### Coverage

| File | Test File | Status |
|------|-----------|--------|
| `src/App.tsx` | `src/App.test.tsx` | ✓ |
| `src/animations/variants.ts` | `src/animations/variants.test.ts` | ✓ |
| `src/components/Navbar.tsx` | `src/components/Navbar.test.tsx` | ✓ |
| `src/components/LoadingScreen.tsx` | `src/components/LoadingScreen.test.tsx` | ✓ |
| `src/components/SkillsSection.tsx` | `src/components/SkillsSection.test.tsx` | ✓ |
| `src/components/ContactSection.tsx` | `src/components/ContactSection.test.tsx` | ✓ |

## Test Setup

### Configuration (`vite.config.ts`)
```typescript
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
})
```

### Setup File (`src/test/setup.ts`)
- Imports `@testing-library/jest-dom/vitest`
- Mocks `IntersectionObserver` for jsdom compatibility
- Uses `vi` from Vitest for mocking

## Running Tests

```bash
npm test           # Run tests once
npm run test:watch # Watch mode
```

## Testing Patterns

### Component Testing
```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName />)
    expect(screen.getByText('Expected')).toBeInTheDocument()
  })
})
```

### User Events
```typescript
import userEvent from '@testing-library/user-event'

await userEvent.click(screen.getByRole('button'))
await userEvent.type(screen.getByRole('textbox'), 'input')
```

### Async Testing
```typescript
it('calls onComplete after loading', async () => {
  const onComplete = vi.fn()
  render(<LoadingScreen onComplete={onComplete} />)
  
  // Wait for animation to complete
  await waitFor(() => {
    expect(onComplete).toHaveBeenCalled()
  })
})
```

### Mocking
```typescript
const onComplete = vi.fn() // Vitest mock function
```

## Mocking Notes

- **IntersectionObserver** - Already mocked in `setup.ts` for jsdom
- **No API mocking** - No external APIs to mock
- **No database mocking** - No data layer