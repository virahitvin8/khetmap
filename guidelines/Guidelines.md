# KhetMap Guidelines

## Tech Stack
- **Framework**: Vite + React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **Routing**: react-router v7
- **State**: localStorage (no backend required)
- **Maps**: Leaflet + react-leaflet
- **Icons**: lucide-react

## Project Structure
```
src/
  app/           - Pages and components
  services/      - API integrations, localStorage database
  contexts/      - React contexts
  styles/        - CSS files
  constants/     - Constants and config
```

## Conventions
- Use Tailwind utility classes (no CSS modules)
- Use lucide-react for icons
- Use sonner for toast notifications
- Components in PascalCase
- Files in kebab-case or PascalCase
- No backend required — app works fully offline
- Fields saved to localStorage under key `khetmap-farms`
