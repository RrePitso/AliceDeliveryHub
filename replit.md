# Overview

This is a multi-vendor delivery management system called "DeliveryHub" built with React frontend and Express.js backend. The application supports four user roles: customers (who browse and order food), vendors (who manage restaurants and menus), drivers (who deliver orders), and admins (who oversee the entire platform). The system provides role-based dashboards and handles the complete order lifecycle from placement to delivery.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for build tooling
- **Routing**: Wouter for client-side routing with role-based dashboard routing
- **State Management**: TanStack Query (React Query) for server state management and API caching
- **UI Framework**: Custom component library built on Radix UI primitives with Tailwind CSS for styling
- **Form Handling**: React Hook Form with Zod validation schemas
- **Authentication**: Session-based authentication with automatic redirect handling

## Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Replit OpenID Connect (OIDC) integration with session management
- **Database Connection**: Neon serverless PostgreSQL with connection pooling
- **Session Storage**: PostgreSQL-backed session store using connect-pg-simple

## Database Design
- **ORM**: Drizzle ORM with PostgreSQL dialect providing type-safe database operations
- **Schema**: Comprehensive relational schema including users, vendors, menu items, orders, drivers, and sessions tables
- **Migrations**: Database migrations managed through Drizzle Kit
- **Relationships**: Proper foreign key relationships between entities (users-vendors, vendors-menu items, orders-users-drivers)

## Authentication & Authorization
- **Provider**: Replit OIDC for secure authentication
- **Session Management**: Server-side sessions stored in PostgreSQL with automatic expiration
- **Role-Based Access**: User roles (customer, vendor, driver, admin) determine dashboard access and API permissions
- **Middleware**: Authentication middleware protects sensitive API endpoints

## API Architecture
- **Pattern**: RESTful API design with resource-based endpoints
- **Validation**: Request validation using Zod schemas shared between frontend and backend
- **Error Handling**: Centralized error handling with appropriate HTTP status codes
- **Real-time Updates**: Polling-based updates for order status and driver availability

## Development Environment
- **Build System**: Vite for fast development builds and hot module replacement
- **TypeScript**: Full TypeScript coverage across frontend, backend, and shared code
- **Path Aliases**: Configured path mapping for clean imports (@/, @shared/, @assets/)
- **Development Tools**: Runtime error overlay and Replit-specific development plugins

# External Dependencies

## Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Hook Form, TanStack Query for state management
- **Backend Framework**: Express.js with TypeScript support via tsx runtime
- **Database**: Neon serverless PostgreSQL with WebSocket support, Drizzle ORM for database operations
- **Authentication**: Replit OpenID Connect client with Passport.js integration

## UI and Styling
- **Component Library**: Extensive Radix UI primitive components for accessible UI elements
- **Styling**: Tailwind CSS with custom design system, PostCSS for processing
- **Utility Libraries**: clsx and tailwind-merge for conditional styling, class-variance-authority for component variants

## Development and Build Tools
- **Build Tooling**: Vite with React plugin, esbuild for production builds
- **TypeScript**: Full TypeScript configuration with path mapping and strict mode
- **Development**: Replit-specific plugins for cartographer and runtime error handling
- **Validation**: Zod for runtime type validation and schema generation

## Database and Session Management
- **Database Client**: Neon serverless client with WebSocket constructor override
- **Session Store**: connect-pg-simple for PostgreSQL session storage
- **Utilities**: date-fns for date manipulation, memoizee for caching

## Production Considerations
- The application is configured for deployment on Replit with specific environment variable requirements
- Database connection uses Neon serverless PostgreSQL for scalability
- Session management is production-ready with PostgreSQL storage and proper TTL handling