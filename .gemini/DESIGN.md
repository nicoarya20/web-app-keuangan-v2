# Design System

## Visual Identity
- **Primary Color**: Emerald 600 (`#059669`) - symbolizing growth and finance.
- **Secondary Colors**: Slate palette for text and backgrounds.
- **Typography**: Clean, sans-serif font stack.

## UI Principles
- **Modern & Minimal**: Focus on data visualization and clear calls to action.
- **Responsive**: Fully functional on mobile, tablet, and desktop.
- **Dark Mode**: Native support using the `dark` class on the `<html>` element.

## Design System Components (Shadcn/UI)
We use a customized version of Radix UI components styled with Tailwind CSS:
- **Buttons**: Varied by intent (Primary, Secondary, Outline, Ghost, Destructive).
- **Cards**: Used for grouping data sections on the dashboard and lists.
- **Dialogs/Drawers**: Used for forms and detailed views.
- **Charts**: Interactive line, bar, and pie charts using Recharts.

## Styling Rules
- Use Tailwind CSS utility classes exclusively.
- Prefer Flexbox and Grid for layouts.
- Maintain consistent spacing using the standard Tailwind spacing scale.
- Animations should be subtle (using Framer Motion) to enhance the user experience without being distracting.
