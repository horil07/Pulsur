# Pulsar AI Challenge Platform - GitHub Copilot Instructions

## Project Context
This is a Next.js 14 TypeScript web application for an AI-powered challenge platform using Prisma ORM, PostgreSQL, and Tailwind CSS.

## Coding Guidelines

### TypeScript & Next.js
- Use TypeScript with strict mode enabled
- Implement proper type safety with interfaces and type guards
- Use Next.js 14 App Router conventions (`app/` directory)
- Follow React Server Components patterns where appropriate
- Use `'use client'` directive only when necessary for client-side features

### Styling & Responsive Design
- Use Tailwind CSS for all styling
- **Always implement mobile-first responsive design** - start with mobile layouts, enhance for desktop
- Design components to be mobile-friendly with touch-friendly interactions (minimum 44px touch targets)
- Use responsive breakpoints: `sm:`, `md:`, `lg:`, `xl:` for progressive enhancement
- Use semantic HTML5 elements
- Maintain consistent spacing using Tailwind's spacing scale
- Follow accessibility best practices (ARIA labels, proper contrast, keyboard navigation)

### Database & API
- Use Prisma ORM for database operations
- Implement proper error handling in API routes
- Use TypeScript interfaces for API request/response types
- Follow RESTful API conventions
- Validate inputs using proper type checking

### State Management
- Use React hooks (useState, useEffect, useContext) for state management
- Implement proper loading and error states
- Use optimistic updates where appropriate
- Handle async operations with proper error boundaries

### Authentication & Security
- Use NextAuth.js for authentication
- Implement proper session management
- Validate user permissions on both client and server
- Sanitize user inputs and prevent XSS attacks

### Code Quality
- Write self-documenting code with clear variable names
- Add JSDoc comments for complex functions
- Follow consistent naming conventions (camelCase for variables, PascalCase for components)
- **Keep components small and focused on single responsibility**
- **Build reusable components** - create flexible, configurable components that can be used across the application
- **Avoid code duplication** - extract common functionality into reusable functions and components
- **Follow modular coding practices** - organize code into logical modules and maintain clear separation of concerns
- Use proper error handling and logging

### File Organization
- Place React components in `src/components/`
- Use descriptive folder names and file names
- Keep related files together in feature-based folders
- **Create reusable components** in appropriate subdirectories (ui/, shared/, etc.)
- Export components using named exports
- Use index files for clean imports
- **Follow modular architecture** - group related functionality together

### Performance
- Implement proper loading states and skeleton screens
- Use React.memo() for expensive components
- Optimize images and assets
- Implement proper caching strategies
- Use dynamic imports for code splitting

### Component Reusability
- **Design components to be flexible and configurable** - use props for variations
- **Create base components** that can be extended (Button, Card, Modal, etc.)
- **Use composition over inheritance** - combine smaller components to build complex UIs
- **Extract common patterns** into custom hooks and utility functions
- **Make components mobile-friendly by default** with responsive breakpoints for desktop enhancement

## Key Patterns
- Always implement proper TypeScript types
- **Use mobile-first responsive design** with Tailwind classes (`sm:`, `md:`, `lg:` breakpoints)
- **Build reusable, configurable components** that accept props for customization
- **Extract common functionality** into shared utilities and hooks
- Follow Next.js App Router conventions
- Implement proper error handling
- Use semantic HTML elements
- Maintain accessibility standards
- **Avoid code duplication** by creating modular, composable components
