# Directory Structure

## Project Root

```
portfolio/
├── .git/                   # Git repository
├── .gitignore              # Git ignore rules
├── .pi/                    # pi agent workspace
├── .planning/              # Planning documents
├── dist/                   # Built production files
├── node_modules/          # npm dependencies
├── public/                # Static assets
├── src/                    # Source code
├── eslint.config.js       # ESLint configuration
├── index.html             # HTML entry point
├── package.json           # Project config & deps
├── package-lock.json      # Locked dependencies
├── README.md              # Project readme
├── tsconfig.json          # TypeScript base config
├── tsconfig.app.json      # TypeScript app config
├── tsconfig.node.json     # TypeScript node config
└── vite.config.ts         # Vite configuration
```

## Source Code (`src/`)

```
src/
├── animations/            # Animation configurations
│   ├── variants.ts       # Framer Motion variants
│   └── variants.test.ts  # Animation tests
├── components/            # React components
│   ├── ContactSection.tsx       # Contact section component
│   ├── ContactSection.test.tsx  # Contact section tests
│   ├── LoadingScreen.tsx        # Loading screen component
│   ├── LoadingScreen.test.tsx   # Loading screen tests
│   ├── MobileMenu.tsx           # Mobile menu component
│   ├── Navbar.tsx               # Navigation bar
│   ├── Navbar.test.tsx          # Navbar tests
│   ├── SkillsSection.tsx        # Skills display component
│   └── SkillsSection.test.tsx   # Skills section tests
├── test/                  # Test utilities
│   └── setup.ts          # Vitest setup (mocking, globals)
├── App.tsx               # Main application component
├── App.test.tsx          # App component tests
├── index.css             # Global styles (Tailwind)
└── main.tsx              # React entry point
```

## Static Assets (`public/`)

```
public/
├── favicon.svg           # Site favicon
└── resume.pdf            # Resume file
```

## Key Locations

| Purpose | File Path |
|---------|-----------|
| Main component | `src/App.tsx` |
| Entry point | `src/main.tsx` |
| Styles | `src/index.css` |
| Animation configs | `src/animations/variants.ts` |
| Navbar component | `src/components/Navbar.tsx` |
| Vite config | `vite.config.ts` |
| Test setup | `src/test/setup.ts` |

## Naming Conventions

- **Components**: PascalCase (`Navbar.tsx`, `SkillsSection.tsx`)
- **Test files**: Same name + `.test.ts` or `.test.tsx` suffix
- **Animation variants**: `variants.ts`
- **Config files**: camelCase or kebab-case depending on tooling
- **CSS**: Tailwind utility classes in component files, global in `index.css`