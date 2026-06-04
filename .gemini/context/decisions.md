# Architecture Decision Records (ADR)

## ADR 1: Use of Supabase Edge Functions
- **Status**: Accepted
- **Context**: Need a scalable backend with minimal maintenance.
- **Decision**: Use Supabase Edge Functions for all business logic to leverage Deno's performance and tight integration with Supabase Auth and DB.
- **Consequences**: Logic is centralized and secure, but requires Deno knowledge.

## ADR 2: React Router 7 for Routing
- **Status**: Accepted
- **Context**: Need a robust routing solution with good TypeScript support.
- **Decision**: Adopt React Router 7 (latest stable) for client-side routing.
- **Consequences**: Access to new routing features and simplified navigation logic.

## ADR 3: Tailwind CSS 4
- **Status**: Accepted
- **Context**: Modern styling with high performance.
- **Decision**: Use Tailwind CSS 4 for utility-first styling.
- **Consequences**: Fast development cycle and small bundle sizes.
