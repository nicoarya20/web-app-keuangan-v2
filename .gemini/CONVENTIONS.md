# Coding Conventions

## General Rules
- **TypeScript**: Always use strict typing. Avoid `any`.
- **Naming**:
  - Components: PascalCase (e.g., `WalletCard.tsx`).
  - Functions/Variables: camelCase.
  - Constants: UPPER_SNAKE_CASE.
- **File Organization**: One component per file. Group related components in subdirectories.

## React Patterns
- **Functional Components**: Use arrow functions or `function` declarations consistently.
- **Hooks**: Use custom hooks to extract complex logic from components.
- **Props**: Destructure props in the function signature.
- **Performance**: Use `useMemo` and `useCallback` sparingly, only when performance issues are identified.

## Styling (Tailwind)
- Group classes logically (Layout -> Box Model -> Typography -> Visuals -> Interaction).
- Use `cn()` utility (from `src/app/components/ui/utils.ts`) for conditional class merging.

## API Integration
- All API calls must go through the `api` instance exported from `src/utils/api.ts`.
- Handle loading and error states gracefully in the UI.

## State Management
- Use `useState` for local component state.
- Use `AuthContext` for global user authentication state.
- Avoid prop drilling; use Context for deeply nested state that needs to be shared.
