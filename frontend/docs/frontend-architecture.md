# Frontend Architecture

## Overview

The Hybrid SOC Dashboard frontend is built with a modular, scalable architecture following modern React best practices. The application is designed for realtime security monitoring with enterprise-grade performance and maintainability.

## Project Structure

```
src/
├── api/           # API service layer with interceptors
├── assets/        # Static assets (images, icons, fonts)
├── components/    # Reusable UI components
│   ├── common/    # Generic components (Button, Modal, etc.)
│   ├── layout/    # Layout-specific components
│   └── ui/        # UI-specific components
├── features/      # Feature-based modules
│   ├── auth/      # Authentication feature
│   ├── dashboard/ # Dashboard feature
│   └── alerts/    # Alert management feature
├── hooks/         # Custom React hooks
│   ├── useAuth.ts # Authentication hook
│   ├── useWebSocket.ts # WebSocket hook
│   └── useLocalStorage.ts # Storage hook
├── layouts/       # Page layout components
│   ├── MainLayout.tsx
│   └── AuthLayout.tsx
├── pages/         # Page components (routes)
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   └── NotFoundPage.tsx
├── routes/        # Routing configuration
│   ├── index.tsx  # Route definitions
│   └── guards/    # Route guards
├── services/      # Business logic services
│   ├── authService.ts
│   ├── alertService.ts
│   └── websocketService.ts
├── sockets/       # WebSocket management
│   ├── index.ts   # WebSocket service
│   └── events.ts  # Event handlers
├── store/         # State management
│   ├── authStore.ts
│   ├── alertStore.ts
│   ├── systemStore.ts
│   └── index.ts   # Store exports
├── types/         # TypeScript type definitions
│   ├── api.ts     # API response types
│   ├── common.ts  # Common types
│   └── index.ts   # Type exports
├── utils/         # Utility functions
│   ├── constants.ts
│   ├── helpers.ts
│   └── validation.ts
└── styles/        # Global styles
    ├── index.css  # Main stylesheet
    ├── theme.css  # Theme variables
    └── components.css # Component styles
```

## Architecture Principles

### 1. Feature-Based Architecture
- Each feature is self-contained with its own components, hooks, and services
- Clear separation of concerns
- Easy to maintain and scale

### 2. Component Composition
- Reusable components with clear APIs
- Composition over inheritance
- Props-based configuration

### 3. State Management
- Global state with Zustand stores
- Local state with React hooks
- Server state with React Query

### 4. API Layer
- Centralized API service with interceptors
- Automatic token injection
- Error handling and retry logic

### 5. WebSocket Integration
- Realtime data with Socket.IO
- Auto-reconnect with exponential backoff
- Event-driven architecture

## Component Patterns

### Container/Presentational Pattern
```tsx
// Container component (logic)
const AlertFeedContainer = () => {
  const { alerts, loading } = useAlerts()
  return <AlertFeed alerts={alerts} loading={loading} />
}

// Presentational component (UI)
const AlertFeed = ({ alerts, loading }) => {
  if (loading) return <Spinner />
  return (
    <div>
      {alerts.map(alert => <AlertItem key={alert.id} alert={alert} />)}
    </div>
  )
}
```

### Custom Hooks Pattern
```tsx
const useAlerts = () => {
  const { data: alerts, isLoading } = useQuery('alerts', fetchAlerts)
  const { addAlert } = useAlertStore()

  return {
    alerts: data || [],
    loading: isLoading,
    addAlert
  }
}
```

### Compound Components Pattern
```tsx
const Modal = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {isOpen && (
        <ModalBackdrop onClick={() => setIsOpen(false)}>
          <ModalContent>{children}</ModalContent>
        </ModalBackdrop>
      )}
    </>
  )
}

Modal.Header = ({ children }) => <ModalHeader>{children}</ModalHeader>
Modal.Body = ({ children }) => <ModalBody>{children}</ModalBody>
Modal.Footer = ({ children }) => <ModalFooter>{children}</ModalFooter>
```

## State Management

### Global State (Zustand)
- Authentication state
- System status
- Alert filters
- Theme preferences

### Server State (React Query)
- API data fetching
- Caching and synchronization
- Background updates
- Optimistic updates

### Local State (React Hooks)
- UI state (modals, forms)
- Component-specific state
- Temporary state

## Performance Optimizations

### Code Splitting
- Route-based splitting with React.lazy
- Component-based splitting for large components
- Vendor chunk separation

### Memoization
- React.memo for components
- useMemo for expensive calculations
- useCallback for event handlers

### Virtualization
- Virtual scrolling for large lists
- Windowing for table components
- Lazy loading for images

### Bundle Optimization
- Tree shaking
- Dead code elimination
- Asset optimization

## Security Considerations

### Authentication
- JWT token management
- Secure token storage
- Automatic token refresh
- Route protection

### API Security
- Request/response interceptors
- CSRF protection
- Rate limiting
- Input validation

### WebSocket Security
- Authentication tokens
- Origin validation
- Message validation
- Connection limits

## Testing Strategy

### Unit Tests
- Component testing with React Testing Library
- Hook testing with custom renderers
- Utility function testing

### Integration Tests
- API integration testing
- WebSocket integration testing
- State management testing

### E2E Tests
- Critical user journey testing
- Cross-browser testing
- Performance testing

## Deployment

### Development
- Hot module replacement
- Fast refresh
- Development server with proxy

### Production
- Static asset optimization
- Code minification
- CDN deployment
- Docker containerization

### Monitoring
- Error tracking
- Performance monitoring
- User analytics
- Log aggregation