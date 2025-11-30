# Zyx Discord Bot Dashboard

## Overview

Zyx is a Discord bot dashboard application for managing server moderation, ticketing systems, and server analytics. The platform provides Discord server owners with a web-based interface to configure and monitor their bot's functionality across multiple Discord servers.

The application features a landing page for user acquisition, an authenticated dashboard for server management, and specific configuration pages for moderation settings and ticket management. Built with a modern tech stack, it emphasizes professional design, Discord ecosystem integration, and user-friendly server administration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Tooling:**
- React 18+ with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for client-side routing (lightweight alternative to React Router)
- TanStack Query (React Query) for server state management and caching

**UI Component System:**
- Shadcn UI component library (Radix UI primitives with Tailwind styling)
- "New York" style variant configured in components.json
- Custom design system following Discord-inspired aesthetics with modern polish
- Tailwind CSS for utility-first styling with custom CSS variables for theming

**Design System:**
- Typography: Inter (body text) and Space Grotesk (headings/branding) from Google Fonts
- Dark/light theme support with system preference detection
- Custom color palette in HSL format for Discord-like appearance
- Responsive design with mobile-first approach

**State Management:**
- React Query for server state, API caching, and data synchronization
- React Context for theme management (ThemeProvider)
- Local component state with React hooks
- Session-based authentication state tracked via API queries

**Page Structure:**
- Landing page: Public marketing page with Discord login
- Dashboard pages: Protected routes requiring authentication
  - Overview (stats and activity)
  - Moderation (mod settings configuration)
  - Tickets (ticket system configuration)
  - Settings (user profile and preferences)
- Sidebar navigation with collapsible/expandable states
- Not found page for unhandled routes

### Backend Architecture

**Server Framework:**
- Express.js as the HTTP server
- HTTP server wrapping Express for potential WebSocket upgrades
- TypeScript throughout the backend codebase

**Authentication & Sessions:**
- OpenID Connect (OIDC) authentication via Replit Auth
- Passport.js for authentication strategy handling
- Session management using express-session with PostgreSQL session store (connect-pg-simple)
- Session cookies configured for production security (httpOnly, secure in production, sameSite)
- 7-day session TTL (time-to-live)

**API Design:**
- RESTful API endpoints under `/api` prefix
- Authentication middleware (`isAuthenticated`) protecting dashboard endpoints
- Error handling with structured JSON responses
- Request/response logging middleware for observability

**Business Logic Layer:**
- Storage abstraction (IStorage interface) separating data access from routes
- DatabaseStorage implementation using Drizzle ORM
- Service methods for:
  - User management (getUser, upsertUser)
  - Server management (getServers, getServersByOwner, upsertServer)
  - Moderation settings (getModSettings, upsertModSettings)
  - Ticket configuration (getTicketSettings, upsertTicketSettings)
  - Ticket operations (getTickets, createTicket, closeTicket)
  - Moderation actions tracking (getModActions, getModActionsToday, createModAction)

### Data Storage

**Database:**
- PostgreSQL via Neon serverless database
- Connection pooling with @neondatabase/serverless
- WebSocket-based connection for serverless environments

**ORM & Schema:**
- Drizzle ORM for type-safe database queries
- Schema definition in TypeScript (shared/schema.ts)
- Drizzle-Zod integration for runtime validation
- Database migrations managed by Drizzle Kit

**Data Models:**
- Sessions table: OIDC session storage with expiration tracking
- Users table: Replit user profiles (email, name, profile image)
- Servers table: Discord guild data (name, icon, owner, member count)
- Mod settings table: Per-server moderation configuration (enabled features, mod roles, log channel)
- Ticket settings table: Per-server ticket system configuration (enabled status, category, support roles, welcome message)
- Tickets table: Individual support tickets with status tracking
- Mod actions table: Audit log for moderation actions

**Schema Design Principles:**
- UUID primary keys for users
- Discord IDs (strings) as primary keys for servers
- Foreign key relationships linking servers to owners
- Timestamp tracking (createdAt, updatedAt) for audit trails
- JSONB fields for flexible configuration storage (sessions)
- Indexes on session expiration for cleanup efficiency

### Build & Deployment

**Development Mode:**
- Vite dev server with HMR (Hot Module Replacement)
- Vite middleware integration with Express
- Custom build script reloading HTML template with cache-busting
- Replit-specific plugins (cartographer, dev-banner, runtime-error-modal)

**Production Build:**
- Client: Vite builds to dist/public with optimized assets
- Server: esbuild bundles server code to single dist/index.cjs file
- Selective dependency bundling (allowlist) for faster cold starts
- External dependencies left unbundled for package manager resolution

**Path Aliases:**
- @/ → client/src (frontend code)
- @shared/ → shared (isomorphic code)
- @assets/ → attached_assets (static assets)

## External Dependencies

**Core Framework Dependencies:**
- React ecosystem: react, react-dom, @tanstack/react-query
- Routing: wouter (lightweight client-side routing)
- Backend: express, passport, passport-local
- Database: drizzle-orm, @neondatabase/serverless

**UI Component Libraries:**
- Radix UI primitives (@radix-ui/react-*) for accessible components
- Tailwind CSS for styling with PostCSS autoprefixer
- class-variance-authority for component variant management
- cmdk for command palette functionality

**Authentication Services:**
- Replit OpenID Connect (OIDC) for user authentication
- openid-client for OIDC protocol implementation
- connect-pg-simple for PostgreSQL session storage

**Database Services:**
- Neon PostgreSQL serverless database (via DATABASE_URL environment variable)
- Drizzle Kit for schema migrations and database push operations
- WebSocket support via ws package for Neon serverless connections

**Development Tools:**
- TypeScript for type safety
- Vite for development server and build tooling
- esbuild for server-side bundling
- ESLint/Prettier implied (common in TypeScript projects)

**Validation & Utilities:**
- Zod for runtime schema validation
- drizzle-zod for ORM-to-Zod schema generation
- date-fns for date manipulation
- nanoid for unique ID generation
- memoizee for OIDC config caching

**Environment Configuration:**
- DATABASE_URL: Neon PostgreSQL connection string
- SESSION_SECRET: Express session encryption key
- ISSUER_URL: OIDC provider URL (defaults to Replit)
- REPL_ID: Replit environment identifier
- NODE_ENV: Environment mode (development/production)