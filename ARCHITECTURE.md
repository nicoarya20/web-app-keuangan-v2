# ARCHITECTURE

This project follows a modern web architecture using **React** for the frontend and **Supabase** for the backend.

## 📂 Directory Structure

- `src/`: Frontend source code.
  - `app/`: Main application logic.
    - `pages/`: Route-level components.
    - `components/`: UI and layout building blocks.
    - `routes.tsx`: Navigation configuration.
  - `contexts/`: Global state (Auth).
  - `utils/`: Helpers and API client.
- `supabase/`: Backend logic and configurations.
  - `functions/`: Edge functions (Deno/TypeScript).
- `public/`: Static assets.

## 🛠 Tech Stack

- **Frontend**: React, Vite, Tailwind CSS 4, Radix UI.
- **Backend**: Supabase (PostgreSQL, Edge Functions, Auth).
- **Icons & Motion**: Lucide React, Framer Motion.

## 🔗 Key Links
- Detailed architecture: [.gemini/ARCHITECTURE.md](./.gemini/ARCHITECTURE.md)
- Design system: [.gemini/DESIGN.md](./.gemini/DESIGN.md)
- Conventions: [.gemini/CONVENTIONS.md](./.gemini/CONVENTIONS.md)

---
*For AI agents: Please read `.gemini/GEMINI.md` as the entry point for more detailed information.*
